// =====================================================================
// What Cloudflare cost us, computed from usage — NOT read off an invoice.
// ---------------------------------------------------------------------
// Google writes its finished bill into BigQuery, so `gcpSpend.ts` reports the
// invoice a day late. Cloudflare publishes no such export: what it exposes is
// USAGE (bytes stored, operations performed), so this half is usage × the
// published rate. That makes it the same class of number as the AI line, not
// the Google line, and the digest says so on the line itself.
//
// Needs one secret, CF_ANALYTICS_TOKEN: an **Account** API token created inside
// the Mock Stream account with `Account Analytics: Read` + `Workers R2
// Storage: Read`. Without it this section simply does not appear.
//
// ⚠️ Verify any Cloudflare token's scope before trusting it. The other token on
// Davirbek's machine belongs to the PERSONAL account (603a6785…) and silently
// reports the wrong buckets — that mistake cost an afternoon in September.
// `GET /client/v4/accounts` with this token must return only Mock Stream.
//
// ⚠️ The analytics lag. A snapshot read at 20:50 did not yet contain objects
// written at 21:18, so a figure for "today" is always a little behind.
// =====================================================================

const TOKEN = Deno.env.get('CF_ANALYTICS_TOKEN') || '';
const ACCOUNT = Deno.env.get('CF_ACCOUNT_TAG') || '5ba79ef3e377250a69af22b372251686';

// Published R2 rates, 2026-09. Kept here rather than in a setting because they
// change about once a year; if that stops being true, move them to
// site_settings the way ai_price_table did.
const GB_MONTH_USD = 0.015;
const FREE_GB = 10;
const CLASS_A_PER_M = 4.50;   // writes, lists — free for the first 1,000,000/mo
const CLASS_B_PER_M = 0.36;   // reads        — free for the first 10,000,000/mo
const FREE_CLASS_A = 1_000_000;
const FREE_CLASS_B = 10_000_000;

// R2 calls these Class A. Everything else that appears in the operations
// dataset is billed as Class B.
const CLASS_A_ACTIONS = new Set([
  'PutObject', 'CopyObject', 'ListObjects', 'ListBuckets', 'CreateBucket',
  'PutBucketCors', 'PutBucketEncryption', 'PutBucketLifecycleConfiguration',
  'PutBucketNotificationConfiguration', 'CompleteMultipartUpload',
  'CreateMultipartUpload', 'UploadPart', 'ListMultipartUploads', 'ListParts',
  'AbortMultipartUpload', 'DeleteObject', 'DeleteObjects',
]);

export type CfUsage = {
  /** Storage cost for ONE day (the monthly rate spread over 30 days). */
  dayUsd: number;
  gb: number;
  objects: number;
  classA: number;
  classB: number;
  /** True while both operation classes are inside the free allowance. */
  opsFree: boolean;
  note?: string;
};

async function gql(query: string): Promise<any> {
  const r = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const j = await r.json();
  if (j.errors?.length) throw new Error(String(j.errors[0]?.message || 'graphql error').slice(0, 160));
  return j.data?.viewer?.accounts?.[0] ?? null;
}

export async function cfUsage(daysBack: number): Promise<CfUsage | null> {
  if (!TOKEN) return null;

  const since = new Date(Date.now() - Math.max(1, daysBack + 1) * 86_400_000).toISOString();

  try {
    // Storage is a level, not a flow: read the peak in the window rather than
    // summing, or a day with more samples would look bigger.
    //
    // Do NOT order by datetime here. Cloudflare's GraphQL only accepts an
    // orderBy field that is itself selected as a dimension or an aggregate, so
    // `orderBy: [datetime_DESC]` fails the whole query with "cannot order by
    // datetime: it is neither aggregated, nor a dimension" — which is exactly
    // what the 2026-09-12 digest printed where the Cloudflare figure should be.
    // With no dimensions and limit 1 the node already collapses the window into
    // a single row, and `max` takes the peak across it, so the ordering bought
    // nothing even when it parsed.
    const s = await gql(`{ viewer { accounts(filter: {accountTag: "${ACCOUNT}"}) {
      r2StorageAdaptiveGroups(limit: 1, filter: {datetime_geq: "${since}"}) {
        max { objectCount payloadSize }
      } } } }`);
    const top = s?.r2StorageAdaptiveGroups?.[0]?.max;
    if (!top) return { dayUsd: 0, gb: 0, objects: 0, classA: 0, classB: 0, opsFree: true,
                       note: 'no storage reading yet — the analytics lag behind by a few minutes' };

    const gb = Number(top.payloadSize || 0) / 1024 ** 3;
    const objects = Number(top.objectCount || 0);

    // Operations ARE a flow, so these are the window's totals.
    const o = await gql(`{ viewer { accounts(filter: {accountTag: "${ACCOUNT}"}) {
      r2OperationsAdaptiveGroups(limit: 100, filter: {datetime_geq: "${since}"}) {
        sum { requests } dimensions { actionType }
      } } } }`);
    let classA = 0, classB = 0;
    for (const row of (o?.r2OperationsAdaptiveGroups ?? [])) {
      const n = Number(row?.sum?.requests || 0);
      if (CLASS_A_ACTIONS.has(String(row?.dimensions?.actionType))) classA += n; else classB += n;
    }

    // The free allowances are monthly, so a single day is only comparable once
    // projected. Charging nothing while inside them is the honest reading.
    const opsFree = classA * 30 <= FREE_CLASS_A && classB * 30 <= FREE_CLASS_B;
    const billableGb = Math.max(0, gb - FREE_GB);
    const opsUsd = opsFree ? 0
      : Math.max(0, classA * 30 - FREE_CLASS_A) / 1e6 * CLASS_A_PER_M / 30 +
        Math.max(0, classB * 30 - FREE_CLASS_B) / 1e6 * CLASS_B_PER_M / 30;

    return {
      dayUsd: (billableGb * GB_MONTH_USD) / 30 + opsUsd,
      gb, objects, classA, classB, opsFree,
    };
  } catch (e) {
    return { dayUsd: 0, gb: 0, objects: 0, classA: 0, classB: 0, opsFree: true,
             note: String((e as any)?.message || e).slice(0, 160) };
  }
}

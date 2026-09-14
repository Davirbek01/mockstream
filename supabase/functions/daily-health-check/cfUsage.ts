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

const DAY_MS = 86_400_000;
const TASHKENT_MS = 5 * 3_600_000; // UTC+5 all year, no DST

export type CfUsage = {
  /** Cost attributable to the reported day: its share of the month's storage
   *  bill, plus any operations overage actually incurred during that day. */
  dayUsd: number;
  gb: number;
  objects: number;
  /** Month-to-date operation counts (calendar month, UTC — how R2 bills). */
  classA: number;
  classB: number;
  /** True while the month-to-date totals are inside both free allowances. */
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

/** Class A / Class B request totals for [from, to). */
async function opsBetween(from: number, to: number): Promise<{ a: number; b: number }> {
  if (to <= from) return { a: 0, b: 0 };
  const o = await gql(`{ viewer { accounts(filter: {accountTag: "${ACCOUNT}"}) {
    r2OperationsAdaptiveGroups(limit: 100, filter: {datetime_geq: "${new Date(from).toISOString()}", datetime_lt: "${new Date(to).toISOString()}"}) {
      sum { requests } dimensions { actionType }
    } } } }`);
  let a = 0, b = 0;
  for (const row of (o?.r2OperationsAdaptiveGroups ?? [])) {
    const n = Number(row?.sum?.requests || 0);
    if (CLASS_A_ACTIONS.has(String(row?.dimensions?.actionType))) a += n; else b += n;
  }
  return { a, b };
}

/** What the month's operations bill comes to once these many requests are in. */
function opsBill(a: number, b: number): number {
  return Math.max(0, a - FREE_CLASS_A) / 1e6 * CLASS_A_PER_M +
         Math.max(0, b - FREE_CLASS_B) / 1e6 * CLASS_B_PER_M;
}

export async function cfUsage(daysBack: number): Promise<CfUsage | null> {
  if (!TOKEN) return null;

  // The same day the rest of the digest reports: a Tashkent calendar day, as in
  // daily_health_snapshot. (This used to be a rolling window of daysBack+1 days
  // — 48 hours for the normal run — which is not the day on the report.)
  const todayT = Math.floor((Date.now() + TASHKENT_MS) / DAY_MS) * DAY_MS;
  const d0 = todayT - Math.max(0, daysBack) * DAY_MS - TASHKENT_MS;
  const d1 = d0 + DAY_MS;

  try {
    // Storage is a level, not a flow: read the peak in the day rather than
    // summing, or a day with more samples would look bigger.
    //
    // Do NOT order by datetime here. Cloudflare's GraphQL only accepts an
    // orderBy field that is itself selected as a dimension or an aggregate, so
    // `orderBy: [datetime_DESC]` fails the whole query with "cannot order by
    // datetime: it is neither aggregated, nor a dimension" — which is exactly
    // what the 2026-09-12 digest printed where the Cloudflare figure should be.
    // With no dimensions and limit 1 the node already collapses the window into
    // a single row, and `max` takes the peak across it.
    const s = await gql(`{ viewer { accounts(filter: {accountTag: "${ACCOUNT}"}) {
      r2StorageAdaptiveGroups(limit: 1, filter: {datetime_geq: "${new Date(d0).toISOString()}", datetime_lt: "${new Date(d1).toISOString()}"}) {
        max { objectCount payloadSize }
      } } } }`);
    const top = s?.r2StorageAdaptiveGroups?.[0]?.max;
    if (!top) return { dayUsd: 0, gb: 0, objects: 0, classA: 0, classB: 0, opsFree: true,
                       note: 'no storage reading yet — the analytics lag behind by a few minutes' };

    const gb = Number(top.payloadSize || 0) / 1024 ** 3;
    const objects = Number(top.objectCount || 0);

    // Operations are judged against the MONTH, because that is how R2 bills
    // them: the first 1M Class A and 10M Class B in a calendar month are free.
    //
    // ⚠️ Do not project one day × 30. That is what this did until 2026-09-14,
    // and it turned a one-off into a monthly bill: the day the report archive
    // was backfilled into R2 (~154k PutObject, once) read as ~5.7M writes a
    // month, printed "⚠️ operations now BILLABLE" and added $0.70 a day, while
    // the month's real total was a fraction of the free allowance.
    //
    // So: month-to-date totals decide whether anything is billable at all, and
    // the day is charged only the overage that actually accrued during it —
    // the bill with the day minus the bill without it.
    const ref = new Date(d1 - 1);
    const monthStart = Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 1);
    const dayFrom = Math.max(d0, monthStart);
    const [upToEnd, upToStart] = await Promise.all([
      opsBetween(monthStart, d1),
      opsBetween(monthStart, dayFrom),
    ]);

    const opsFree = upToEnd.a <= FREE_CLASS_A && upToEnd.b <= FREE_CLASS_B;
    const opsDayUsd = Math.max(0, opsBill(upToEnd.a, upToEnd.b) - opsBill(upToStart.a, upToStart.b));
    const billableGb = Math.max(0, gb - FREE_GB);

    return {
      dayUsd: (billableGb * GB_MONTH_USD) / 30 + opsDayUsd,
      gb, objects, classA: upToEnd.a, classB: upToEnd.b, opsFree,
    };
  } catch (e) {
    return { dayUsd: 0, gb: 0, objects: 0, classA: 0, classB: 0, opsFree: true,
             note: String((e as any)?.message || e).slice(0, 160) };
  }
}

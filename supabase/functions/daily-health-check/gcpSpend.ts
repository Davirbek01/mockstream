// =====================================================================
// What Google charged us yesterday, read from the billing export.
// ---------------------------------------------------------------------
// The AI spend in this report is an estimate we compute ourselves, because
// Groq publishes no billing API. Google is the opposite: it will not tell us
// a running total either, but it writes the finished bill into BigQuery every
// day, line by line. So this half of the number is not estimated at all — it
// is the invoice, a day late.
//
// Needs one secret, GCP_BILLING_SA: the JSON key of a service account with
// BigQuery Data Viewer on the dataset and BigQuery Job User on the project.
// Without it the section simply does not appear; nothing else breaks.
//
// The export table is NOT named here. Google names it after the billing
// account (gcp_billing_export_resource_v1_011F55_4FCD36_08688B) and there is
// one per account, so the tables are discovered at run time — enabling the
// export on a second billing account then needs no code change, and a
// mistyped table name cannot silently zero the report.
// =====================================================================

const PROJECT = Deno.env.get('GCP_BILLING_PROJECT') || 'mock-stream-service';
const DATASET = Deno.env.get('GCP_BILLING_DATASET') || 'billing_export';
const SA_JSON = Deno.env.get('GCP_BILLING_SA') || '';

export type GcpSpend = {
  day: string;
  total: number;
  by: Array<{ service: string; cost: number }>;
  tables: number;
  note?: string;
};

/** base64url without padding — what a JWT wants. */
function b64url(bytes: Uint8Array | string): string {
  const bin = typeof bytes === 'string' ? bytes : String.fromCharCode(...bytes);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToDer(pem: string): Uint8Array {
  const body = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const raw = atob(body);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** A service-account access token, signed here rather than fetched from a
 *  metadata server — this runs on Supabase, not on Google. */
async function accessToken(sa: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/bigquery.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64url(JSON.stringify(claim))}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToDer(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned)),
  );

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${b64url(sig)}`,
    }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error(`token: ${JSON.stringify(j).slice(0, 200)}`);
  return j.access_token;
}

async function bq(token: string, sql: string): Promise<any[]> {
  const r = await fetch(`https://bigquery.googleapis.com/bigquery/v2/projects/${PROJECT}/queries`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql, useLegacySql: false, timeoutMs: 30000 }),
  });
  const j = await r.json();
  if (j.error) throw new Error(`bq: ${j.error.message?.slice(0, 200)}`);
  if (!j.jobComplete) throw new Error('bq: query did not finish in 30s');
  const fields = (j.schema?.fields || []).map((f: any) => f.name);
  return (j.rows || []).map((row: any) => {
    const o: any = {};
    fields.forEach((f: string, i: number) => { o[f] = row.f[i].v; });
    return o;
  });
}

/** Every billing-export table in the dataset — one per billing account. */
async function exportTables(token: string): Promise<string[]> {
  const r = await fetch(
    `https://bigquery.googleapis.com/bigquery/v2/projects/${PROJECT}/datasets/${DATASET}/tables?maxResults=100`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const j = await r.json();
  if (j.error) throw new Error(`tables: ${j.error.message?.slice(0, 200)}`);
  return (j.tables || [])
    .map((t: any) => t.tableReference?.tableId as string)
    .filter((id: string) => id && id.startsWith('gcp_billing_export'));
}

/**
 * Yesterday's Google bill, by service.
 *
 * Costs are netted against credits — a free-tier allowance arrives as a
 * negative credit line, and ignoring it would report a bill nobody is being
 * asked to pay. Days are Asia/Tashkent so this matches the rest of the report,
 * and the export lags: Google finalises a day some hours after it ends, so an
 * empty answer usually means "not written yet", not "cost nothing".
 */
export async function gcpSpend(daysBack: number): Promise<GcpSpend | null> {
  if (!SA_JSON) return null;
  let sa: any;
  try { sa = JSON.parse(SA_JSON); } catch { return { day: '', total: 0, by: [], tables: 0, note: 'GCP_BILLING_SA is not valid JSON' }; }

  try {
    const token = await accessToken(sa);
    const tables = await exportTables(token);
    if (!tables.length) {
      return { day: '', total: 0, by: [], tables: 0, note: 'no export table in the dataset yet — Google writes the first one a few hours after the export is enabled' };
    }

    const union = tables
      .map((t) => `select service.description as service, cost, credits, usage_start_time, export_time
                   from \`${PROJECT}.${DATASET}.${t}\``)
      .join('\n union all \n');

    // Same tables, but the columns the egress question needs.
    const egressUnion = tables
      .map((t) => `select sku.description as sku, resource.name as bucket, usage.amount as amount,
                          usage_start_time
                   from \`${PROJECT}.${DATASET}.${t}\``)
      .join('\n union all \n');

    const rows = await bq(token, `
      with all_rows as (${union}),
      dwin as (
        select date_sub(current_date('Asia/Tashkent'), interval ${Math.max(0, daysBack)} day) as d
      )
      select service,
             round(sum(cost) + sum(ifnull((select sum(c.amount) from unnest(credits) c), 0)), 4) as cost,
             format_date('%Y-%m-%d', dwin.d) as day,
             -- Google keeps appending to a day for a while after it ends. If
             -- the newest row for this day was written before the day was even
             -- over, what we are looking at is a part of it.
             max(export_time) as last_export,
             timestamp_add(timestamp(dwin.d, 'Asia/Tashkent'), interval 24 hour) as day_end
      from all_rows, dwin
      where date(usage_start_time, 'Asia/Tashkent') = dwin.d
      group by service, dwin.d
      having cost <> 0
      order by cost desc
    `);

    const by = rows.map((r) => ({ service: String(r.service || '?'), cost: Number(r.cost) }));
    if (!by.length) {
      // The table exists but Google has not written to it. Saying "$0.00" here
      // would read as "we spent nothing", which is a different claim entirely —
      // the export starts empty and fills within a day of being switched on.
      const any = await bq(token, `select count(*) as n from \`${PROJECT}.${DATASET}.${tables[0]}\``);
      const n = Number(any[0]?.n || 0);
      if (!n) return { day: '', total: 0, by: [], tables: tables.length,
                       note: 'export connected, Google has not written any rows yet (first data lands within a day)' };
    }
    // A day is settled once Google has written to it after the day ended.
    // BigQuery's REST API hands TIMESTAMPs back as epoch SECONDS in a string
    // ("1787417739.123"), not as text a Date can parse — reading them with
    // Date.parse gave NaN and every day looked settled.
    const asMs = (v: unknown): number => {
      const raw = String(v ?? '').trim();
      if (!raw) return 0;
      const n = Number(raw);
      return isFinite(n) ? Math.round(n * 1000) : Date.parse(raw);
    };
    const lastExport = asMs(rows[0]?.last_export);
    const dayEnd = asMs(rows[0]?.day_end);
    const partial = !!(lastExport && dayEnd && lastExport < dayEnd);

    // How much of that day's traffic was students pulling exam audio.
    let audioEgressGib: number | undefined;
    try {
      const eg = await bq(token, `
        with all_rows as (${egressUnion}),
        dwin as (
          select date_sub(current_date('Asia/Tashkent'), interval ${Math.max(0, daysBack)} day) as d
        )
        select round(sum(amount) / pow(1024, 3), 2) as gib
        from all_rows, dwin
        where date(usage_start_time, 'Asia/Tashkent') = dwin.d
          and sku like 'Download%'
          and bucket in ('mockstream-listening-audio', 'mockstream-samples-audio')
      `);
      const g = Number(eg[0]?.gib);
      if (isFinite(g)) audioEgressGib = g;
    } catch { /* the spend line matters more than this one */ }

    return {
      audioEgressGib,
      day: rows[0]?.day || '',
      total: by.reduce((a, b) => a + b.cost, 0),
      by,
      tables: tables.length,
      partial,
      note: partial
        ? 'Google is still writing this day — no settled figure yet (it lands within a day)'
        : undefined,
    };
  } catch (e) {
    return { day: '', total: 0, by: [], tables: 0, note: String((e as any)?.message || e).slice(0, 200) };
  }
}

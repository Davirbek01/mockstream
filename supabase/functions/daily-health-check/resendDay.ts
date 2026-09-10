// ============================================================================
// resendDay — how much email sign-in actually costs us, one day at a time.
// ----------------------------------------------------------------------------
// Resend Pro was bought on 2026-09-10 for $20/mo after the free plan's 100/day
// was hit two days running. $20 is worth paying only while the volume needs it,
// so the digest now carries the number that settles it — and, since Resend
// reports each message's last event, the bounce count too.
//
// Bounces matter more than they look: ONE bounce puts an address on Resend's
// suppression list permanently, and that student can never sign in by email
// again. A rising bounce line is students being locked out, not a billing
// detail. See [[reference-resend-suppressions]].
//
// No date filter exists on the API, so this pages backwards from newest until
// it passes the start of the day. At today's volume that is one or two pages.
// Returns null when RESEND_API_KEY is not set, and the digest simply omits the
// section — a missing key must never cost us the whole report.
// ============================================================================

const API = 'https://api.resend.com/emails';
/** Tashkent is UTC+5 all year — no DST to get wrong. */
const TZ_OFFSET_MS = 5 * 60 * 60 * 1000;
/** 100 per page; twelve pages is 1,200 emails, far past any real day. */
const MAX_PAGES = 12;

export interface ResendDay {
  /** Emails Resend accepted from us during the day. */
  sent: number;
  delivered: number;
  bounced: number;
  complained: number;
  /** Still in flight when the digest ran. */
  pending: number;
  /** True when the page cap was reached before the day was fully walked. */
  truncated: boolean;
}

/** Start of the Tashkent day `daysBack` days ago, as a UTC instant. */
function windowFor(daysBack: number): { start: number; end: number } {
  const nowTashkent = new Date(Date.now() + TZ_OFFSET_MS);
  const y = nowTashkent.getUTCFullYear();
  const m = nowTashkent.getUTCMonth();
  const d = nowTashkent.getUTCDate() - Math.max(0, daysBack);
  const start = Date.UTC(y, m, d) - TZ_OFFSET_MS;
  return { start, end: start + 24 * 60 * 60 * 1000 };
}

export async function resendDay(daysBack: number): Promise<ResendDay | null> {
  const key = Deno.env.get('RESEND_API_KEY') || '';
  if (!key) return null;

  const { start, end } = windowFor(daysBack);
  const out: ResendDay = {
    sent: 0, delivered: 0, bounced: 0, complained: 0, pending: 0, truncated: false,
  };

  let after = '';
  for (let page = 0; page < MAX_PAGES; page++) {
    const url = `${API}?limit=100${after ? `&after=${encodeURIComponent(after)}` : ''}`;
    let rows: any[] = [];
    try {
      const r = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
      if (!r.ok) return out.sent ? out : null;   // partial beats nothing; none beats a lie
      const body = await r.json();
      rows = Array.isArray(body?.data) ? body.data : [];
    } catch {
      return out.sent ? out : null;
    }
    if (!rows.length) return out;

    let reachedStart = false;
    for (const row of rows) {
      const t = Date.parse(row?.created_at || '');
      if (!Number.isFinite(t)) continue;
      if (t < start) { reachedStart = true; continue; }   // older than the day
      if (t >= end) continue;                             // newer (today, when daysBack=1)

      out.sent++;
      switch (String(row?.last_event || '').toLowerCase()) {
        case 'delivered': case 'opened': case 'clicked': out.delivered++; break;
        case 'bounced': out.bounced++; break;
        case 'complained': out.complained++; break;
        default: out.pending++; break;                    // sent / queued / delivery_delayed
      }
    }
    if (reachedStart) return out;

    const last = rows[rows.length - 1];
    if (!last?.id || last.id === after) return out;       // no cursor movement; stop
    after = last.id;
  }

  out.truncated = true;
  return out;
}

/**
 * The digest lines. Says the volume, the share that never arrived, and — the
 * reason this was asked for — whether the day would still have fitted inside
 * the free plan.
 */
export function resendSection(r: ResendDay | null): string[] {
  if (!r || !r.sent) return [];

  const L: string[] = [];
  const undelivered = r.bounced + r.complained;
  const pct = r.sent ? Math.round((undelivered / r.sent) * 1000) / 10 : 0;

  L.push(`✉️ <b>Email — ${r.sent} sent</b>` +
         (r.pending ? ` <i>(${r.pending} still in flight)</i>` : ''));

  if (undelivered > 0) {
    // Every bounce is an address Resend will now refuse forever, which means a
    // student who cannot sign in by email again and has no way to find out.
    L.push(`  ⚠️ ${r.bounced} bounced${r.complained ? ` · ${r.complained} marked spam` : ''}` +
           ` (${pct}%) — each one is suppressed permanently`);
  }

  // Pro is $20/mo for 50,000. Free is 3,000/mo AND 100/day, and it was the
  // DAILY cap that broke first.
  const pace = r.sent * 30;
  const overDaily = r.sent > 100;
  const overMonthly = pace > 3000;
  L.push(`  pace ${pace.toLocaleString('en-US')}/mo of 50,000` +
         (overDaily || overMonthly
           ? ' · <b>free plan would not fit</b>'
           : ' · free plan would fit — $20 not needed at this rate'));

  if (r.truncated) L.push('  <i>(count truncated — more than 1,200 that day)</i>');
  return L;
}

-- ═══════════════════════════════════════════════════════════════════════════
-- telegram_send_log.via — WHICH file the channel actually received.
--
-- A report normally travels as the encrypted html the locker builds. When
-- that file cannot be fetched the page silently falls back to the legacy zip
-- (see [speaking-unscored-zip-fallback]): the student still gets everything,
-- but the channel copy is the old multi-MB bundle and nobody finds out.
--
-- The sender is the only place that sees the finished attachment, so it
-- stamps what it sent. Nothing decides behaviour on this column — it exists
-- so the 08:00 digest can say "N went as the legacy zip" instead of the
-- fallback being invisible.
-- ═══════════════════════════════════════════════════════════════════════════
alter table telegram_send_log add column if not exists via text;

comment on column telegram_send_log.via is
  'What the channel received: locked (encrypted html), zip (legacy fallback), other, or none.';

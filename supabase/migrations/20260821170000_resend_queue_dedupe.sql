-- ═══════════════════════════════════════════════════════════════════════════
-- Resend queue: never queue the same report twice, and let the panel find the
-- queue again after it has been left.
--
-- What happened on 21 Aug: four writing reports were queued, the admin left
-- the panel before the first one had gone, and came back to a page that had
-- stopped following the batch — it still showed one sent. So he pressed Send
-- again, and all four went to the channel a second time.
--
-- Two separate faults, fixed in two places. The page losing track is a UI
-- problem (resend_queue_active lets it re-attach), but the DUPLICATE is the
-- one that reached students, and no UI fix can be trusted to prevent it —
-- a second tab, a double click or an impatient admin all do the same thing.
-- So the queue itself now refuses a report it is already holding.
-- ═══════════════════════════════════════════════════════════════════════════

-- A report may be re-sent as often as an admin likes, but only ONE waiting
-- copy at a time. Partial index: only unfinished rows take part.
create unique index if not exists resend_queue_one_pending
  on resend_queue (result_id)
  where status in ('queued', 'sending');

-- The return type gains `skipped`, so the old signature has to go first.
drop function if exists public.resend_enqueue(uuid[], text, boolean, integer);

create function public.resend_enqueue(
  p_result_ids uuid[],
  p_date_mode text default 'original',
  p_in_dashboard boolean default true,
  p_interval_seconds integer default 0
) returns table(batch_id uuid, queued integer, skipped integer)
language plpgsql security definer set search_path to 'public' as $$
declare
  v_batch uuid := gen_random_uuid();
  v_n int;
  v_asked int := coalesce(array_length(p_result_ids, 1), 0);
  v_by text := coalesce(auth.jwt() ->> 'email', 'admin');
begin
  if not public.is_super_admin() then
    raise exception 'forbidden';
  end if;

  insert into resend_queue (batch_id, result_id, center, skill, date_mode, in_dashboard,
                            send_after, requested_by)
  select v_batch, r.id, r.center, r.skill, p_date_mode, p_in_dashboard,
         -- Row n becomes due n intervals from now; with no interval every row
         -- is due immediately and the drain's own batch size does the pacing.
         now() + make_interval(secs => greatest(p_interval_seconds, 0)
                               * (row_number() over (order by r.created_at) - 1)),
         v_by
  from results r
  where r.id = any(p_result_ids)
    and r.report_path is not null
    -- Already waiting its turn: queueing it again is the duplicate.
    and not exists (
      select 1 from resend_queue q
      where q.result_id = r.id and q.status in ('queued', 'sending')
    );

  get diagnostics v_n = row_count;
  return query select v_batch, v_n, greatest(v_asked - v_n, 0);
end;
$$;

-- Everything the queue is still holding, plus what it finished in the last
-- quarter hour. The panel polls this instead of following one batch id, so
-- re-opening it (or opening it in another tab) shows the true state.
create or replace function public.resend_queue_active()
returns table(result_id uuid, status text, error text,
              send_after timestamptz, sent_at timestamptz, batch_id uuid)
language sql security definer set search_path to 'public' as $$
  select q.result_id, q.status, q.error, q.send_after, q.sent_at, q.batch_id
  from resend_queue q
  where public.is_super_admin()
    and (q.status in ('queued', 'sending')
         or (q.status in ('sent', 'failed', 'cancelled') and q.created_at > now() - interval '15 minutes'))
  order by q.send_after, q.id;
$$;

-- Stop applies to whatever is waiting, not to one batch: after a reload the
-- panel no longer knows which batch it was, and the admin means "stop".
create or replace function public.resend_cancel_all()
returns integer
language plpgsql security definer set search_path to 'public' as $$
declare v_n int;
begin
  if not public.is_super_admin() then raise exception 'forbidden'; end if;
  update resend_queue set status = 'cancelled' where status = 'queued';
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

grant execute on function public.resend_enqueue(uuid[], text, boolean, integer) to authenticated;
grant execute on function public.resend_queue_active() to authenticated;
grant execute on function public.resend_cancel_all() to authenticated;

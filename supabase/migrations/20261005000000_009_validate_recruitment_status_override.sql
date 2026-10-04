-- Keep recruitment status overrides aligned with the application's supported status values.
-- Invalid legacy values are normalized before this constraint is added.
update public.recruitments
set status_override = null
where status_override is not null
  and status_override not in ('upcoming', 'open', 'closing-soon', 'closed');

alter table public.recruitments
  drop constraint if exists recruitments_status_override_check;

alter table public.recruitments
  add constraint recruitments_status_override_check
  check (
    status_override is null
    or status_override in ('upcoming', 'open', 'closing-soon', 'closed')
  );
create table if not exists public.exam_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  recruitment_id uuid not null references public.recruitments(id) on delete cascade,
  tracking_status text not null default 'watching'
    check (tracking_status in ('watching','registered','appeared','result-awaiting','completed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists exam_tracking_user_recruitment_unique_idx
  on public.exam_tracking (user_id, recruitment_id);

alter table public.exam_tracking enable row level security;

drop policy if exists exam_tracking_select_own on public.exam_tracking;
create policy exam_tracking_select_own
on public.exam_tracking for select
using (auth.uid() = user_id);

drop policy if exists exam_tracking_insert_own on public.exam_tracking;
create policy exam_tracking_insert_own
on public.exam_tracking for insert
with check (auth.uid() = user_id);

drop policy if exists exam_tracking_update_own on public.exam_tracking;
create policy exam_tracking_update_own
on public.exam_tracking for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists exam_tracking_delete_own on public.exam_tracking;
create policy exam_tracking_delete_own
on public.exam_tracking for delete
using (auth.uid() = user_id);

create or replace function public.set_exam_tracking_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_exam_tracking_updated_at on public.exam_tracking;
create trigger set_exam_tracking_updated_at
before update on public.exam_tracking
for each row execute function public.set_exam_tracking_updated_at();

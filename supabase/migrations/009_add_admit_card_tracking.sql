create table if not exists public.admit_card_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  admit_card_id uuid not null references public.admit_cards(id) on delete cascade,
  tracking_status text not null default 'tracking',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admit_card_tracking_status_check check (tracking_status in ('tracking','downloaded','exam-appeared','completed')),
  constraint admit_card_tracking_user_card_unique unique (user_id, admit_card_id)
);

alter table public.admit_card_tracking enable row level security;

drop policy if exists admit_card_tracking_select_own on public.admit_card_tracking;
create policy admit_card_tracking_select_own on public.admit_card_tracking
for select using (auth.uid() = user_id);

drop policy if exists admit_card_tracking_insert_own on public.admit_card_tracking;
create policy admit_card_tracking_insert_own on public.admit_card_tracking
for insert with check (auth.uid() = user_id);

drop policy if exists admit_card_tracking_update_own on public.admit_card_tracking;
create policy admit_card_tracking_update_own on public.admit_card_tracking
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists admit_card_tracking_delete_own on public.admit_card_tracking;
create policy admit_card_tracking_delete_own on public.admit_card_tracking
for delete using (auth.uid() = user_id);

create or replace function public.set_admit_card_tracking_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_admit_card_tracking_updated_at on public.admit_card_tracking;
create trigger set_admit_card_tracking_updated_at
before update on public.admit_card_tracking
for each row execute function public.set_admit_card_tracking_updated_at();
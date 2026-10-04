-- Prevent normal users from changing their profile role to admin.
-- Admins are authorized through Supabase Auth app_metadata, not the profile role column.

drop policy if exists update_own_profile on public.profiles;

create policy update_own_profile
on public.profiles
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and (
    role = 'user'
    or public.is_admin()
  )
);

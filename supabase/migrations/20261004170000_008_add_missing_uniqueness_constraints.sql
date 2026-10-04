-- Database-level uniqueness prevents duplicate recruitment slugs and
-- duplicate user/job tracking records even under concurrent requests.

create unique index if not exists recruitments_slug_unique_idx
  on public.recruitments (slug);

create unique index if not exists saved_jobs_user_recruitment_unique_idx
  on public.saved_jobs (user_id, recruitment_id);

create unique index if not exists application_tracker_user_recruitment_unique_idx
  on public.application_tracker (user_id, recruitment_id);

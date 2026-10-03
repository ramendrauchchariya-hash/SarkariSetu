/*
# Related Content and User Tables

## Purpose
Creates tables for recruitment-related content (results, admit cards, answer keys)
and user-owned data (profiles, saved jobs, application tracker, notification
subscriptions, notifications).

## New Tables

### 16. results
Exam results, merit lists, cutoffs, scorecards, and final results.
- id (uuid PK)
- title (text, NOT NULL)
- slug (text, unique, NOT NULL)
- organization_id (uuid FK → organizations, ON DELETE SET NULL)
- recruitment_id (uuid FK → recruitments, ON DELETE SET NULL) — nullable, some results may not link to a recruitment
- result_type (text, NOT NULL) — 'result', 'merit-list', 'cutoff', 'scorecard', 'final-result'
- result_date (date)
- description (text)
- official_result_url (text)
- official_website_url (text)
- is_published (boolean, default false)
- created_at, updated_at

### 17. admit_cards
Admit cards / hall tickets for recruitment exams.
- id (uuid PK)
- title (text, NOT NULL)
- slug (text, unique, NOT NULL)
- organization_id (uuid FK → organizations, ON DELETE SET NULL)
- recruitment_id (uuid FK → recruitments, ON DELETE SET NULL)
- exam_date (date)
- release_date (date)
- status (text, default 'not-released') — 'available', 'expected-soon', 'not-released'
- official_url (text)
- description (text)
- is_published (boolean, default false)
- created_at, updated_at

### 18. answer_keys
Official answer keys with objection windows.
- id (uuid PK)
- title (text, NOT NULL)
- slug (text, unique, NOT NULL)
- organization_id (uuid FK → organizations, ON DELETE SET NULL)
- recruitment_id (uuid FK → recruitments, ON DELETE SET NULL)
- release_date (date)
- objection_start (date)
- objection_end (date)
- official_url (text)
- description (text)
- is_published (boolean, default false)
- created_at, updated_at

### 19. profiles
User profiles for personalized job matching. User-owned.
- id (uuid PK)
- user_id (uuid, unique, NOT NULL) — references auth.users(id)
- full_name (text)
- date_of_birth (date)
- qualification (text)
- discipline (text)
- graduation_year (int)
- state (text)
- preferred_departments (text[]) — array of department slugs
- preferred_locations (text[]) — array of state slugs
- created_at, updated_at

### 20. saved_jobs
User's bookmarked recruitments. User-owned.
- id (uuid PK)
- user_id (uuid, NOT NULL, DEFAULT auth.uid()) — references auth.users(id)
- recruitment_id (uuid, NOT NULL, FK → recruitments, ON DELETE CASCADE)
- created_at
- UNIQUE (user_id, recruitment_id) — prevents duplicate saves

### 21. application_tracker
User's application progress tracking. User-owned.
- id (uuid PK)
- user_id (uuid, NOT NULL, DEFAULT auth.uid())
- recruitment_id (uuid, NOT NULL, FK → recruitments, ON DELETE CASCADE)
- application_status (text, default 'interested') — 'interested', 'applied', 'exam-scheduled', 'exam-completed', 'result-awaited', 'selected', 'not-selected'
- application_date (date)
- application_number (text)
- notes (text)
- created_at, updated_at

### 22. notification_subscriptions
User's notification preferences by category/department/state. User-owned.
- id (uuid PK)
- user_id (uuid, NOT NULL, DEFAULT auth.uid())
- category (text) — category slug
- department (text) — department slug
- state (text) — state slug
- created_at, updated_at

### 23. notifications
Individual notifications for a user. User-owned.
- id (uuid PK)
- user_id (uuid, NOT NULL, DEFAULT auth.uid())
- title (text, NOT NULL)
- message (text)
- notification_type (text) — 'new-job', 'deadline-reminder', 'result', 'admit-card', etc.
- related_recruitment_id (uuid, FK → recruitments, ON DELETE SET NULL)
- is_read (boolean, default false)
- created_at

## Security (RLS)

### Public content tables (results, admit_cards, answer_keys)
- SELECT: public read for published records only (anon + authenticated)
- No public writes — admin uses service role key

### User-owned tables (profiles, saved_jobs, application_tracker, notification_subscriptions, notifications)
- SELECT/INSERT/UPDATE/DELETE: authenticated users can only access their own data
  (auth.uid() = user_id)
- user_id columns default to auth.uid() so inserts that omit user_id succeed
- These tables will be empty until auth is built — that is expected and safe

## Important Notes
1. User-owned tables use DEFAULT auth.uid() on user_id columns so that client-side
   inserts (which omit user_id) still satisfy RLS ownership checks.
2. results, admit_cards, and answer_keys have nullable recruitment_id because some
   results may be published without a linked recruitment in the system.
3. The unique constraint on saved_jobs(user_id, recruitment_id) prevents users from
   saving the same recruitment twice.
4. profiles.user_id is unique (one profile per user) and references auth.users(id)
   with ON DELETE CASCADE so deleting a user deletes their profile.
*/
-- ============================================================================
-- 16. results
-- ============================================================================
CREATE TABLE IF NOT EXISTS results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  recruitment_id uuid REFERENCES recruitments(id) ON DELETE SET NULL,
  result_type text NOT NULL,
  result_date date,
  description text,
  official_result_url text,
  official_website_url text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS results_slug_key ON results (slug);
CREATE INDEX IF NOT EXISTS results_is_published_idx ON results (is_published);
CREATE INDEX IF NOT EXISTS results_result_date_idx ON results (result_date DESC);
CREATE INDEX IF NOT EXISTS results_organization_id_idx ON results (organization_id);
CREATE INDEX IF NOT EXISTS results_recruitment_id_idx ON results (recruitment_id);

ALTER TABLE results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published_results" ON results;
CREATE POLICY "public_read_published_results"
  ON results FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

DROP TRIGGER IF EXISTS results_updated_at ON results;
CREATE TRIGGER results_updated_at BEFORE UPDATE ON results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 17. admit_cards
-- ============================================================================
CREATE TABLE IF NOT EXISTS admit_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  recruitment_id uuid REFERENCES recruitments(id) ON DELETE SET NULL,
  exam_date date,
  release_date date,
  status text NOT NULL DEFAULT 'not-released',
  official_url text,
  description text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS admit_cards_slug_key ON admit_cards (slug);
CREATE INDEX IF NOT EXISTS admit_cards_is_published_idx ON admit_cards (is_published);
CREATE INDEX IF NOT EXISTS admit_cards_exam_date_idx ON admit_cards (exam_date);
CREATE INDEX IF NOT EXISTS admit_cards_organization_id_idx ON admit_cards (organization_id);
CREATE INDEX IF NOT EXISTS admit_cards_recruitment_id_idx ON admit_cards (recruitment_id);

ALTER TABLE admit_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published_admit_cards" ON admit_cards;
CREATE POLICY "public_read_published_admit_cards"
  ON admit_cards FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

DROP TRIGGER IF EXISTS admit_cards_updated_at ON admit_cards;
CREATE TRIGGER admit_cards_updated_at BEFORE UPDATE ON admit_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 18. answer_keys
-- ============================================================================
CREATE TABLE IF NOT EXISTS answer_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  recruitment_id uuid REFERENCES recruitments(id) ON DELETE SET NULL,
  release_date date,
  objection_start date,
  objection_end date,
  official_url text,
  description text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS answer_keys_slug_key ON answer_keys (slug);
CREATE INDEX IF NOT EXISTS answer_keys_is_published_idx ON answer_keys (is_published);
CREATE INDEX IF NOT EXISTS answer_keys_release_date_idx ON answer_keys (release_date DESC);
CREATE INDEX IF NOT EXISTS answer_keys_organization_id_idx ON answer_keys (organization_id);
CREATE INDEX IF NOT EXISTS answer_keys_recruitment_id_idx ON answer_keys (recruitment_id);

ALTER TABLE answer_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published_answer_keys" ON answer_keys;
CREATE POLICY "public_read_published_answer_keys"
  ON answer_keys FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

DROP TRIGGER IF EXISTS answer_keys_updated_at ON answer_keys;
CREATE TRIGGER answer_keys_updated_at BEFORE UPDATE ON answer_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 19. profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  date_of_birth date,
  qualification text,
  discipline text,
  graduation_year int,
  state text,
  preferred_departments text[] DEFAULT '{}',
  preferred_locations text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles (user_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 20. saved_jobs
-- ============================================================================
CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  recruitment_id uuid NOT NULL REFERENCES recruitments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS saved_jobs_user_recruitment_key ON saved_jobs (user_id, recruitment_id);
CREATE INDEX IF NOT EXISTS saved_jobs_user_id_idx ON saved_jobs (user_id);

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_saved_jobs" ON saved_jobs;
CREATE POLICY "select_own_saved_jobs"
  ON saved_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_saved_jobs" ON saved_jobs;
CREATE POLICY "insert_own_saved_jobs"
  ON saved_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_saved_jobs" ON saved_jobs;
CREATE POLICY "delete_own_saved_jobs"
  ON saved_jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 21. application_tracker
-- ============================================================================
CREATE TABLE IF NOT EXISTS application_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  recruitment_id uuid NOT NULL REFERENCES recruitments(id) ON DELETE CASCADE,
  application_status text NOT NULL DEFAULT 'interested',
  application_date date,
  application_number text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS application_tracker_user_id_idx ON application_tracker (user_id);
CREATE INDEX IF NOT EXISTS application_tracker_recruitment_id_idx ON application_tracker (recruitment_id);

ALTER TABLE application_tracker ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_applications" ON application_tracker;
CREATE POLICY "select_own_applications"
  ON application_tracker FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_applications" ON application_tracker;
CREATE POLICY "insert_own_applications"
  ON application_tracker FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_applications" ON application_tracker;
CREATE POLICY "update_own_applications"
  ON application_tracker FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_applications" ON application_tracker;
CREATE POLICY "delete_own_applications"
  ON application_tracker FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS application_tracker_updated_at ON application_tracker;
CREATE TRIGGER application_tracker_updated_at BEFORE UPDATE ON application_tracker
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 22. notification_subscriptions
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text,
  department text,
  state text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notification_subscriptions_user_id_idx ON notification_subscriptions (user_id);

ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subscriptions" ON notification_subscriptions;
CREATE POLICY "select_own_subscriptions"
  ON notification_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_subscriptions" ON notification_subscriptions;
CREATE POLICY "insert_own_subscriptions"
  ON notification_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_subscriptions" ON notification_subscriptions;
CREATE POLICY "update_own_subscriptions"
  ON notification_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_subscriptions" ON notification_subscriptions;
CREATE POLICY "delete_own_subscriptions"
  ON notification_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS notification_subscriptions_updated_at ON notification_subscriptions;
CREATE TRIGGER notification_subscriptions_updated_at BEFORE UPDATE ON notification_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 23. notifications
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  notification_type text,
  related_recruitment_id uuid REFERENCES recruitments(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON notifications (user_id, is_read) WHERE is_read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

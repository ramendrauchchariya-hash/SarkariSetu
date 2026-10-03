/*
# Recruitment Detail Tables

## Purpose
Creates all child tables that store the detailed information for a recruitment:
posts, vacancies, important dates, eligibility rules, application fees,
selection process steps, exam pattern, documents required, how-to-apply steps,
and FAQs. All tables cascade-delete with their parent recruitment.

## New Tables

### 6. posts
Individual posts/positions within a recruitment (e.g., "Assistant Section Officer"
within SSC CGL). A recruitment can have multiple posts with different qualifications.
- id (uuid PK)
- recruitment_id (uuid FK → recruitments, ON DELETE CASCADE)
- title (text, NOT NULL)
- qualification (text) — qualification slug
- discipline (text) — specific discipline/field
- age_min (int) — minimum age
- age_max (int) — maximum age
- age_cutoff_date (date) — cutoff date for age calculation
- age_relaxation (text) — relaxation description
- experience (text) — experience requirements
- nationality_requirement (text)
- pay_level (text) — e.g., "Level 4 (7th CPC)"
- salary_min (int) — minimum salary
- salary_max (int) — maximum salary
- job_type (text)
- created_at, updated_at

### 7. vacancies
Vacancy breakdown by post, state, and category (UR/OBC/SC/ST/EWS).
- id (uuid PK)
- post_id (uuid FK → posts, ON DELETE CASCADE)
- state_id (uuid FK → states, ON DELETE SET NULL)
- category_name (text) — e.g., "UR", "OBC", "SC", "ST", "EWS"
- vacancy_count (int, NOT NULL)
- created_at, updated_at

### 8. important_dates
Flexible date entries for a recruitment (notification, application start/end,
correction window, city intimation, admit card, exam, result).
Not every recruitment has every date — only rows that exist are shown.
- id (uuid PK)
- recruitment_id (uuid FK → recruitments, ON DELETE CASCADE)
- date_type (text, NOT NULL) — e.g., 'notification', 'application_start', 'application_end'
- date_value (date, NOT NULL)
- label (text) — display label
- description (text)
- created_at

### 9. eligibility_rules
Structured eligibility data for future deterministic eligibility checking.
- id (uuid PK)
- recruitment_id (uuid FK → recruitments, ON DELETE CASCADE)
- post_id (uuid FK → posts, ON DELETE CASCADE) — nullable for recruitment-level rules
- rule_type (text, NOT NULL) — e.g., 'education', 'age', 'experience', 'nationality'
- rule_value (text, NOT NULL)
- description (text)
- created_at, updated_at

### 10. application_fees
Application fee structure by category.
- id (uuid PK)
- recruitment_id (uuid FK → recruitments, ON DELETE CASCADE)
- category (text, NOT NULL) — e.g., "General / OBC", "SC / ST"
- amount (text, NOT NULL) — e.g., "₹ 100" or "No fee"
- payment_method (text)
- notes (text)
- created_at, updated_at

### 11. selection_process
Ordered selection process steps.
- id (uuid PK)
- recruitment_id (uuid FK → recruitments, ON DELETE CASCADE)
- step_number (int, NOT NULL)
- title (text, NOT NULL)
- description (text)
- created_at

### 12. exam_patterns
Exam pattern subjects within a recruitment.
- id (uuid PK)
- recruitment_id (uuid FK → recruitments, ON DELETE CASCADE)
- subject (text, NOT NULL)
- questions (int) — number of questions
- marks (int) — marks for this subject
- duration_minutes (int) — total exam duration (stored at recruitment level, repeated for convenience)
- negative_marking (text) — e.g., "0.50 marks deducted for each wrong answer"
- mode (text) — e.g., "Computer Based Test (Online)"
- created_at

### 13. documents_required
Checklist of documents needed for application.
- id (uuid PK)
- recruitment_id (uuid FK → recruitments, ON DELETE CASCADE)
- document_name (text, NOT NULL)
- description (text)
- is_required (boolean, default true)
- created_at

### 14. how_to_apply
Step-by-step application instructions.
- id (uuid PK)
- recruitment_id (uuid FK → recruitments, ON DELETE CASCADE)
- step_number (int, NOT NULL)
- title (text, NOT NULL)
- description (text)
- created_at

### 15. faqs
Frequently asked questions for a recruitment.
- id (uuid PK)
- recruitment_id (uuid FK → recruitments, ON DELETE CASCADE)
- question (text, NOT NULL)
- answer (text, NOT NULL)
- display_order (int, default 0)
- created_at, updated_at

## Indexes
- posts.recruitment_id
- vacancies.post_id, vacancies.state_id
- important_dates.recruitment_id
- eligibility_rules.recruitment_id, eligibility_rules.post_id
- application_fees.recruitment_id
- selection_process.recruitment_id (ordered by step_number)
- exam_patterns.recruitment_id
- documents_required.recruitment_id
- how_to_apply.recruitment_id (ordered by step_number)
- faqs.recruitment_id (ordered by display_order)

## Security (RLS)
All child tables have RLS enabled with SELECT policies that allow public reads
only when the parent recruitment is published. No public writes — admin content
management uses the service role key (server-side), which bypasses RLS.

## Important Notes
1. All child tables use ON DELETE CASCADE from recruitments, so deleting a
   recruitment automatically cleans up all related detail rows.
2. The `posts` table links to `recruitments` (not the other way around) because
   a recruitment can contain multiple posts with different qualifications and
   age limits.
3. `vacancies` links to both `posts` and `states`, allowing vacancy breakdowns
   by post, state, and category.
4. `exam_patterns` stores duration_minutes and negative_marking at the row level
   for simplicity. If a recruitment has multiple exam tiers, multiple rows can
   represent different subjects with the same recruitment_id. A future migration
   can add an `exam_tier` column if needed.
*/

-- ============================================================================
-- 6. posts
-- ============================================================================
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruitment_id uuid NOT NULL REFERENCES recruitments(id) ON DELETE CASCADE,
  title text NOT NULL,
  qualification text,
  discipline text,
  age_min int,
  age_max int,
  age_cutoff_date date,
  age_relaxation text,
  experience text,
  nationality_requirement text,
  pay_level text,
  salary_min int,
  salary_max int,
  job_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_recruitment_id_idx ON posts (recruitment_id);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_posts" ON posts;
CREATE POLICY "public_read_posts"
  ON posts FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recruitments
      WHERE recruitments.id = posts.recruitment_id
        AND recruitments.is_published = true
    )
  );

DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. vacancies
-- ============================================================================
CREATE TABLE IF NOT EXISTS vacancies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  state_id uuid REFERENCES states(id) ON DELETE SET NULL,
  category_name text NOT NULL,
  vacancy_count int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vacancies_post_id_idx ON vacancies (post_id);
CREATE INDEX IF NOT EXISTS vacancies_state_id_idx ON vacancies (state_id);

ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_vacancies" ON vacancies;
CREATE POLICY "public_read_vacancies"
  ON vacancies FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts
      JOIN recruitments ON recruitments.id = posts.recruitment_id
      WHERE posts.id = vacancies.post_id
        AND recruitments.is_published = true
    )
  );

DROP TRIGGER IF EXISTS vacancies_updated_at ON vacancies;
CREATE TRIGGER vacancies_updated_at BEFORE UPDATE ON vacancies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. important_dates
-- ============================================================================
CREATE TABLE IF NOT EXISTS important_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruitment_id uuid NOT NULL REFERENCES recruitments(id) ON DELETE CASCADE,
  date_type text NOT NULL,
  date_value date NOT NULL,
  label text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS important_dates_recruitment_id_idx ON important_dates (recruitment_id);

ALTER TABLE important_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_important_dates" ON important_dates;
CREATE POLICY "public_read_important_dates"
  ON important_dates FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recruitments
      WHERE recruitments.id = important_dates.recruitment_id
        AND recruitments.is_published = true
    )
  );

-- ============================================================================
-- 9. eligibility_rules
-- ============================================================================
CREATE TABLE IF NOT EXISTS eligibility_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruitment_id uuid NOT NULL REFERENCES recruitments(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  rule_type text NOT NULL,
  rule_value text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS eligibility_rules_recruitment_id_idx ON eligibility_rules (recruitment_id);
CREATE INDEX IF NOT EXISTS eligibility_rules_post_id_idx ON eligibility_rules (post_id);

ALTER TABLE eligibility_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_eligibility_rules" ON eligibility_rules;
CREATE POLICY "public_read_eligibility_rules"
  ON eligibility_rules FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recruitments
      WHERE recruitments.id = eligibility_rules.recruitment_id
        AND recruitments.is_published = true
    )
  );

DROP TRIGGER IF EXISTS eligibility_rules_updated_at ON eligibility_rules;
CREATE TRIGGER eligibility_rules_updated_at BEFORE UPDATE ON eligibility_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. application_fees
-- ============================================================================
CREATE TABLE IF NOT EXISTS application_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruitment_id uuid NOT NULL REFERENCES recruitments(id) ON DELETE CASCADE,
  category text NOT NULL,
  amount text NOT NULL,
  payment_method text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS application_fees_recruitment_id_idx ON application_fees (recruitment_id);

ALTER TABLE application_fees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_application_fees" ON application_fees;
CREATE POLICY "public_read_application_fees"
  ON application_fees FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recruitments
      WHERE recruitments.id = application_fees.recruitment_id
        AND recruitments.is_published = true
    )
  );

DROP TRIGGER IF EXISTS application_fees_updated_at ON application_fees;
CREATE TRIGGER application_fees_updated_at BEFORE UPDATE ON application_fees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 11. selection_process
-- ============================================================================
CREATE TABLE IF NOT EXISTS selection_process (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruitment_id uuid NOT NULL REFERENCES recruitments(id) ON DELETE CASCADE,
  step_number int NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS selection_process_recruitment_id_idx ON selection_process (recruitment_id, step_number);

ALTER TABLE selection_process ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_selection_process" ON selection_process;
CREATE POLICY "public_read_selection_process"
  ON selection_process FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recruitments
      WHERE recruitments.id = selection_process.recruitment_id
        AND recruitments.is_published = true
    )
  );

-- ============================================================================
-- 12. exam_patterns
-- ============================================================================
CREATE TABLE IF NOT EXISTS exam_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruitment_id uuid NOT NULL REFERENCES recruitments(id) ON DELETE CASCADE,
  subject text NOT NULL,
  questions int,
  marks int,
  duration_minutes int,
  negative_marking text,
  mode text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS exam_patterns_recruitment_id_idx ON exam_patterns (recruitment_id);

ALTER TABLE exam_patterns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_exam_patterns" ON exam_patterns;
CREATE POLICY "public_read_exam_patterns"
  ON exam_patterns FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recruitments
      WHERE recruitments.id = exam_patterns.recruitment_id
        AND recruitments.is_published = true
    )
  );

-- ============================================================================
-- 13. documents_required
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents_required (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruitment_id uuid NOT NULL REFERENCES recruitments(id) ON DELETE CASCADE,
  document_name text NOT NULL,
  description text,
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS documents_required_recruitment_id_idx ON documents_required (recruitment_id);

ALTER TABLE documents_required ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_documents_required" ON documents_required;
CREATE POLICY "public_read_documents_required"
  ON documents_required FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recruitments
      WHERE recruitments.id = documents_required.recruitment_id
        AND recruitments.is_published = true
    )
  );

-- ============================================================================
-- 14. how_to_apply
-- ============================================================================
CREATE TABLE IF NOT EXISTS how_to_apply (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruitment_id uuid NOT NULL REFERENCES recruitments(id) ON DELETE CASCADE,
  step_number int NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS how_to_apply_recruitment_id_idx ON how_to_apply (recruitment_id, step_number);

ALTER TABLE how_to_apply ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_how_to_apply" ON how_to_apply;
CREATE POLICY "public_read_how_to_apply"
  ON how_to_apply FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recruitments
      WHERE recruitments.id = how_to_apply.recruitment_id
        AND recruitments.is_published = true
    )
  );

-- ============================================================================
-- 15. faqs
-- ============================================================================
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruitment_id uuid NOT NULL REFERENCES recruitments(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS faqs_recruitment_id_idx ON faqs (recruitment_id, display_order);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_faqs" ON faqs;
CREATE POLICY "public_read_faqs"
  ON faqs FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recruitments
      WHERE recruitments.id = faqs.recruitment_id
        AND recruitments.is_published = true
    )
  );

DROP TRIGGER IF EXISTS faqs_updated_at ON faqs;
CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

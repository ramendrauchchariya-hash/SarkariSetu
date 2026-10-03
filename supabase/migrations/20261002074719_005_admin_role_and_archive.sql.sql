/*
# Admin Role Mechanism and Recruitment Archive Support

## Purpose
Adds the minimum safe infrastructure for admin authorization and job archiving:
1. An `is_archived` column on recruitments (soft-delete/archive).
2. A SECURITY DEFINER function `is_admin()` that checks `raw_app_meta_data->>'role' = 'admin'`
   — this is server-verifiable and user-immutable (unlike `raw_user_meta_data`).
3. Updates the public read policy on recruitments to exclude archived records.
4. Adds admin-scoped RLS policies on recruitments and all child tables so
   authenticated admins can perform CMS operations through the anon-key client.
5. Adds admin read access to audit_logs.

## Changes

### 1. recruitments table — new column
- `is_archived` (boolean, default false) — when true, the recruitment is
  archived and hidden from public listings but remains accessible to admins.

### 2. is_admin() function
- SECURITY DEFINER function that returns true if the current JWT's
  `raw_app_meta_data` has `role = 'admin'`.
- Stable, immutable, safe to use in RLS policies.

### 3. RLS policy updates
- recruitments: public SELECT now requires `is_published = true AND is_archived = false`.
  Admins get full CRUD via `is_admin()` policies.
- All child tables (posts, vacancies, important_dates, eligibility_rules,
  application_fees, selection_process, exam_patterns, documents_required,
  how_to_apply, faqs, recruitment_categories): admin CRUD via `is_admin()`.
  Public SELECT policies remain unchanged (published-parent checks).
- audit_logs: admin SELECT via `is_admin()`. No public access.

### 4. Index
- `recruitments_is_archived_idx` for filtering archived records.

## Important Notes
1. The admin role is stored in `raw_app_meta_data` which is set by the
   Supabase service role (server-side) and CANNOT be modified by the client.
   This is the secure, server-verifiable authorization mechanism.
2. To make a user an admin, set their app_metadata:
   `supabaseAdmin.auth.admin.updateUserById(userId, { app_metadata: { role: 'admin' } })`
3. The `is_admin()` function uses `auth.jwt() ->> 'role'` which reads from
   the JWT's `app_metadata.role` field — this is set at token issuance time
   and cannot be tampered with by the client.
4. Archived jobs are excluded from public queries but remain visible to
   admins in the CMS. Archiving is reversible.
5. No data is lost — `is_archived` is a boolean flag, not a delete.
*/

-- ============================================================================
-- 1. Add is_archived column to recruitments
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recruitments' AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE recruitments ADD COLUMN is_archived boolean NOT NULL DEFAULT false;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS recruitments_is_archived_idx ON recruitments (is_archived);

-- ============================================================================
-- 2. is_admin() SECURITY DEFINER function
-- ============================================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

GRANT EXECUTE ON FUNCTION is_admin() TO anon, authenticated;

-- ============================================================================
-- 3. Update recruitments RLS policies
-- ============================================================================

-- Replace public read policy to exclude archived records
DROP POLICY IF EXISTS "public_read_published_recruitments" ON recruitments;
CREATE POLICY "public_read_published_recruitments"
  ON recruitments FOR SELECT
  TO anon, authenticated
  USING (is_published = true AND is_archived = false);

-- Admin can read all recruitments (including drafts and archived)
DROP POLICY IF EXISTS "admin_read_recruitments" ON recruitments;
CREATE POLICY "admin_read_recruitments"
  ON recruitments FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admin can insert recruitments
DROP POLICY IF EXISTS "admin_insert_recruitments" ON recruitments;
CREATE POLICY "admin_insert_recruitments"
  ON recruitments FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Admin can update recruitments
DROP POLICY IF EXISTS "admin_update_recruitments" ON recruitments;
CREATE POLICY "admin_update_recruitments"
  ON recruitments FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admin can delete recruitments (used for cascade cleanup, not normal workflow)
DROP POLICY IF EXISTS "admin_delete_recruitments" ON recruitments;
CREATE POLICY "admin_delete_recruitments"
  ON recruitments FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- 4. Admin RLS policies on child tables
-- ============================================================================

-- recruitment_categories
DROP POLICY IF EXISTS "admin_read_recruitment_categories" ON recruitment_categories;
CREATE POLICY "admin_read_recruitment_categories"
  ON recruitment_categories FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_recruitment_categories" ON recruitment_categories;
CREATE POLICY "admin_insert_recruitment_categories"
  ON recruitment_categories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_recruitment_categories" ON recruitment_categories;
CREATE POLICY "admin_delete_recruitment_categories"
  ON recruitment_categories FOR DELETE
  TO authenticated
  USING (is_admin());

-- posts
DROP POLICY IF EXISTS "admin_read_posts" ON posts;
CREATE POLICY "admin_read_posts"
  ON posts FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_posts" ON posts;
CREATE POLICY "admin_insert_posts"
  ON posts FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_posts" ON posts;
CREATE POLICY "admin_update_posts"
  ON posts FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_posts" ON posts;
CREATE POLICY "admin_delete_posts"
  ON posts FOR DELETE TO authenticated USING (is_admin());

-- vacancies
DROP POLICY IF EXISTS "admin_read_vacancies" ON vacancies;
CREATE POLICY "admin_read_vacancies"
  ON vacancies FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_vacancies" ON vacancies;
CREATE POLICY "admin_insert_vacancies"
  ON vacancies FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_vacancies" ON vacancies;
CREATE POLICY "admin_update_vacancies"
  ON vacancies FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_vacancies" ON vacancies;
CREATE POLICY "admin_delete_vacancies"
  ON vacancies FOR DELETE TO authenticated USING (is_admin());

-- important_dates
DROP POLICY IF EXISTS "admin_read_important_dates" ON important_dates;
CREATE POLICY "admin_read_important_dates"
  ON important_dates FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_important_dates" ON important_dates;
CREATE POLICY "admin_insert_important_dates"
  ON important_dates FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_important_dates" ON important_dates;
CREATE POLICY "admin_update_important_dates"
  ON important_dates FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_important_dates" ON important_dates;
CREATE POLICY "admin_delete_important_dates"
  ON important_dates FOR DELETE TO authenticated USING (is_admin());

-- eligibility_rules
DROP POLICY IF EXISTS "admin_read_eligibility_rules" ON eligibility_rules;
CREATE POLICY "admin_read_eligibility_rules"
  ON eligibility_rules FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_eligibility_rules" ON eligibility_rules;
CREATE POLICY "admin_insert_eligibility_rules"
  ON eligibility_rules FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_eligibility_rules" ON eligibility_rules;
CREATE POLICY "admin_update_eligibility_rules"
  ON eligibility_rules FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_eligibility_rules" ON eligibility_rules;
CREATE POLICY "admin_delete_eligibility_rules"
  ON eligibility_rules FOR DELETE TO authenticated USING (is_admin());

-- application_fees
DROP POLICY IF EXISTS "admin_read_application_fees" ON application_fees;
CREATE POLICY "admin_read_application_fees"
  ON application_fees FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_application_fees" ON application_fees;
CREATE POLICY "admin_insert_application_fees"
  ON application_fees FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_application_fees" ON application_fees;
CREATE POLICY "admin_update_application_fees"
  ON application_fees FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_application_fees" ON application_fees;
CREATE POLICY "admin_delete_application_fees"
  ON application_fees FOR DELETE TO authenticated USING (is_admin());

-- selection_process
DROP POLICY IF EXISTS "admin_read_selection_process" ON selection_process;
CREATE POLICY "admin_read_selection_process"
  ON selection_process FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_selection_process" ON selection_process;
CREATE POLICY "admin_insert_selection_process"
  ON selection_process FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_selection_process" ON selection_process;
CREATE POLICY "admin_update_selection_process"
  ON selection_process FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_selection_process" ON selection_process;
CREATE POLICY "admin_delete_selection_process"
  ON selection_process FOR DELETE TO authenticated USING (is_admin());

-- exam_patterns
DROP POLICY IF EXISTS "admin_read_exam_patterns" ON exam_patterns;
CREATE POLICY "admin_read_exam_patterns"
  ON exam_patterns FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_exam_patterns" ON exam_patterns;
CREATE POLICY "admin_insert_exam_patterns"
  ON exam_patterns FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_exam_patterns" ON exam_patterns;
CREATE POLICY "admin_update_exam_patterns"
  ON exam_patterns FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_exam_patterns" ON exam_patterns;
CREATE POLICY "admin_delete_exam_patterns"
  ON exam_patterns FOR DELETE TO authenticated USING (is_admin());

-- documents_required
DROP POLICY IF EXISTS "admin_read_documents_required" ON documents_required;
CREATE POLICY "admin_read_documents_required"
  ON documents_required FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_documents_required" ON documents_required;
CREATE POLICY "admin_insert_documents_required"
  ON documents_required FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_documents_required" ON documents_required;
CREATE POLICY "admin_update_documents_required"
  ON documents_required FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_documents_required" ON documents_required;
CREATE POLICY "admin_delete_documents_required"
  ON documents_required FOR DELETE TO authenticated USING (is_admin());

-- how_to_apply
DROP POLICY IF EXISTS "admin_read_how_to_apply" ON how_to_apply;
CREATE POLICY "admin_read_how_to_apply"
  ON how_to_apply FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_how_to_apply" ON how_to_apply;
CREATE POLICY "admin_insert_how_to_apply"
  ON how_to_apply FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_how_to_apply" ON how_to_apply;
CREATE POLICY "admin_update_how_to_apply"
  ON how_to_apply FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_how_to_apply" ON how_to_apply;
CREATE POLICY "admin_delete_how_to_apply"
  ON how_to_apply FOR DELETE TO authenticated USING (is_admin());

-- faqs
DROP POLICY IF EXISTS "admin_read_faqs" ON faqs;
CREATE POLICY "admin_read_faqs"
  ON faqs FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_faqs" ON faqs;
CREATE POLICY "admin_insert_faqs"
  ON faqs FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_faqs" ON faqs;
CREATE POLICY "admin_update_faqs"
  ON faqs FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_faqs" ON faqs;
CREATE POLICY "admin_delete_faqs"
  ON faqs FOR DELETE TO authenticated USING (is_admin());

-- ============================================================================
-- 5. audit_logs admin access
-- ============================================================================
DROP POLICY IF EXISTS "admin_read_audit_logs" ON audit_logs;
CREATE POLICY "admin_read_audit_logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_audit_logs" ON audit_logs;
CREATE POLICY "admin_insert_audit_logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- ============================================================================
-- 6. Admin access to reference tables (organizations, categories, states)
-- ============================================================================
DROP POLICY IF EXISTS "admin_insert_organizations" ON organizations;
CREATE POLICY "admin_insert_organizations"
  ON organizations FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_organizations" ON organizations;
CREATE POLICY "admin_update_organizations"
  ON organizations FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories"
  ON categories FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories"
  ON categories FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

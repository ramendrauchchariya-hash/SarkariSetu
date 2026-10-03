/*
# Foundation: Reference Data and Core Recruitment Tables

## Purpose
Creates the foundational tables for the SarkariSetu government jobs platform:
reference/lookup tables (organizations, categories, states) and the central
recruitments table with its many-to-many category junction table.

## New Tables

### 1. organizations
Government bodies that conduct recruitments (SSC, UPSC, Indian Railways, etc.)
- id (uuid PK)
- name (text, unique, NOT NULL) — full organization name
- slug (text, unique, NOT NULL) — URL-safe identifier
- short_name (text) — abbreviated name for compact display
- organization_type (text) — 'central', 'state', 'psu', 'banking', etc.
- description (text) — brief description
- official_website_url (text) — official website
- logo_url (text) — logo image URL
- is_active (boolean, default true)
- created_at, updated_at (timestamptz)

### 2. categories
Qualification/eligibility categories (10th Pass, Graduate, ITI, etc.)
- id (uuid PK)
- name (text, unique, NOT NULL)
- slug (text, unique, NOT NULL)
- description (text)
- is_active (boolean, default true)
- created_at, updated_at

### 3. states
Indian states and union territories for location filtering.
- id (uuid PK)
- name (text, unique, NOT NULL)
- slug (text, unique, NOT NULL)
- is_active (boolean, default true)
- created_at

### 4. recruitments
The central recruitment/government job table.
- id (uuid PK)
- title (text, NOT NULL)
- slug (text, unique, NOT NULL) — SEO-friendly URL slug
- organization_id (uuid FK → organizations)
- description (text)
- department (text) — department slug for backwards compatibility
- location_type (text) — 'all-india' or 'state-specific'
- job_type (text) — 'permanent', 'contract', 'apprenticeship', 'internship'
- application_start (date) — when applications open
- application_end (date) — when applications close
- exam_date (date) — tentative or confirmed exam date
- posted_date (date) — when the recruitment was published
- last_updated (timestamptz) — last content update
- last_verified (timestamptz) — last verification by admin
- verification_status (text, default 'unverified') — 'unverified', 'pending', 'verified'
- official_notification_url (text)
- official_application_url (text)
- official_website_url (text)
- status_override (text) — optional manual override of computed status
- is_published (boolean, default false) — only published records are public
- created_at, updated_at (timestamptz)

### 5. recruitment_categories
Many-to-many junction between recruitments and categories.
- recruitment_id (uuid FK → recruitments, ON DELETE CASCADE)
- category_id (uuid FK → categories)
- PRIMARY KEY (recruitment_id, category_id)

## Indexes
- recruitments.slug (unique) — SEO URL lookups
- recruitments.is_published — public listing queries
- recruitments.application_end — closing-soon calculations
- recruitments.posted_date DESC — latest jobs ordering
- recruitments.organization_id — filter by organization
- organizations.slug (unique)
- categories.slug (unique)
- states.slug (unique)

## Security (RLS)
All tables have RLS enabled.

- organizations, categories, states: public read (anon + authenticated), no public writes.
  Admin content management will use the service role key (server-side), which bypasses RLS.
- recruitments: public read for published records only (is_published = true), no public writes.
- recruitment_categories: public read when the parent recruitment is published, no public writes.

## Important Notes
1. The app currently has no sign-in screen, so public read policies use TO anon, authenticated.
   This ensures the anon-key frontend can read published data.
2. User-owned tables (saved_jobs, profiles, etc.) will be created in a later migration with
   authenticated-only policies.
3. All date columns use the SQL `date` type (not timestamptz) since recruitment dates are
   calendar dates without time components. Timestamps (created_at, updated_at, last_verified,
   last_updated) use timestamptz.
4. Status (upcoming/open/closing-soon/closed) will be computed from application dates at
   query time, not stored as a column. The status_override field allows manual override.
*/

-- ============================================================================
-- 1. organizations
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  short_name text,
  organization_type text,
  description text,
  official_website_url text,
  logo_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS organizations_slug_key ON organizations (slug);
CREATE UNIQUE INDEX IF NOT EXISTS organizations_name_key ON organizations (name);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_organizations" ON organizations;
CREATE POLICY "public_read_organizations"
  ON organizations FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================================
-- 2. categories
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_key ON categories (slug);
CREATE UNIQUE INDEX IF NOT EXISTS categories_name_key ON categories (name);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================================
-- 3. states
-- ============================================================================
CREATE TABLE IF NOT EXISTS states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS states_slug_key ON states (slug);
CREATE UNIQUE INDEX IF NOT EXISTS states_name_key ON states (name);

ALTER TABLE states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_states" ON states;
CREATE POLICY "public_read_states"
  ON states FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================================
-- 4. recruitments
-- ============================================================================
CREATE TABLE IF NOT EXISTS recruitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  description text,
  department text,
  location_type text DEFAULT 'all-india',
  job_type text DEFAULT 'permanent',
  application_start date,
  application_end date,
  exam_date date,
  posted_date date DEFAULT CURRENT_DATE,
  last_updated timestamptz NOT NULL DEFAULT now(),
  last_verified timestamptz,
  verification_status text NOT NULL DEFAULT 'unverified',
  official_notification_url text,
  official_application_url text,
  official_website_url text,
  status_override text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS recruitments_slug_key ON recruitments (slug);
CREATE INDEX IF NOT EXISTS recruitments_is_published_idx ON recruitments (is_published);
CREATE INDEX IF NOT EXISTS recruitments_application_end_idx ON recruitments (application_end);
CREATE INDEX IF NOT EXISTS recruitments_posted_date_idx ON recruitments (posted_date DESC);
CREATE INDEX IF NOT EXISTS recruitments_organization_id_idx ON recruitments (organization_id);
CREATE INDEX IF NOT EXISTS recruitments_is_published_posted_date_idx ON recruitments (is_published, posted_date DESC);

ALTER TABLE recruitments ENABLE ROW LEVEL SECURITY;

-- Public can only read published recruitments
DROP POLICY IF EXISTS "public_read_published_recruitments" ON recruitments;
CREATE POLICY "public_read_published_recruitments"
  ON recruitments FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- ============================================================================
-- 5. recruitment_categories
-- ============================================================================
CREATE TABLE IF NOT EXISTS recruitment_categories (
  recruitment_id uuid NOT NULL REFERENCES recruitments(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (recruitment_id, category_id)
);

CREATE INDEX IF NOT EXISTS recruitment_categories_category_id_idx ON recruitment_categories (category_id);

ALTER TABLE recruitment_categories ENABLE ROW LEVEL SECURITY;

-- Public can read category assignments for published recruitments
DROP POLICY IF EXISTS "public_read_recruitment_categories" ON recruitment_categories;
CREATE POLICY "public_read_recruitment_categories"
  ON recruitment_categories FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recruitments
      WHERE recruitments.id = recruitment_categories.recruitment_id
        AND recruitments.is_published = true
    )
  );

-- ============================================================================
-- updated_at trigger helper
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS organizations_updated_at ON organizations;
CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS categories_updated_at ON categories;
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS recruitments_updated_at ON recruitments;
CREATE TRIGGER recruitments_updated_at BEFORE UPDATE ON recruitments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

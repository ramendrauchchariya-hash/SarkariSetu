/*
# Admin Infrastructure: Audit Logs and Site Settings

## Purpose
Creates the final two tables needed for admin accountability and configurable
site settings.

## New Tables

### 24. audit_logs
Tracks admin actions for accountability. Records who changed what, when,
and the old/new state of the entity.
- id (uuid PK)
- user_id (uuid) — the admin who performed the action (references auth.users)
- action (text, NOT NULL) — e.g., 'create', 'update', 'delete', 'publish', 'unpublish'
- entity_type (text, NOT NULL) — e.g., 'recruitment', 'organization', 'result'
- entity_id (uuid) — the ID of the affected entity
- old_data (jsonb) — previous state (null for creates)
- new_data (jsonb) — new state (null for deletes)
- created_at (timestamptz)

### 25. site_settings
Key-value configuration store for site-wide settings.
- id (uuid PK)
- key (text, unique, NOT NULL) — setting key, e.g., 'site_name', 'default_verification_status'
- value (text) — setting value
- description (text) — what this setting controls
- updated_at (timestamptz)

## Security (RLS)

### audit_logs
- No public access (no anon, no authenticated read). Access is via service role
  only (server-side admin code), which bypasses RLS. Admin role policies will be
  added when role-based access is implemented.

### site_settings
- SELECT: public read (anon + authenticated) — site settings like site name are
  needed by the frontend. No public writes — admin uses service role key.

## Important Notes
1. audit_logs stores old_data and new_data as JSONB for flexible diff tracking.
2. site_settings uses a simple key-value structure. Complex settings can store
   JSON in the value column if needed.
3. Neither table has ON DELETE CASCADE to auth.users — audit logs should persist
   even if an admin user is deleted, for historical accountability.
*/

-- ============================================================================
-- 24. audit_logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS audit_logs_entity_type_idx ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs (created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- No policies — audit logs are only accessible via the service role key (bypasses RLS).
-- Admin role policies will be added when role-based access is implemented.

-- ============================================================================
-- 25. site_settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  value text,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS site_settings_key_key ON site_settings (key);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_settings" ON site_settings;
CREATE POLICY "public_read_site_settings"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

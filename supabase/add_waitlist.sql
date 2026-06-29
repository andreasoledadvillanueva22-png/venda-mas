-- ============================================================================
-- Waitlist de marketing — captura de emails pre-lanzamiento
-- Ejecutar en Supabase SQL Editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON waitlist TO anon;
GRANT SELECT ON waitlist TO authenticated;

DROP POLICY IF EXISTS "Cualquiera puede unirse a la waitlist" ON waitlist;
CREATE POLICY "Cualquiera puede unirse a la waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Solo admins ven la waitlist" ON waitlist;
CREATE POLICY "Solo admins ven la waitlist"
  ON waitlist FOR SELECT
  USING (auth.role() = 'authenticated');

COMMENT ON TABLE waitlist IS 'Emails capturados desde la landing page de marketing';

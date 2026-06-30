-- Permisos para store_design_settings (admin con service role + owners autenticados)
GRANT SELECT, INSERT, UPDATE ON store_design_settings TO authenticated;
GRANT ALL ON store_design_settings TO service_role;

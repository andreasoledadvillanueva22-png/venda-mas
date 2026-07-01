-- Modo prueba para credenciales TEST de Mercado Pago por tienda
-- Ejecutar en Supabase SQL Editor

ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_test_mode BOOLEAN DEFAULT FALSE;

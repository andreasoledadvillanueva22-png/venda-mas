-- Habilitar efectivo contra entrega por tienda
ALTER TABLE stores ADD COLUMN IF NOT EXISTS cash_on_delivery_enabled BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN stores.cash_on_delivery_enabled IS 'Si true, el checkout muestra la opción de pago en efectivo al recibir';

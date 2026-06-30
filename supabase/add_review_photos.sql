-- Fotos opcionales en reseñas de producto
ALTER TABLE product_reviews ADD COLUMN IF NOT EXISTS customer_photo_url TEXT;
ALTER TABLE product_reviews ADD COLUMN IF NOT EXISTS review_photo_url TEXT;

COMMENT ON COLUMN product_reviews.customer_photo_url IS 'URL de foto/avatar del cliente';
COMMENT ON COLUMN product_reviews.review_photo_url IS 'URL de foto adjunta a la reseña';

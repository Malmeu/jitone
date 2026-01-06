-- Ajouter le support de la TVA pour les ventes
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0;

-- Mettre à jour les ventes existantes
UPDATE public.sales SET subtotal = total_amount, tax_rate = 0, tax_amount = 0 WHERE subtotal IS NULL;

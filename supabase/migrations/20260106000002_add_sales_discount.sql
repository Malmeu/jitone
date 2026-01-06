-- Ajout des colonnes discount_rate et discount_amount à la table sales
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS discount_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- Mise à jour des ventes existantes avec des valeurs par défaut
UPDATE public.sales 
SET discount_rate = 0, discount_amount = 0 
WHERE discount_rate IS NULL OR discount_amount IS NULL;

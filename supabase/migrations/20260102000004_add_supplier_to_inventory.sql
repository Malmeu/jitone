-- Ajout de la colonne supplier à la table d'inventaire
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS supplier TEXT;

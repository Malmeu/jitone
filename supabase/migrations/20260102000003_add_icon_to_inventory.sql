-- Ajout de la colonne icon à la table d'inventaire
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS icon TEXT;

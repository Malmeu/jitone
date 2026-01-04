-- Ajout de la colonne type aux catégories d'inventaire
ALTER TABLE public.inventory_categories 
ADD COLUMN IF NOT EXISTS type inventory_type DEFAULT 'repair_part';

-- Mettre à jour les catégories existantes selon les articles qu'elles contiennent (optionnel mais utile)
-- Par défaut elles sont en 'repair_part', ce qui est correct pour l'existant.

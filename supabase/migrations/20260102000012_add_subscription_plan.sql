-- migration 20260102000012_add_subscription_plan.sql

-- 1. Ajouter la colonne subscription_plan à la table establishments
ALTER TABLE public.establishments 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'standard' 
CHECK (subscription_plan IN ('standard', 'premium'));

-- 2. Mise à jour du commentaire
COMMENT ON COLUMN public.establishments.subscription_plan IS 'Type de forfait: standard (basique) ou premium (complet)';

-- 3. Mettre à jour les établissements existants vers 'premium' par défaut s'ils ont déjà des membres d'équipe (recommandé pour ne pas casser l'accès existant)
-- Sinon, ils resteront en 'standard' par le défaut.
UPDATE public.establishments e
SET subscription_plan = 'premium'
WHERE EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.establishment_id = e.id 
    AND p.role != 'owner'
);

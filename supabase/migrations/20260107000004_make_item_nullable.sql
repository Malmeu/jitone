-- Migration pour rendre le champ 'item' optionnel dans la table repairs
-- Nécessaire pour les interventions multi-appareils

ALTER TABLE public.repairs 
ALTER COLUMN item DROP NOT NULL;

-- Commentaire pour documentation
COMMENT ON COLUMN public.repairs.item IS 'Modèle de l''appareil (NULL pour les interventions multi-appareils)';

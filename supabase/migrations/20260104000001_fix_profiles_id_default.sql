-- Migration pour s'assurer que la colonne id de profiles a un défaut fonctionnel
-- Et que l'extension nécessaire est activée

-- 1. Activer l'extension pgcrypto si nécessaire (pour gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. S'assurer que la colonne id a bien le défaut
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Rendre la colonne user_id optionnelle si ce n'est pas déjà le cas (pour les invitations)
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;

-- 4. Recréer la fonction du trigger pour être plus robuste
CREATE OR REPLACE FUNCTION public.handle_new_establishment()
RETURNS TRIGGER AS $$
BEGIN
  -- On utilise un bloc BEGIN/EXCEPTION pour ignorer les erreurs d'insertion de profil
  -- si jamais le profil existe déjà d'une manière inattendue
  BEGIN
    INSERT INTO public.profiles (id, user_id, establishment_id, email, name, role, status)
    VALUES (gen_random_uuid(), NEW.user_id, NEW.id, NEW.owner_email, 'Propriétaire', 'owner', 'active')
    ON CONFLICT (email, establishment_id) DO UPDATE 
    SET user_id = EXCLUDED.user_id, role = 'owner';
  EXCEPTION WHEN OTHERS THEN
    -- On log l'erreur mais on ne bloque pas la création de l'établissement
    RAISE NOTICE 'Erreur lors de la création du profil: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

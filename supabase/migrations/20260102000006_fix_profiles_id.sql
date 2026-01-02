-- Migration pour corriger la contrainte de clé étrangère sur les profils
-- Permet d'ajouter des membres d'équipe avant qu'ils ne créent leur compte

-- 1. Supprimer la contrainte de clé étrangère existante sur id
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Ajouter une colonne user_id pour le lien avec auth.users
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Initialiser user_id pour les profils existants
UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;

-- 4. Rendre l'email unique par établissement (optionnel mais conseillé)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_establishment_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_establishment_key UNIQUE (email, establishment_id);

-- 5. Mettre à jour les fonctions de sécurité pour utiliser user_id
CREATE OR REPLACE FUNCTION public.is_team_member(record_establishment_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND establishment_id = record_establishment_id
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'manager')
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Mettre à jour les politiques RLS
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Permettre aux utilisateurs de lier leur compte s'ils se connectent avec le bon email
CREATE POLICY "Users can link their account by email"
  ON public.profiles FOR UPDATE TO authenticated
  USING (email = auth.jwt()->>'email' AND user_id IS NULL)
  WITH CHECK (user_id = auth.uid());

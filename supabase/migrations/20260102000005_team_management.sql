-- Migration pour la gestion d'équipe et des rôles

-- 1. Création de l'énumération des rôles
CREATE TYPE public.user_role AS ENUM ('owner', 'manager', 'technician');

-- 2. Création de la table des profils
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  establishment_id uuid REFERENCES public.establishments(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  name text,
  role public.user_role DEFAULT 'technician' NOT NULL,
  status text DEFAULT 'active' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Active RLS sur profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Ajout de colonnes de suivi à la table repairs
ALTER TABLE public.repairs ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.repairs ADD COLUMN IF NOT EXISTS started_at timestamp with time zone;
ALTER TABLE public.repairs ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;
ALTER TABLE public.repairs ADD COLUMN IF NOT EXISTS diagnostic_at timestamp with time zone;

-- 4. Initialisation des profils existants (pour les propriétaires actuels)
INSERT INTO public.profiles (id, establishment_id, email, role)
SELECT user_id, id, owner_email, 'owner'::public.user_role
FROM public.establishments
WHERE user_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- 5. Mise à jour des politiques RLS pour supporter l'équipe

-- Fonction pour vérifier si un utilisateur appartient à l'établissement du record
CREATE OR REPLACE FUNCTION public.is_team_member(record_establishment_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND establishment_id = record_establishment_id
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur est manager ou owner
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('owner', 'manager')
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Suppression des anciennes policies restrictives
DROP POLICY IF EXISTS "Users can view their own establishment" ON public.establishments;
DROP POLICY IF EXISTS "Users can update their own establishment" ON public.establishments;
DROP POLICY IF EXISTS "Users can view clients of their establishment" ON public.clients;
DROP POLICY IF EXISTS "Users can create clients for their establishment" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients of their establishment" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients of their establishment" ON public.clients;
DROP POLICY IF EXISTS "Users can create repairs for their establishment" ON public.repairs;
DROP POLICY IF EXISTS "Users can update repairs of their establishment" ON public.repairs;
DROP POLICY IF EXISTS "Users can delete repairs of their establishment" ON public.repairs;
DROP POLICY IF EXISTS "Users can view payments of their establishment" ON public.payments;
DROP POLICY IF EXISTS "Users can create payments for their establishment" ON public.payments;

-- Nouvelles policies basées sur l'adhésion à l'équipe
CREATE POLICY "Team members can view their establishment"
  ON public.establishments FOR SELECT TO authenticated
  USING (public.is_team_member(id));

CREATE POLICY "Managers can update their establishment"
  ON public.establishments FOR UPDATE TO authenticated
  USING (public.is_team_member(id) AND public.is_manager());

CREATE POLICY "Team members can view clients"
  ON public.clients FOR SELECT TO authenticated
  USING (public.is_team_member(establishment_id));

CREATE POLICY "Team members can manage clients"
  ON public.clients FOR ALL TO authenticated
  USING (public.is_team_member(establishment_id));

CREATE POLICY "Team members can view repairs"
  ON public.repairs FOR SELECT TO authenticated
  USING (public.is_team_member(establishment_id));

CREATE POLICY "Team members can manage repairs"
  ON public.repairs FOR ALL TO authenticated
  USING (public.is_team_member(establishment_id));

CREATE POLICY "Managers can view payments"
  ON public.payments FOR SELECT TO authenticated
  USING (public.is_team_member(establishment_id) AND public.is_manager());

CREATE POLICY "Managers can manage payments"
  ON public.payments FOR ALL TO authenticated
  USING (public.is_team_member(establishment_id) AND public.is_manager());

-- Policies pour la table profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Team members can view other team members"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_team_member(establishment_id));

CREATE POLICY "Managers can manage team members"
  ON public.profiles FOR ALL TO authenticated
  USING (public.is_team_member(establishment_id) AND public.is_manager());

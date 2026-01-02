-- Migration pour automatiser la création des profils propriétaires
-- Et s'assurer que les utilisateurs invités ne créent pas d'établissements en doublon

-- 1. Fonction pour créer un profil automatique lors de la création d'un établissement
CREATE OR REPLACE FUNCTION public.handle_new_establishment()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer le profil pour le propriétaire si aucun n'existe déjà
  -- (Si un profil existe déjà avec cet email, c'est probablement un technicien invité, 
  -- mais ici on parle de l'email du propriétaire défini dans owner_email)
  
  INSERT INTO public.profiles (user_id, establishment_id, email, name, role, status)
  VALUES (NEW.user_id, NEW.id, NEW.owner_email, 'Propriétaire', 'owner', 'active')
  ON CONFLICT (email, establishment_id) DO UPDATE 
  SET user_id = EXCLUDED.user_id, role = 'owner';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger associé
DROP TRIGGER IF EXISTS on_establishment_created ON public.establishments;
CREATE TRIGGER on_establishment_created
  AFTER INSERT ON public.establishments
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_establishment();

-- 3. Nettoyage des établissements "vides" créés par erreur par des techniciens
-- Si un technicien a un profil dans un autre établissement, il ne devrait pas avoir son propre établissement
DELETE FROM public.establishments
WHERE id IN (
  SELECT e.id 
  FROM public.establishments e
  JOIN public.profiles p ON p.user_id = e.user_id
  WHERE p.role = 'technician'
  AND p.establishment_id != e.id
);

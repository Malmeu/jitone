-- migration 20260102000010_fix_inventory_rls_for_team.sql

-- 1. Mise à jour de l'inventaire pour permettre l'accès à l'équipe
DROP POLICY IF EXISTS "Les établissements peuvent voir leur inventaire" ON public.inventory;
CREATE POLICY "Les établissements peuvent voir leur inventaire"
ON public.inventory FOR SELECT
USING (public.is_team_member(establishment_id));

DROP POLICY IF EXISTS "Les établissements peuvent insérer dans leur inventaire" ON public.inventory;
CREATE POLICY "Les établissements peuvent insérer dans leur inventaire"
ON public.inventory FOR INSERT
WITH CHECK (public.is_team_member(establishment_id));

DROP POLICY IF EXISTS "Les établissements peuvent modifier leur inventaire" ON public.inventory;
CREATE POLICY "Les établissements peuvent modifier leur inventaire"
ON public.inventory FOR UPDATE
USING (public.is_team_member(establishment_id));

-- 2. Mise à jour des catégories d'inventaire
DROP POLICY IF EXISTS "Les établissements peuvent voir leurs propres catégories" ON public.inventory_categories;
CREATE POLICY "Les établissements peuvent voir leurs propres catégories"
ON public.inventory_categories FOR SELECT
USING (public.is_team_member(establishment_id));

-- 3. Mise à jour des pièces de réparation (repair_parts)
DROP POLICY IF EXISTS "Les établissements peuvent voir les pièces de leurs réparations" ON public.repair_parts;
CREATE POLICY "Les établissements peuvent voir les pièces de leurs réparations"
ON public.repair_parts FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.repairs r 
    WHERE r.id = repair_parts.repair_id 
    AND public.is_team_member(r.establishment_id)
));

DROP POLICY IF EXISTS "Les établissements peuvent ajouter des pièces à leurs réparations" ON public.repair_parts;
CREATE POLICY "Les établissements peuvent ajouter des pièces à leurs réparations"
ON public.repair_parts FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.repairs r 
    WHERE r.id = repair_parts.repair_id 
    AND public.is_team_member(r.establishment_id)
));

DROP POLICY IF EXISTS "Les établissements peuvent supprimer des pièces de leurs réparations" ON public.repair_parts;
CREATE POLICY "Les établissements peuvent supprimer des pièces de leurs réparations"
ON public.repair_parts FOR DELETE
USING (EXISTS (
    SELECT 1 FROM public.repairs r 
    WHERE r.id = repair_parts.repair_id 
    AND public.is_team_member(r.establishment_id)
));

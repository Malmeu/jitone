-- Ajout de policies pour les administrateurs
-- Cela permet aux admins de voir tous les établissements même si la SERVICE_ROLE_KEY est manquante

CREATE POLICY "Admins can view all establishments"
  ON public.establishments FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' IN ('admin@repairtrack.dz', 'contact@repairtrack.dz'));

CREATE POLICY "Admins can update all establishments"
  ON public.establishments FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' IN ('admin@repairtrack.dz', 'contact@repairtrack.dz'));

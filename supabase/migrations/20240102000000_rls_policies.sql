-- Policies pour les establishments
-- Permettre aux utilisateurs authentifiés de créer leur établissement
create policy "Users can create their own establishment"
  on public.establishments for insert
  to authenticated
  with check (owner_email = auth.jwt() ->> 'email');

-- Permettre aux utilisateurs de voir leur propre établissement
create policy "Users can view their own establishment"
  on public.establishments for select
  to authenticated
  using (owner_email = auth.jwt() ->> 'email');

-- Permettre aux utilisateurs de modifier leur propre établissement
create policy "Users can update their own establishment"
  on public.establishments for update
  to authenticated
  using (owner_email = auth.jwt() ->> 'email');

-- Policies pour les clients
-- Les utilisateurs peuvent voir les clients de leur établissement
create policy "Users can view clients of their establishment"
  on public.clients for select
  to authenticated
  using (
    establishment_id in (
      select id from public.establishments 
      where owner_email = auth.jwt() ->> 'email'
    )
  );

-- Les utilisateurs peuvent créer des clients pour leur établissement
create policy "Users can create clients for their establishment"
  on public.clients for insert
  to authenticated
  with check (
    establishment_id in (
      select id from public.establishments 
      where owner_email = auth.jwt() ->> 'email'
    )
  );

-- Les utilisateurs peuvent modifier les clients de leur établissement
create policy "Users can update clients of their establishment"
  on public.clients for update
  to authenticated
  using (
    establishment_id in (
      select id from public.establishments 
      where owner_email = auth.jwt() ->> 'email'
    )
  );

-- Policies pour les repairs
-- Lecture publique par code (pour les clients)
create policy "Anyone can view repair by code"
  on public.repairs for select
  to anon, authenticated
  using (true);

-- Les utilisateurs peuvent voir les réparations de leur établissement
create policy "Users can view repairs of their establishment"
  on public.repairs for select
  to authenticated
  using (
    establishment_id in (
      select id from public.establishments 
      where owner_email = auth.jwt() ->> 'email'
    )
  );

-- Les utilisateurs peuvent créer des réparations pour leur établissement
create policy "Users can create repairs for their establishment"
  on public.repairs for insert
  to authenticated
  with check (
    establishment_id in (
      select id from public.establishments 
      where owner_email = auth.jwt() ->> 'email'
    )
  );

-- Les utilisateurs peuvent modifier les réparations de leur établissement
create policy "Users can update repairs of their establishment"
  on public.repairs for update
  to authenticated
  using (
    establishment_id in (
      select id from public.establishments 
      where owner_email = auth.jwt() ->> 'email'
    )
  );

-- Policies pour les payments
create policy "Users can view payments of their establishment"
  on public.payments for select
  to authenticated
  using (
    establishment_id in (
      select id from public.establishments 
      where owner_email = auth.jwt() ->> 'email'
    )
  );

create policy "Users can create payments for their establishment"
  on public.payments for insert
  to authenticated
  with check (
    establishment_id in (
      select id from public.establishments 
      where owner_email = auth.jwt() ->> 'email'
    )
  );

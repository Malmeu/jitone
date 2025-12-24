-- Supprimer les anciennes policies
drop policy if exists "Users can create their own establishment" on public.establishments;
drop policy if exists "Users can view their own establishment" on public.establishments;
drop policy if exists "Users can update their own establishment" on public.establishments;
drop policy if exists "Users can view clients of their establishment" on public.clients;
drop policy if exists "Users can create clients for their establishment" on public.clients;
drop policy if exists "Users can update clients of their establishment" on public.clients;
drop policy if exists "Anyone can view repair by code" on public.repairs;
drop policy if exists "Users can view repairs of their establishment" on public.repairs;
drop policy if exists "Users can create repairs for their establishment" on public.repairs;
drop policy if exists "Users can update repairs of their establishment" on public.repairs;
drop policy if exists "Users can view payments of their establishment" on public.payments;
drop policy if exists "Users can create payments for their establishment" on public.payments;

-- Nouvelles policies corrigées pour establishments
create policy "Users can create their own establishment"
  on public.establishments for insert
  to authenticated
  with check (owner_email = (select auth.jwt()->>'email'));

create policy "Users can view their own establishment"
  on public.establishments for select
  to authenticated
  using (owner_email = (select auth.jwt()->>'email'));

create policy "Users can update their own establishment"
  on public.establishments for update
  to authenticated
  using (owner_email = (select auth.jwt()->>'email'));

-- Policies pour les clients
create policy "Users can view clients of their establishment"
  on public.clients for select
  to authenticated
  using (
    establishment_id in (
      select id from public.establishments 
      where owner_email = (select auth.jwt()->>'email')
    )
  );

create policy "Users can create clients for their establishment"
  on public.clients for insert
  to authenticated
  with check (
    establishment_id in (
      select id from public.establishments 
      where owner_email = (select auth.jwt()->>'email')
    )
  );

create policy "Users can update clients of their establishment"
  on public.clients for update
  to authenticated
  using (
    establishment_id in (
      select id from public.establishments 
      where owner_email = (select auth.jwt()->>'email')
    )
  );

create policy "Users can delete clients of their establishment"
  on public.clients for delete
  to authenticated
  using (
    establishment_id in (
      select id from public.establishments 
      where owner_email = (select auth.jwt()->>'email')
    )
  );

-- Policies pour les repairs
-- Lecture publique par code (pour les clients non authentifiés)
create policy "Anyone can view repair by code"
  on public.repairs for select
  to anon, authenticated
  using (true);

create policy "Users can create repairs for their establishment"
  on public.repairs for insert
  to authenticated
  with check (
    establishment_id in (
      select id from public.establishments 
      where owner_email = (select auth.jwt()->>'email')
    )
  );

create policy "Users can update repairs of their establishment"
  on public.repairs for update
  to authenticated
  using (
    establishment_id in (
      select id from public.establishments 
      where owner_email = (select auth.jwt()->>'email')
    )
  );

create policy "Users can delete repairs of their establishment"
  on public.repairs for delete
  to authenticated
  using (
    establishment_id in (
      select id from public.establishments 
      where owner_email = (select auth.jwt()->>'email')
    )
  );

-- Policies pour les payments
create policy "Users can view payments of their establishment"
  on public.payments for select
  to authenticated
  using (
    establishment_id in (
      select id from public.establishments 
      where owner_email = (select auth.jwt()->>'email')
    )
  );

create policy "Users can create payments for their establishment"
  on public.payments for insert
  to authenticated
  with check (
    establishment_id in (
      select id from public.establishments 
      where owner_email = (select auth.jwt()->>'email')
    )
  );

create policy "Users can update payments of their establishment"
  on public.payments for update
  to authenticated
  using (
    establishment_id in (
      select id from public.establishments 
      where owner_email = (select auth.jwt()->>'email')
    )
  );

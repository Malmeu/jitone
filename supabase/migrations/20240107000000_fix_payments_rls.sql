-- Supprimer les anciennes policies de payments si elles existent
drop policy if exists "Users can view their establishment payments" on public.payments;
drop policy if exists "Users can create payments for their establishment" on public.payments;
drop policy if exists "Users can update their establishment payments" on public.payments;

-- Créer les nouvelles policies pour payments avec repair_id
create policy "Users can view their establishment payments"
  on public.payments for select
  to authenticated
  using (
    exists (
      select 1 from public.repairs
      where repairs.id = payments.repair_id
      and exists (
        select 1 from public.establishments
        where establishments.id = repairs.establishment_id
        and establishments.user_id = auth.uid()
      )
    )
  );

create policy "Users can create payments for their repairs"
  on public.payments for insert
  to authenticated
  with check (
    exists (
      select 1 from public.repairs
      where repairs.id = payments.repair_id
      and exists (
        select 1 from public.establishments
        where establishments.id = repairs.establishment_id
        and establishments.user_id = auth.uid()
      )
    )
  );

create policy "Users can update their establishment payments"
  on public.payments for update
  to authenticated
  using (
    exists (
      select 1 from public.repairs
      where repairs.id = payments.repair_id
      and exists (
        select 1 from public.establishments
        where establishments.id = repairs.establishment_id
        and establishments.user_id = auth.uid()
      )
    )
  );

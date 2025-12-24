-- Ajouter des colonnes pour les paiements dans la table repairs
alter table public.repairs add column if not exists payment_status text default 'unpaid' check (payment_status in ('unpaid', 'paid', 'partial'));
alter table public.repairs add column if not exists payment_method text check (payment_method in ('cash', 'baridimob', 'other'));
alter table public.repairs add column if not exists paid_amount numeric(10,2) default 0;
alter table public.repairs add column if not exists paid_at timestamp with time zone;

-- Ajouter repair_id à la table payments si elle n'existe pas
alter table public.payments add column if not exists repair_id uuid references public.repairs(id);

-- Mettre à jour la table payments pour supporter BaridiMob
alter table public.payments add column if not exists payment_method text default 'cash' check (payment_method in ('cash', 'baridimob', 'other'));

-- Index pour les recherches de paiements
create index if not exists idx_repairs_payment_status on public.repairs(payment_status);
create index if not exists idx_payments_repair_id on public.payments(repair_id);

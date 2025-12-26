-- Ajouter les colonnes de gestion d'abonnement aux establishments
alter table public.establishments add column if not exists subscription_status text default 'trial' check (subscription_status in ('trial', 'active', 'expired', 'cancelled'));
alter table public.establishments add column if not exists trial_ends_at timestamp with time zone default (now() + interval '30 days');
alter table public.establishments add column if not exists subscription_ends_at timestamp with time zone;
alter table public.establishments add column if not exists max_repairs integer default 100;
alter table public.establishments add column if not exists created_at timestamp with time zone default now();

-- Commentaires
comment on column public.establishments.subscription_status is 'Statut de l''abonnement: trial, active, expired, cancelled';
comment on column public.establishments.trial_ends_at is 'Date de fin de la période d''essai (30 jours par défaut)';
comment on column public.establishments.subscription_ends_at is 'Date de fin de l''abonnement payant';
comment on column public.establishments.max_repairs is 'Nombre maximum de réparations pendant l''essai';

-- Fonction pour vérifier si l'établissement peut créer des réparations
create or replace function public.can_create_repair(establishment_uuid uuid)
returns boolean
language plpgsql
security definer
as $$
declare
    v_status text;
    v_trial_ends timestamp with time zone;
    v_subscription_ends timestamp with time zone;
    v_repair_count integer;
    v_max_repairs integer;
begin
    -- Récupérer les infos de l'établissement
    select subscription_status, trial_ends_at, subscription_ends_at, max_repairs
    into v_status, v_trial_ends, v_subscription_ends, v_max_repairs
    from public.establishments
    where id = establishment_uuid;

    -- Si l'établissement n'existe pas
    if not found then
        return false;
    end if;

    -- Si abonnement actif et non expiré
    if v_status = 'active' and (v_subscription_ends is null or v_subscription_ends > now()) then
        return true;
    end if;

    -- Si en période d'essai
    if v_status = 'trial' and v_trial_ends > now() then
        -- Vérifier le nombre de réparations
        select count(*)
        into v_repair_count
        from public.repairs
        where establishment_id = establishment_uuid;

        return v_repair_count < v_max_repairs;
    end if;

    -- Sinon, pas autorisé
    return false;
end;
$$;

-- Index pour optimiser les requêtes
create index if not exists idx_establishments_subscription on public.establishments(subscription_status, trial_ends_at, subscription_ends_at);

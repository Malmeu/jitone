-- Ajouter des colonnes pour le déblocage dans la table repairs
alter table public.repairs add column if not exists is_unlock boolean default false;
alter table public.repairs add column if not exists imei_sn text;

-- Index pour rechercher par IMEI/SN
create index if not exists idx_repairs_imei_sn on public.repairs(imei_sn);

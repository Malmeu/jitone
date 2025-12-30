-- Ajouter une colonne pour les informations supplémentaires dans la table repairs
alter table public.repairs 
add column if not exists additional_info text;

-- Ajouter un commentaire pour documenter la colonne
comment on column public.repairs.additional_info is 
'Informations supplémentaires ou notes concernant la réparation';

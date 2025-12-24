-- Ajouter une colonne note dans la table payments pour les détails supplémentaires
alter table public.payments add column if not exists note text;

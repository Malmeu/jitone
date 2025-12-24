-- Ajouter une colonne pour le logo de l'établissement
alter table public.establishments add column if not exists logo_url text;

-- Ajouter des colonnes pour la personnalisation du ticket
alter table public.establishments add column if not exists ticket_color text default '#007AFF';
alter table public.establishments add column if not exists ticket_message text;

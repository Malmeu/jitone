-- Mise à jour de la table contact_messages pour remplacer email par phone
ALTER TABLE public.contact_messages 
RENAME COLUMN email TO phone;

-- Changer le type en TEXT au cas où (c'est déjà TEXT normalement)
ALTER TABLE public.contact_messages 
ALTER COLUMN phone TYPE TEXT;

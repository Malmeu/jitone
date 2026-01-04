-- Migration pour différencier les types de stock et ajouter les ventes
-- 1. Ajouter le type d'inventaire
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_type') THEN
        CREATE TYPE inventory_type AS ENUM ('repair_part', 'sale_item');
    END IF;
END $$;

ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS type inventory_type DEFAULT 'repair_part';

-- Mettre à jour les éléments existants (par défaut ce sont des pièces de réparation)
UPDATE public.inventory SET type = 'repair_part' WHERE type IS NULL;

-- 2. Création de la table des ventes (Sales)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    total_amount DECIMAL(12,2) DEFAULT 0 NOT NULL,
    payment_method TEXT, -- 'cash', 'card', 'transfer'
    client_name TEXT,
    client_phone TEXT,
    notes TEXT,
    user_id UUID REFERENCES auth.users(id) -- Qui a fait la vente
);

-- 3. Articles vendus (Sales Items) - Pour l'historique détaillé et lien stock
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
    inventory_id UUID REFERENCES inventory(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    item_name TEXT NOT NULL -- Copie du nom pour l'historique si l'article est supprimé du stock
);

-- 4. Activer RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Team members can view sales"
ON public.sales FOR SELECT TO authenticated
USING (public.is_team_member(establishment_id));

CREATE POLICY "Team members can insert sales"
ON public.sales FOR INSERT TO authenticated
WITH CHECK (public.is_team_member(establishment_id));

CREATE POLICY "Team members can view sale items"
ON public.sale_items FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.sales 
    WHERE sales.id = sale_items.sale_id 
    AND public.is_team_member(sales.establishment_id)
));

CREATE POLICY "Team members can insert sale items"
ON public.sale_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM public.sales 
    WHERE sales.id = sale_items.sale_id 
    AND public.is_team_member(sales.establishment_id)
));

-- Création de la table des catégories d'inventaire
CREATE TABLE IF NOT EXISTS inventory_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Création de la table d'inventaire
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
    category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    sku TEXT,
    description TEXT,
    current_stock INTEGER DEFAULT 0 NOT NULL,
    low_stock_threshold INTEGER DEFAULT 5 NOT NULL,
    cost_price DECIMAL(12,2) DEFAULT 0 NOT NULL,
    selling_price DECIMAL(12,2) DEFAULT 0 NOT NULL,
    location TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Activation de RLS
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les catégories
DROP POLICY IF EXISTS "Les établissements peuvent voir leurs propres catégories" ON inventory_categories;
CREATE POLICY "Les établissements peuvent voir leurs propres catégories"
ON inventory_categories FOR SELECT
USING (establishment_id IN (
    SELECT id FROM establishments WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Les établissements peuvent insérer leurs propres catégories" ON inventory_categories;
CREATE POLICY "Les établissements peuvent insérer leurs propres catégories"
ON inventory_categories FOR INSERT
WITH CHECK (establishment_id IN (
    SELECT id FROM establishments WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Les établissements peuvent modifier leurs propres catégories" ON inventory_categories;
CREATE POLICY "Les établissements peuvent modifier leurs propres catégories"
ON inventory_categories FOR UPDATE
USING (establishment_id IN (
    SELECT id FROM establishments WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Les établissements peuvent supprimer leurs propres catégories" ON inventory_categories;
CREATE POLICY "Les établissements peuvent supprimer leurs propres catégories"
ON inventory_categories FOR DELETE
USING (establishment_id IN (
    SELECT id FROM establishments WHERE user_id = auth.uid()
));

-- Politiques RLS pour l'inventaire
DROP POLICY IF EXISTS "Les établissements peuvent voir leur inventaire" ON inventory;
CREATE POLICY "Les établissements peuvent voir leur inventaire"
ON inventory FOR SELECT
USING (establishment_id IN (
    SELECT id FROM establishments WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Les établissements peuvent insérer dans leur inventaire" ON inventory;
CREATE POLICY "Les établissements peuvent insérer dans leur inventaire"
ON inventory FOR INSERT
WITH CHECK (establishment_id IN (
    SELECT id FROM establishments WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Les établissements peuvent modifier leur inventaire" ON inventory;
CREATE POLICY "Les établissements peuvent modifier leur inventaire"
ON inventory FOR UPDATE
USING (establishment_id IN (
    SELECT id FROM establishments WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Les établissements peuvent supprimer leur inventaire" ON inventory;
CREATE POLICY "Les établissements peuvent supprimer leur inventaire"
ON inventory FOR DELETE
USING (establishment_id IN (
    SELECT id FROM establishments WHERE user_id = auth.uid()
));

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at
BEFORE UPDATE ON inventory
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

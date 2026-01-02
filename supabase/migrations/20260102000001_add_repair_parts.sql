-- Table pour lier les pièces de l'inventaire aux réparations
CREATE TABLE IF NOT EXISTS repair_parts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    repair_id UUID REFERENCES repairs(id) ON DELETE CASCADE NOT NULL,
    inventory_id UUID REFERENCES inventory(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    unit_cost DECIMAL(12,2) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Activation de RLS
ALTER TABLE repair_parts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour repair_parts
DROP POLICY IF EXISTS "Les établissements peuvent voir les pièces de leurs réparations" ON repair_parts;
CREATE POLICY "Les établissements peuvent voir les pièces de leurs réparations"
ON repair_parts FOR SELECT
USING (repair_id IN (
    SELECT id FROM repairs WHERE establishment_id IN (
        SELECT id FROM establishments WHERE user_id = auth.uid()
    )
));

DROP POLICY IF EXISTS "Les établissements peuvent ajouter des pièces à leurs réparations" ON repair_parts;
CREATE POLICY "Les établissements peuvent ajouter des pièces à leurs réparations"
ON repair_parts FOR INSERT
WITH CHECK (repair_id IN (
    SELECT id FROM repairs WHERE establishment_id IN (
        SELECT id FROM establishments WHERE user_id = auth.uid()
    )
));

DROP POLICY IF EXISTS "Les établissements peuvent supprimer des pièces de leurs réparations" ON repair_parts;
CREATE POLICY "Les établissements peuvent supprimer des pièces de leurs réparations"
ON repair_parts FOR DELETE
USING (repair_id IN (
    SELECT id FROM repairs WHERE establishment_id IN (
        SELECT id FROM establishments WHERE user_id = auth.uid()
    )
));

-- Trigger pour diminuer le stock automatiquement lors de l'ajout d'une pièce à une réparation
CREATE OR REPLACE FUNCTION decrease_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE inventory
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.inventory_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_decrease_inventory_stock ON repair_parts;
CREATE TRIGGER tr_decrease_inventory_stock
AFTER INSERT ON repair_parts
FOR EACH ROW
EXECUTE PROCEDURE decrease_inventory_stock();

-- Trigger pour restaurer le stock lors de la suppression d'une pièce d'une réparation
CREATE OR REPLACE FUNCTION increase_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE inventory
    SET current_stock = current_stock + OLD.quantity
    WHERE id = OLD.inventory_id;
    RETURN OLD;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_increase_inventory_stock ON repair_parts;
CREATE TRIGGER tr_increase_inventory_stock
AFTER DELETE ON repair_parts
FOR EACH ROW
EXECUTE PROCEDURE increase_inventory_stock();

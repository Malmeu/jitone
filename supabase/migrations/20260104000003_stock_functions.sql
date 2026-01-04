-- Fonction pour décrémenter le stock proprement
CREATE OR REPLACE FUNCTION decrement_inventory_stock(item_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.inventory
    SET current_stock = current_stock - qty,
        updated_at = NOW()
    WHERE id = item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Création de la table des fournisseurs
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Algérie',
    tax_id VARCHAR(100), -- NIF/NIS
    initial_balance DECIMAL(10,2) DEFAULT 0, -- Ancien solde (dette initiale)
    current_balance DECIMAL(10,2) DEFAULT 0, -- Solde actuel (calculé automatiquement)
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des transactions fournisseurs (achats et paiements)
CREATE TABLE IF NOT EXISTS public.supplier_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'payment')), -- 'purchase' = achat, 'payment' = versement
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference VARCHAR(100), -- Numéro de facture ou reçu
    payment_method VARCHAR(50), -- cash, check, transfer, etc.
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_suppliers_establishment ON public.suppliers(establishment_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON public.suppliers(establishment_id, is_active);
CREATE INDEX IF NOT EXISTS idx_supplier_transactions_supplier ON public.supplier_transactions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_transactions_establishment ON public.supplier_transactions(establishment_id);
CREATE INDEX IF NOT EXISTS idx_supplier_transactions_date ON public.supplier_transactions(transaction_date DESC);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_suppliers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER suppliers_updated_at
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_suppliers_updated_at();

-- Fonction pour calculer le solde actuel d'un fournisseur
CREATE OR REPLACE FUNCTION calculate_supplier_balance(supplier_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    initial_bal DECIMAL;
    purchases_total DECIMAL;
    payments_total DECIMAL;
BEGIN
    -- Récupérer le solde initial
    SELECT initial_balance INTO initial_bal
    FROM public.suppliers
    WHERE id = supplier_uuid;
    
    -- Calculer le total des achats
    SELECT COALESCE(SUM(amount), 0) INTO purchases_total
    FROM public.supplier_transactions
    WHERE supplier_id = supplier_uuid AND type = 'purchase';
    
    -- Calculer le total des paiements
    SELECT COALESCE(SUM(amount), 0) INTO payments_total
    FROM public.supplier_transactions
    WHERE supplier_id = supplier_uuid AND type = 'payment';
    
    -- Retourner : solde initial + achats - paiements
    RETURN COALESCE(initial_bal, 0) + purchases_total - payments_total;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le current_balance après chaque transaction
CREATE OR REPLACE FUNCTION update_supplier_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le solde du fournisseur
    UPDATE public.suppliers
    SET current_balance = calculate_supplier_balance(NEW.supplier_id)
    WHERE id = NEW.supplier_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER supplier_transactions_update_balance
    AFTER INSERT OR UPDATE OR DELETE ON public.supplier_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_supplier_balance();

-- RLS (Row Level Security)
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_transactions ENABLE ROW LEVEL SECURITY;

-- Politiques pour suppliers
CREATE POLICY "Users can view suppliers from their establishment"
    ON public.suppliers FOR SELECT
    USING (
        establishment_id IN (
            SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert suppliers for their establishment"
    ON public.suppliers FOR INSERT
    WITH CHECK (
        establishment_id IN (
            SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update suppliers from their establishment"
    ON public.suppliers FOR UPDATE
    USING (
        establishment_id IN (
            SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete suppliers from their establishment"
    ON public.suppliers FOR DELETE
    USING (
        establishment_id IN (
            SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- Politiques pour supplier_transactions
CREATE POLICY "Users can view transactions from their establishment"
    ON public.supplier_transactions FOR SELECT
    USING (
        establishment_id IN (
            SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert transactions for their establishment"
    ON public.supplier_transactions FOR INSERT
    WITH CHECK (
        establishment_id IN (
            SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update transactions from their establishment"
    ON public.supplier_transactions FOR UPDATE
    USING (
        establishment_id IN (
            SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete transactions from their establishment"
    ON public.supplier_transactions FOR DELETE
    USING (
        establishment_id IN (
            SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- Vue pour faciliter les requêtes avec statistiques
CREATE OR REPLACE VIEW supplier_stats AS
SELECT 
    s.id,
    s.establishment_id,
    s.name,
    s.company_name,
    s.phone,
    s.email,
    s.initial_balance,
    s.current_balance,
    s.is_active,
    COALESCE(SUM(CASE WHEN st.type = 'purchase' THEN st.amount ELSE 0 END), 0) as total_purchases,
    COALESCE(SUM(CASE WHEN st.type = 'payment' THEN st.amount ELSE 0 END), 0) as total_payments,
    COUNT(CASE WHEN st.type = 'purchase' THEN 1 END) as purchase_count,
    COUNT(CASE WHEN st.type = 'payment' THEN 1 END) as payment_count,
    MAX(st.transaction_date) as last_transaction_date
FROM public.suppliers s
LEFT JOIN public.supplier_transactions st ON s.id = st.supplier_id
GROUP BY s.id, s.establishment_id, s.name, s.company_name, s.phone, s.email, 
         s.initial_balance, s.current_balance, s.is_active;

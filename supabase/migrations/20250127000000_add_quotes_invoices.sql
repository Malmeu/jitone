-- Migration: Système de Devis et Factures Professionnels
-- Date: 2025-01-27

-- Table des devis
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number TEXT NOT NULL UNIQUE,
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Informations du devis
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    
    -- Détails financiers
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5, 2) DEFAULT 0, -- TVA en pourcentage
    tax_amount NUMERIC(10, 2) GENERATED ALWAYS AS (subtotal * tax_rate / 100) STORED,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) GENERATED ALWAYS AS (subtotal + (subtotal * tax_rate / 100) - discount_amount) STORED,
    
    -- Notes et conditions
    notes TEXT,
    terms_conditions TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Index
    CONSTRAINT quote_number_format CHECK (quote_number ~ '^DEV-[0-9]{6}$')
);

-- Table des lignes de devis
CREATE TABLE IF NOT EXISTS public.quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    
    -- Détails de l'article
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    
    -- Ordre d'affichage
    position INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des factures
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES public.quotes(id), -- Lien optionnel avec un devis
    repair_id UUID REFERENCES public.repairs(id), -- Lien optionnel avec une réparation
    
    -- Informations de la facture
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    
    -- Détails financiers
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5, 2) DEFAULT 0,
    tax_amount NUMERIC(10, 2) GENERATED ALWAYS AS (subtotal * tax_rate / 100) STORED,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) GENERATED ALWAYS AS (subtotal + (subtotal * tax_rate / 100) - discount_amount) STORED,
    
    -- Paiement
    paid_amount NUMERIC(10, 2) DEFAULT 0,
    balance NUMERIC(10, 2) GENERATED ALWAYS AS (subtotal + (subtotal * tax_rate / 100) - discount_amount - paid_amount) STORED,
    payment_method TEXT CHECK (payment_method IN ('cash', 'baridimob', 'ccp', 'card', 'check', 'other')),
    payment_date DATE,
    
    -- Notes
    notes TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT invoice_number_format CHECK (invoice_number ~ '^FAC-[0-9]{6}$')
);

-- Table des lignes de facture
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    
    -- Détails de l'article
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    
    -- Ordre d'affichage
    position INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fonction pour générer un numéro de devis unique
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Récupérer le dernier numéro
    SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 5) AS INTEGER)), 0) + 1
    INTO counter
    FROM public.quotes;
    
    -- Générer le nouveau numéro
    new_number := 'DEV-' || LPAD(counter::TEXT, 6, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un numéro de facture unique
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Récupérer le dernier numéro
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
    INTO counter
    FROM public.invoices;
    
    -- Générer le nouveau numéro
    new_number := 'FAC-' || LPAD(counter::TEXT, 6, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_quotes_establishment ON public.quotes(establishment_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client ON public.quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_issue_date ON public.quotes(issue_date);

CREATE INDEX IF NOT EXISTS idx_invoices_establishment ON public.invoices(establishment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON public.invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_repair ON public.invoices(repair_id);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON public.quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);

-- RLS (Row Level Security)
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les devis
CREATE POLICY "Users can view their establishment's quotes"
    ON public.quotes FOR SELECT
    USING (establishment_id IN (
        SELECT id FROM public.establishments WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create quotes for their establishment"
    ON public.quotes FOR INSERT
    WITH CHECK (establishment_id IN (
        SELECT id FROM public.establishments WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update their establishment's quotes"
    ON public.quotes FOR UPDATE
    USING (establishment_id IN (
        SELECT id FROM public.establishments WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their establishment's quotes"
    ON public.quotes FOR DELETE
    USING (establishment_id IN (
        SELECT id FROM public.establishments WHERE user_id = auth.uid()
    ));

-- Politiques RLS pour les lignes de devis
CREATE POLICY "Users can view quote items"
    ON public.quote_items FOR SELECT
    USING (quote_id IN (
        SELECT id FROM public.quotes WHERE establishment_id IN (
            SELECT id FROM public.establishments WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can manage quote items"
    ON public.quote_items FOR ALL
    USING (quote_id IN (
        SELECT id FROM public.quotes WHERE establishment_id IN (
            SELECT id FROM public.establishments WHERE user_id = auth.uid()
        )
    ));

-- Politiques RLS pour les factures (similaires aux devis)
CREATE POLICY "Users can view their establishment's invoices"
    ON public.invoices FOR SELECT
    USING (establishment_id IN (
        SELECT id FROM public.establishments WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create invoices for their establishment"
    ON public.invoices FOR INSERT
    WITH CHECK (establishment_id IN (
        SELECT id FROM public.establishments WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update their establishment's invoices"
    ON public.invoices FOR UPDATE
    USING (establishment_id IN (
        SELECT id FROM public.establishments WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their establishment's invoices"
    ON public.invoices FOR DELETE
    USING (establishment_id IN (
        SELECT id FROM public.establishments WHERE user_id = auth.uid()
    ));

-- Politiques RLS pour les lignes de facture
CREATE POLICY "Users can view invoice items"
    ON public.invoice_items FOR SELECT
    USING (invoice_id IN (
        SELECT id FROM public.invoices WHERE establishment_id IN (
            SELECT id FROM public.establishments WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can manage invoice items"
    ON public.invoice_items FOR ALL
    USING (invoice_id IN (
        SELECT id FROM public.invoices WHERE establishment_id IN (
            SELECT id FROM public.establishments WHERE user_id = auth.uid()
        )
    ));

-- Commentaires
COMMENT ON TABLE public.quotes IS 'Devis professionnels pour les clients';
COMMENT ON TABLE public.quote_items IS 'Lignes de détail des devis';
COMMENT ON TABLE public.invoices IS 'Factures professionnelles';
COMMENT ON TABLE public.invoice_items IS 'Lignes de détail des factures';

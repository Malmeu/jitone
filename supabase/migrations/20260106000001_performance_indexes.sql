-- Optimisation des performances avec des index sur les colonnes fréquemment utilisées

-- Index pour les recherches de réparations
CREATE INDEX IF NOT EXISTS idx_repairs_establishment_status ON public.repairs(establishment_id, status);
CREATE INDEX IF NOT EXISTS idx_repairs_establishment_created ON public.repairs(establishment_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_repairs_code ON public.repairs(code);
CREATE INDEX IF NOT EXISTS idx_repairs_client_id ON public.repairs(client_id);
CREATE INDEX IF NOT EXISTS idx_repairs_assigned_to ON public.repairs(assigned_to);

-- Index pour les recherches de clients
CREATE INDEX IF NOT EXISTS idx_clients_establishment ON public.clients(establishment_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(name);

-- Index pour l'inventaire
CREATE INDEX IF NOT EXISTS idx_inventory_establishment_type ON public.inventory(establishment_id, type);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON public.inventory(sku);

-- Index pour les ventes
CREATE INDEX IF NOT EXISTS idx_sales_establishment_created ON public.sales(establishment_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);

-- Index pour les profils
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_establishment ON public.profiles(establishment_id);

-- Index pour les paiements
CREATE INDEX IF NOT EXISTS idx_payments_establishment ON public.payments(establishment_id);
CREATE INDEX IF NOT EXISTS idx_payments_created ON public.payments(created_at DESC);

-- Analyse des tables pour optimiser les plans de requête
ANALYZE public.repairs;
ANALYZE public.clients;
ANALYZE public.inventory;
ANALYZE public.sales;
ANALYZE public.profiles;
ANALYZE public.payments;

-- migration 20260102000014_subscription_configs.sql

CREATE TABLE IF NOT EXISTS public.subscription_configs (
    plan_id TEXT PRIMARY KEY, -- 'standard', 'premium'
    default_max_repairs INTEGER DEFAULT 100,
    default_max_team_members INTEGER DEFAULT 1,
    price_da NUMERIC DEFAULT 0,
    features JSONB DEFAULT '[]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default values if not exists
INSERT INTO public.subscription_configs (plan_id, default_max_repairs, default_max_team_members, price_da, features)
VALUES 
('standard', 100, 1, 0, '["Multi-utilisateurs (1 seul)", "Gestion des réparations", "Gestion des clients", "Impression des tickets"]'),
('premium', 999999, 10, 0, '["Multi-utilisateurs (Illimité)", "Exports Excel / Comptables", "Gestion d\'inventaire Pro", "Widget de suivi client", "Devis & Facturation Pro"]')
ON CONFLICT (plan_id) DO NOTHING;

-- RLS
ALTER TABLE public.subscription_configs ENABLE ROW LEVEL SECURITY;

-- Allow read for everyone (to show on landing/dashboard)
CREATE POLICY "Allow read for everyone" ON public.subscription_configs
FOR SELECT USING (true);

-- Allow all for admins (handled via API/Service Role anyway but good practice)
CREATE POLICY "Allow all for admins" ON public.subscription_configs
FOR ALL USING (false); -- Only accessible via service role for updates

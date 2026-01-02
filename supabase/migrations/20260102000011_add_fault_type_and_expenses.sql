-- migration 20260102000011_add_fault_type_and_expenses.sql

-- 1. Ajouter fault_type à la table repairs
ALTER TABLE public.repairs ADD COLUMN IF NOT EXISTS fault_type TEXT;

-- 2. Création de la table des dépenses (expenses) pour la marge nette réelle
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    establishment_id UUID REFERENCES public.establishments(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category TEXT DEFAULT 'autre', -- loyer, électricité, abonnement, etc.
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Active RLS sur expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour expenses
DROP POLICY IF EXISTS "L'équipe peut voir les dépenses" ON public.expenses;
CREATE POLICY "L'équipe peut voir les dépenses"
ON public.expenses FOR SELECT
USING (public.is_team_member(establishment_id));

DROP POLICY IF EXISTS "Les managers peuvent gérer les dépenses" ON public.expenses;
CREATE POLICY "Les managers peuvent gérer les dépenses"
ON public.expenses FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND establishment_id = public.expenses.establishment_id
    AND role IN ('owner', 'manager')
));

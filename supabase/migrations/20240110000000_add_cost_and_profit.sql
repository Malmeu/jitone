-- Ajouter des colonnes pour les coûts et bénéfices dans la table repairs
alter table public.repairs add column if not exists cost_price numeric(10,2) default 0;
alter table public.repairs add column if not exists profit numeric(10,2) generated always as (
    case 
        when payment_status = 'paid' and status != 'annule' 
        then (paid_amount - cost_price)
        else 0
    end
) stored;

-- Commentaires pour documentation
comment on column public.repairs.cost_price is 'Prix de revient (coût des pièces, déblocage, etc.)';
comment on column public.repairs.profit is 'Bénéfice calculé automatiquement (prix payé - coût)';

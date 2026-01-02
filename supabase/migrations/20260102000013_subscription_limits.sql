-- migration 20260102000013_subscription_limits.sql

-- 1. Ajouter une colonne pour limiter le nombre de membres d'équipe (pour usage futur)
ALTER TABLE public.establishments ADD COLUMN IF NOT EXISTS max_team_members INTEGER DEFAULT 1;

-- 2. Mettre à jour la fonction can_create_repair pour gérer les forfaits avec plus de précision
CREATE OR REPLACE FUNCTION public.can_create_repair(establishment_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_status text;
    v_plan text;
    v_trial_ends timestamp with time zone;
    v_subscription_ends timestamp with time zone;
    v_repair_count integer;
    v_max_repairs integer;
BEGIN
    SELECT subscription_status, subscription_plan, trial_ends_at, subscription_ends_at, max_repairs
    INTO v_status, v_plan, v_trial_ends, v_subscription_ends, v_max_repairs
    FROM public.establishments
    WHERE id = establishment_uuid;

    IF NOT FOUND THEN RETURN false; END IF;

    -- PREMIUM : Toujours autorisé tant que l'abonnement est actif (Actif ou Essai Premium)
    IF v_plan = 'premium' AND v_status = 'active' AND (v_subscription_ends IS NULL OR v_subscription_ends > NOW()) THEN
        RETURN true;
    END IF;

    -- TRIAL Standard : Limite stricte de 15 réparations
    IF v_status = 'trial' AND v_trial_ends > NOW() THEN
        SELECT count(*) INTO v_repair_count FROM public.repairs WHERE establishment_id = establishment_uuid;
        RETURN v_repair_count < 15;
    END IF;

    -- STANDARD Actif : Limite basée sur la colonne max_repairs
    IF v_plan = 'standard' AND v_status = 'active' AND (v_subscription_ends IS NULL OR v_subscription_ends > NOW()) THEN
        SELECT count(*) INTO v_repair_count FROM public.repairs WHERE establishment_id = establishment_uuid;
        RETURN v_repair_count < COALESCE(v_max_repairs, 100);
    END IF;

    RETURN false;
END;
$$;

-- 3. Protection au niveau de l'insertion (Trigger) pour garantir l'intégrité
CREATE OR REPLACE FUNCTION public.enforce_repair_limit()
RETURNS trigger AS $$
BEGIN
    IF NOT public.can_create_repair(NEW.establishment_id) THEN
        RAISE EXCEPTION 'Limite de réparations atteinte pour votre forfait. Passez au forfait Premium pour continuer.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_limit_repairs ON public.repairs;
CREATE TRIGGER tr_limit_repairs
    BEFORE INSERT ON public.repairs
    FOR EACH ROW EXECUTE FUNCTION public.enforce_repair_limit();

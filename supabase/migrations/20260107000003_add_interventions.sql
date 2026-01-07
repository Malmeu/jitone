-- Migration pour ajouter le système d'interventions (multi-appareils, multi-pannes)

-- 1. Ajouter le champ 'type' à la table repairs
ALTER TABLE public.repairs 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'simple' CHECK (type IN ('simple', 'intervention'));

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_repairs_type ON public.repairs(type);

-- 2. Table pour les appareils d'une intervention
CREATE TABLE IF NOT EXISTS public.intervention_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repair_id UUID NOT NULL REFERENCES public.repairs(id) ON DELETE CASCADE,
    device_order INTEGER NOT NULL DEFAULT 1, -- Ordre d'affichage (1, 2, 3...)
    device_model VARCHAR(255) NOT NULL, -- ex: iPhone 13 Pro Max
    imei_sn VARCHAR(100), -- IMEI ou numéro de série
    cosmetic_condition TEXT, -- État cosmétique de l'appareil
    notes TEXT, -- Notes spécifiques à cet appareil
    total_price DECIMAL(10,2) DEFAULT 0, -- Prix total pour cet appareil
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_intervention_devices_repair ON public.intervention_devices(repair_id);
CREATE INDEX IF NOT EXISTS idx_intervention_devices_order ON public.intervention_devices(repair_id, device_order);

-- 3. Table pour les pannes par appareil
CREATE TABLE IF NOT EXISTS public.device_faults (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.intervention_devices(id) ON DELETE CASCADE,
    fault_type_id UUID NOT NULL REFERENCES public.fault_types(id) ON DELETE RESTRICT,
    description TEXT, -- Description spécifique de cette panne
    price DECIMAL(10,2) DEFAULT 0, -- Prix de réparation de cette panne
    cost_price DECIMAL(10,2) DEFAULT 0, -- Prix de revient
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_device_faults_device ON public.device_faults(device_id);
CREATE INDEX IF NOT EXISTS idx_device_faults_type ON public.device_faults(fault_type_id);
CREATE INDEX IF NOT EXISTS idx_device_faults_status ON public.device_faults(status);

-- 4. Table pour les pièces utilisées par panne (relation avec inventory)
CREATE TABLE IF NOT EXISTS public.fault_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fault_id UUID NOT NULL REFERENCES public.device_faults(id) ON DELETE CASCADE,
    inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL, -- Prix unitaire au moment de l'utilisation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_fault_parts_fault ON public.fault_parts(fault_id);
CREATE INDEX IF NOT EXISTS idx_fault_parts_inventory ON public.fault_parts(inventory_id);

-- 5. Triggers pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_intervention_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER intervention_devices_updated_at
    BEFORE UPDATE ON public.intervention_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_intervention_devices_updated_at();

CREATE OR REPLACE FUNCTION update_device_faults_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER device_faults_updated_at
    BEFORE UPDATE ON public.device_faults
    FOR EACH ROW
    EXECUTE FUNCTION update_device_faults_updated_at();

-- 6. Fonction pour calculer automatiquement le prix total d'un appareil
CREATE OR REPLACE FUNCTION calculate_device_total_price(device_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL;
BEGIN
    SELECT COALESCE(SUM(price), 0) INTO total
    FROM public.device_faults
    WHERE device_id = device_uuid AND status != 'cancelled';
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger pour mettre à jour automatiquement le prix total de l'appareil
CREATE OR REPLACE FUNCTION update_device_total_price()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.intervention_devices
    SET total_price = calculate_device_total_price(NEW.device_id)
    WHERE id = NEW.device_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER device_faults_update_total
    AFTER INSERT OR UPDATE OR DELETE ON public.device_faults
    FOR EACH ROW
    EXECUTE FUNCTION update_device_total_price();

-- 8. Fonction pour calculer le prix total d'une intervention
CREATE OR REPLACE FUNCTION calculate_intervention_total_price(repair_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL;
BEGIN
    SELECT COALESCE(SUM(total_price), 0) INTO total
    FROM public.intervention_devices
    WHERE repair_id = repair_uuid;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- 9. RLS (Row Level Security) pour les nouvelles tables
ALTER TABLE public.intervention_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_faults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fault_parts ENABLE ROW LEVEL SECURITY;

-- Politiques pour intervention_devices
CREATE POLICY "Users can view devices from their establishment"
    ON public.intervention_devices FOR SELECT
    USING (
        repair_id IN (
            SELECT id FROM public.repairs 
            WHERE establishment_id IN (
                SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert devices for their establishment"
    ON public.intervention_devices FOR INSERT
    WITH CHECK (
        repair_id IN (
            SELECT id FROM public.repairs 
            WHERE establishment_id IN (
                SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update devices from their establishment"
    ON public.intervention_devices FOR UPDATE
    USING (
        repair_id IN (
            SELECT id FROM public.repairs 
            WHERE establishment_id IN (
                SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete devices from their establishment"
    ON public.intervention_devices FOR DELETE
    USING (
        repair_id IN (
            SELECT id FROM public.repairs 
            WHERE establishment_id IN (
                SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Politiques pour device_faults
CREATE POLICY "Users can view faults from their establishment"
    ON public.device_faults FOR SELECT
    USING (
        device_id IN (
            SELECT id FROM public.intervention_devices 
            WHERE repair_id IN (
                SELECT id FROM public.repairs 
                WHERE establishment_id IN (
                    SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can insert faults for their establishment"
    ON public.device_faults FOR INSERT
    WITH CHECK (
        device_id IN (
            SELECT id FROM public.intervention_devices 
            WHERE repair_id IN (
                SELECT id FROM public.repairs 
                WHERE establishment_id IN (
                    SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can update faults from their establishment"
    ON public.device_faults FOR UPDATE
    USING (
        device_id IN (
            SELECT id FROM public.intervention_devices 
            WHERE repair_id IN (
                SELECT id FROM public.repairs 
                WHERE establishment_id IN (
                    SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can delete faults from their establishment"
    ON public.device_faults FOR DELETE
    USING (
        device_id IN (
            SELECT id FROM public.intervention_devices 
            WHERE repair_id IN (
                SELECT id FROM public.repairs 
                WHERE establishment_id IN (
                    SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
                )
            )
        )
    );

-- Politiques pour fault_parts
CREATE POLICY "Users can view fault parts from their establishment"
    ON public.fault_parts FOR SELECT
    USING (
        fault_id IN (
            SELECT id FROM public.device_faults 
            WHERE device_id IN (
                SELECT id FROM public.intervention_devices 
                WHERE repair_id IN (
                    SELECT id FROM public.repairs 
                    WHERE establishment_id IN (
                        SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

CREATE POLICY "Users can insert fault parts for their establishment"
    ON public.fault_parts FOR INSERT
    WITH CHECK (
        fault_id IN (
            SELECT id FROM public.device_faults 
            WHERE device_id IN (
                SELECT id FROM public.intervention_devices 
                WHERE repair_id IN (
                    SELECT id FROM public.repairs 
                    WHERE establishment_id IN (
                        SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

CREATE POLICY "Users can update fault parts from their establishment"
    ON public.fault_parts FOR UPDATE
    USING (
        fault_id IN (
            SELECT id FROM public.device_faults 
            WHERE device_id IN (
                SELECT id FROM public.intervention_devices 
                WHERE repair_id IN (
                    SELECT id FROM public.repairs 
                    WHERE establishment_id IN (
                        SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

CREATE POLICY "Users can delete fault parts from their establishment"
    ON public.fault_parts FOR DELETE
    USING (
        fault_id IN (
            SELECT id FROM public.device_faults 
            WHERE device_id IN (
                SELECT id FROM public.intervention_devices 
                WHERE repair_id IN (
                    SELECT id FROM public.repairs 
                    WHERE establishment_id IN (
                        SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

-- 10. Vue pour faciliter les requêtes d'interventions complètes
CREATE OR REPLACE VIEW intervention_details AS
SELECT 
    r.id as repair_id,
    r.type,
    r.client_id,
    r.status,
    r.created_at as repair_created_at,
    id_dev.id as device_id,
    id_dev.device_model,
    id_dev.imei_sn,
    id_dev.device_order,
    id_dev.total_price as device_total,
    df.id as fault_id,
    df.fault_type_id,
    ft.name as fault_name,
    df.price as fault_price,
    df.status as fault_status
FROM public.repairs r
LEFT JOIN public.intervention_devices id_dev ON r.id = id_dev.repair_id
LEFT JOIN public.device_faults df ON id_dev.id = df.device_id
LEFT JOIN public.fault_types ft ON df.fault_type_id = ft.id
WHERE r.type = 'intervention'
ORDER BY r.created_at DESC, id_dev.device_order, df.created_at;

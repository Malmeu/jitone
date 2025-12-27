-- Migration: Système de Calendrier et Rendez-vous
-- Date: 2025-01-27

-- Table des rendez-vous
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    repair_id UUID REFERENCES public.repairs(id) ON DELETE SET NULL,
    
    -- Informations du rendez-vous
    title TEXT NOT NULL,
    description TEXT,
    
    -- Date et heure
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Statut
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    
    -- Type de rendez-vous
    appointment_type TEXT CHECK (appointment_type IN ('repair', 'pickup', 'consultation', 'other')),
    
    -- Rappels
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Notes
    notes TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Contraintes
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Table des créneaux de disponibilité (horaires d'ouverture)
CREATE TABLE IF NOT EXISTS public.availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    
    -- Jour de la semaine (0 = Dimanche, 1 = Lundi, ..., 6 = Samedi)
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    
    -- Heures d'ouverture
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Actif/Inactif
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_slot_time CHECK (end_time > start_time)
);

-- Table des jours fériés / fermetures exceptionnelles
CREATE TABLE IF NOT EXISTS public.closures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    
    -- Date de fermeture
    closure_date DATE NOT NULL,
    
    -- Raison
    reason TEXT,
    
    -- Type
    closure_type TEXT CHECK (closure_type IN ('holiday', 'vacation', 'maintenance', 'other')),
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fonction pour vérifier les conflits de rendez-vous
CREATE OR REPLACE FUNCTION check_appointment_conflict(
    p_establishment_id UUID,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE,
    p_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO conflict_count
    FROM public.appointments
    WHERE establishment_id = p_establishment_id
    AND status NOT IN ('cancelled', 'no_show')
    AND (
        (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
    )
    AND (p_appointment_id IS NULL OR id != p_appointment_id);
    
    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les créneaux disponibles pour un jour donné
CREATE OR REPLACE FUNCTION get_available_slots(
    p_establishment_id UUID,
    p_date DATE,
    p_slot_duration INTEGER DEFAULT 60 -- Durée en minutes
)
RETURNS TABLE (
    slot_start TIMESTAMP WITH TIME ZONE,
    slot_end TIMESTAMP WITH TIME ZONE,
    is_available BOOLEAN
) AS $$
DECLARE
    day_num INTEGER;
    slot_time TIME;
    current_slot TIMESTAMP WITH TIME ZONE;
    next_slot TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Obtenir le jour de la semaine (0 = Dimanche)
    day_num := EXTRACT(DOW FROM p_date);
    
    -- Vérifier si c'est un jour de fermeture
    IF EXISTS (
        SELECT 1 FROM public.closures
        WHERE establishment_id = p_establishment_id
        AND closure_date = p_date
    ) THEN
        RETURN;
    END IF;
    
    -- Parcourir les créneaux de disponibilité pour ce jour
    FOR slot_time IN
        SELECT a.start_time
        FROM public.availability_slots a
        WHERE a.establishment_id = p_establishment_id
        AND a.day_of_week = day_num
        AND a.is_active = TRUE
    LOOP
        current_slot := p_date + slot_time;
        
        -- Générer des créneaux de p_slot_duration minutes
        WHILE current_slot < p_date + (SELECT end_time FROM public.availability_slots WHERE establishment_id = p_establishment_id AND day_of_week = day_num AND start_time = slot_time LIMIT 1) LOOP
            next_slot := current_slot + (p_slot_duration || ' minutes')::INTERVAL;
            
            slot_start := current_slot;
            slot_end := next_slot;
            is_available := NOT check_appointment_conflict(p_establishment_id, current_slot, next_slot);
            
            RETURN NEXT;
            
            current_slot := next_slot;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_appointments_establishment ON public.appointments(establishment_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

CREATE INDEX IF NOT EXISTS idx_availability_slots_establishment ON public.availability_slots(establishment_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_day ON public.availability_slots(day_of_week);

CREATE INDEX IF NOT EXISTS idx_closures_establishment ON public.closures(establishment_id);
CREATE INDEX IF NOT EXISTS idx_closures_date ON public.closures(closure_date);

-- RLS (Row Level Security)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closures ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les rendez-vous
CREATE POLICY "Users can view their establishment's appointments"
    ON public.appointments FOR SELECT
    USING (establishment_id IN (
        SELECT id FROM public.establishments WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create appointments for their establishment"
    ON public.appointments FOR INSERT
    WITH CHECK (establishment_id IN (
        SELECT id FROM public.establishments WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update their establishment's appointments"
    ON public.appointments FOR UPDATE
    USING (establishment_id IN (
        SELECT id FROM public.establishments WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their establishment's appointments"
    ON public.appointments FOR DELETE
    USING (establishment_id IN (
        SELECT id FROM public.establishments WHERE user_id = auth.uid()
    ));

-- Politiques RLS pour les créneaux de disponibilité
CREATE POLICY "Users can view their establishment's availability slots"
    ON public.availability_slots FOR SELECT
    USING (establishment_id IN (
        SELECT id FROM public.establishments WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their establishment's availability slots"
    ON public.availability_slots FOR ALL
    USING (establishment_id IN (
        SELECT id FROM public.establishments WHERE user_id = auth.uid()
    ));

-- Politiques RLS pour les fermetures
CREATE POLICY "Users can view their establishment's closures"
    ON public.closures FOR SELECT
    USING (establishment_id IN (
        SELECT id FROM public.establishments WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their establishment's closures"
    ON public.closures FOR ALL
    USING (establishment_id IN (
        SELECT id FROM public.establishments WHERE user_id = auth.uid()
    ));

-- Commentaires
COMMENT ON TABLE public.appointments IS 'Rendez-vous et événements du calendrier';
COMMENT ON TABLE public.availability_slots IS 'Créneaux de disponibilité (horaires d''ouverture)';
COMMENT ON TABLE public.closures IS 'Jours de fermeture exceptionnelle';

COMMENT ON FUNCTION check_appointment_conflict IS 'Vérifie si un rendez-vous entre en conflit avec un autre';
COMMENT ON FUNCTION get_available_slots IS 'Retourne les créneaux disponibles pour un jour donné';

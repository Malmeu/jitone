-- Création de la table pour stocker les types de pannes prédéfinies
CREATE TABLE IF NOT EXISTS public.fault_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- Nom de l'icône lucide-react (ex: 'Zap', 'Battery', 'Wifi')
    color VARCHAR(20) DEFAULT 'neutral', -- Couleur pour l'affichage (ex: 'red', 'amber', 'blue')
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_fault_types_establishment ON public.fault_types(establishment_id);
CREATE INDEX IF NOT EXISTS idx_fault_types_active ON public.fault_types(establishment_id, is_active);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_fault_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fault_types_updated_at
    BEFORE UPDATE ON public.fault_types
    FOR EACH ROW
    EXECUTE FUNCTION update_fault_types_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.fault_types ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir les pannes de leur établissement
CREATE POLICY "Users can view fault_types from their establishment"
    ON public.fault_types FOR SELECT
    USING (
        establishment_id IN (
            SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- Politique : Les utilisateurs peuvent créer des pannes pour leur établissement
CREATE POLICY "Users can insert fault_types for their establishment"
    ON public.fault_types FOR INSERT
    WITH CHECK (
        establishment_id IN (
            SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- Politique : Les utilisateurs peuvent modifier les pannes de leur établissement
CREATE POLICY "Users can update fault_types from their establishment"
    ON public.fault_types FOR UPDATE
    USING (
        establishment_id IN (
            SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- Politique : Les utilisateurs peuvent supprimer les pannes de leur établissement
CREATE POLICY "Users can delete fault_types from their establishment"
    ON public.fault_types FOR DELETE
    USING (
        establishment_id IN (
            SELECT establishment_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- Ajout de la colonne fault_type_id dans la table repairs
ALTER TABLE public.repairs 
ADD COLUMN IF NOT EXISTS fault_type_id UUID REFERENCES public.fault_types(id) ON DELETE SET NULL;

-- Index pour la colonne fault_type_id
CREATE INDEX IF NOT EXISTS idx_repairs_fault_type ON public.repairs(fault_type_id);

-- Insertion de pannes par défaut pour les établissements existants
-- Ces pannes seront créées automatiquement pour chaque établissement
INSERT INTO public.fault_types (establishment_id, name, description, icon, color)
SELECT 
    e.id,
    fault.name,
    fault.description,
    fault.icon,
    fault.color
FROM public.establishments e
CROSS JOIN (
    VALUES 
        ('Écran cassé', 'Écran fissuré ou brisé', 'Smartphone', 'red'),
        ('Batterie défectueuse', 'Problème de batterie ou autonomie', 'Battery', 'amber'),
        ('Problème de charge', 'Ne charge pas ou charge lentement', 'Zap', 'yellow'),
        ('Problème audio', 'Haut-parleur ou micro défectueux', 'Volume2', 'purple'),
        ('Problème Wi-Fi', 'Connexion Wi-Fi instable ou absente', 'Wifi', 'blue'),
        ('Problème Bluetooth', 'Bluetooth ne fonctionne pas', 'Bluetooth', 'indigo'),
        ('Caméra défectueuse', 'Problème avec la caméra avant ou arrière', 'Camera', 'pink'),
        ('Boutons défectueux', 'Bouton power, volume ou home cassé', 'ToggleLeft', 'neutral'),
        ('Problème tactile', 'Écran tactile ne répond pas', 'Hand', 'red'),
        ('Oxydation', 'Dégâts des eaux ou oxydation', 'Droplet', 'cyan'),
        ('Logiciel', 'Problème système ou application', 'Code', 'emerald'),
        ('Autre', 'Autre type de panne', 'AlertCircle', 'neutral')
) AS fault(name, description, icon, color)
WHERE NOT EXISTS (
    SELECT 1 FROM public.fault_types ft 
    WHERE ft.establishment_id = e.id
    AND ft.name = fault.name
);

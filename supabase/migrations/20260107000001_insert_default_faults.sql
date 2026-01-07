-- Script pour insérer les pannes par défaut pour TOUS les établissements
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- D'abord, supprimons les pannes existantes si vous voulez recommencer
-- DELETE FROM public.fault_types;

-- Insertion des pannes par défaut pour chaque établissement
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
-- Cette condition évite les doublons : on n'insère que si cette panne spécifique n'existe pas déjà
WHERE NOT EXISTS (
    SELECT 1 FROM public.fault_types ft 
    WHERE ft.establishment_id = e.id 
    AND ft.name = fault.name
);

-- Vérification : afficher toutes les pannes créées
SELECT 
    ft.name,
    ft.description,
    ft.icon,
    ft.color,
    e.name as establishment_name
FROM public.fault_types ft
JOIN public.establishments e ON e.id = ft.establishment_id
ORDER BY e.name, ft.name;

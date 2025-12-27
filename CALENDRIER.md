# 📅 Système de Calendrier et Rendez-vous

## ✅ Fonctionnalités Implémentées

### 1. 🗄️ **Base de Données**

#### Tables Créées
- ✅ `appointments` : Rendez-vous et événements
- ✅ `availability_slots` : Créneaux de disponibilité (horaires d'ouverture)
- ✅ `closures` : Jours de fermeture exceptionnelle

#### Fonctionnalités SQL
```sql
✅ Gestion complète des rendez-vous
✅ Vérification des conflits automatique
✅ Calcul des créneaux disponibles
✅ Statuts multiples (programmé, confirmé, terminé, etc.)
✅ Types de rendez-vous (réparation, récupération, consultation)
✅ Lien avec clients et réparations
✅ Système de rappels
✅ RLS (Row Level Security) activé
```

### 2. 📅 **Page Calendrier Interactive**
**Route** : `/dashboard/calendar`

#### Vue Calendrier
```
┌─────────────────────────────────────────────────┐
│ Calendrier & Rendez-vous    [+ Nouveau RDV]    │
├─────────────────────────────────────────────────┤
│ [Programmés] [Confirmés] [Aujourd'hui] [Semaine]│
├─────────────────────────────────────────────────┤
│                                                 │
│     CALENDRIER MENSUEL INTERACTIF              │
│                                                 │
│  Lun  Mar  Mer  Jeu  Ven  Sam  Dim             │
│   1    2    3    4    5    6    7              │
│  [RDV] [RDV]     [RDV]                         │
│   8    9   10   11   12   13   14              │
│       [RDV]     [RDV]                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Fonctionnalités
- ✅ **Vue mensuelle** interactive
- ✅ **Vues multiples** : Mois, Semaine, Jour, Agenda
- ✅ **Création rapide** : Clic sur un créneau
- ✅ **Modification** : Clic sur un événement
- ✅ **Drag & Drop** : Déplacer les rendez-vous
- ✅ **Couleurs par statut** :
  - 🔵 Programmé (bleu)
  - 🟢 Confirmé (vert)
  - ⚫ Terminé (gris)
  - 🔴 Annulé (rouge)
  - 🟠 Absent (orange)

### 3. 📊 **Statistiques en Temps Réel**

#### Cartes de Statistiques
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Programmés   │ Confirmés    │ Aujourd'hui  │ Cette semaine│
│     12       │      8       │      3       │      15      │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

- ✅ Nombre de rendez-vous programmés
- ✅ Nombre de rendez-vous confirmés
- ✅ Rendez-vous du jour
- ✅ Rendez-vous de la semaine

### 4. 📝 **Modal de Création/Édition**

#### Formulaire Complet
```
┌─────────────────────────────────────────┐
│ Nouveau rendez-vous              [X]    │
├─────────────────────────────────────────┤
│ Titre *                                 │
│ [Ex: Rendez-vous avec M. Dupont]       │
│                                         │
│ Client                                  │
│ [Sélectionner un client ▼]             │
│                                         │
│ Début *          │ Fin *                │
│ [27/01 14:00]    │ [27/01 15:00]       │
│                                         │
│ Type                                    │
│ [Consultation ▼]                        │
│                                         │
│ Description                             │
│ [Détails du rendez-vous...]            │
│                                         │
│ Notes                                   │
│ [Notes internes...]                    │
│                                         │
│ [Créer le rendez-vous]                 │
└─────────────────────────────────────────┘
```

#### Champs
- ✅ **Titre** (obligatoire)
- ✅ **Client** (optionnel, liste déroulante)
- ✅ **Date/Heure de début** (obligatoire)
- ✅ **Date/Heure de fin** (obligatoire)
- ✅ **Type** (réparation, récupération, consultation, autre)
- ✅ **Description** (optionnel)
- ✅ **Notes** (optionnel, privé)

### 5. 🎨 **Codes Couleur par Statut**

```javascript
scheduled  → 🔵 Bleu    (Programmé)
confirmed  → 🟢 Vert    (Confirmé)
completed  → ⚫ Gris    (Terminé)
cancelled  → 🔴 Rouge   (Annulé)
no_show    → 🟠 Orange  (Absent)
```

## 🎯 Workflow Complet

### Création d'un Rendez-vous

#### Méthode 1 : Clic sur le calendrier
```
1. Cliquer sur un créneau vide dans le calendrier
2. Le modal s'ouvre avec les dates pré-remplies
3. Remplir le titre et les autres informations
4. Cliquer "Créer le rendez-vous"
5. Le rendez-vous apparaît dans le calendrier
```

#### Méthode 2 : Bouton "Nouveau Rendez-vous"
```
1. Cliquer sur [+ Nouveau Rendez-vous]
2. Remplir tous les champs
3. Sélectionner date et heure
4. Cliquer "Créer le rendez-vous"
```

### Modification d'un Rendez-vous
```
1. Cliquer sur un rendez-vous dans le calendrier
2. Le modal s'ouvre avec les informations
3. Modifier les champs souhaités
4. Cliquer "Mettre à jour"
```

### Suppression d'un Rendez-vous
```
1. Cliquer sur un rendez-vous
2. Dans le modal, cliquer "Supprimer"
3. Confirmer la suppression
4. Le rendez-vous disparaît du calendrier
```

## 📊 Types de Rendez-vous

### Types Disponibles
- 🔧 **Réparation** : Rendez-vous pour une réparation
- 📦 **Récupération** : Client vient récupérer son appareil
- 💬 **Consultation** : Rendez-vous de conseil/devis
- ⭐ **Autre** : Autres types d'événements

## 🔔 Système de Rappels

### Champs de Rappel
```sql
reminder_sent BOOLEAN          -- Rappel envoyé ?
reminder_sent_at TIMESTAMP     -- Quand ?
```

### À Implémenter
- 📧 Envoi automatique de rappels par email
- 📱 Envoi de rappels par SMS
- ⏰ Configuration du délai de rappel (24h avant, etc.)

## 🕐 Gestion des Disponibilités

### Table `availability_slots`
```sql
day_of_week  -- 0=Dimanche, 1=Lundi, ..., 6=Samedi
start_time   -- Heure d'ouverture
end_time     -- Heure de fermeture
is_active    -- Actif/Inactif
```

### Exemple de Configuration
```
Lundi    : 09:00 - 18:00
Mardi    : 09:00 - 18:00
Mercredi : 09:00 - 18:00
Jeudi    : 09:00 - 18:00
Vendredi : 09:00 - 17:00
Samedi   : 10:00 - 14:00
Dimanche : Fermé
```

## 🚫 Jours de Fermeture

### Table `closures`
```sql
closure_date  -- Date de fermeture
reason        -- Raison
closure_type  -- Type (férié, vacances, maintenance)
```

### Types de Fermeture
- 🎉 **Férié** : Jours fériés
- 🏖️ **Vacances** : Congés
- 🔧 **Maintenance** : Travaux
- ⭐ **Autre** : Autres raisons

## 🔍 Fonctions SQL Avancées

### 1. Vérification des Conflits
```sql
check_appointment_conflict(
    establishment_id,
    start_time,
    end_time,
    appointment_id  -- NULL pour nouveau RDV
)
```

**Retourne** : `TRUE` si conflit, `FALSE` sinon

### 2. Créneaux Disponibles
```sql
get_available_slots(
    establishment_id,
    date,
    slot_duration  -- En minutes (défaut: 60)
)
```

**Retourne** : Liste des créneaux avec disponibilité

## 🎨 Personnalisation

### Couleurs des Événements
Modifiez dans `calendar/page.tsx` :
```javascript
const statusColors = {
    scheduled: { backgroundColor: '#3b82f6', color: 'white' },
    confirmed: { backgroundColor: '#10b981', color: 'white' },
    // ...
};
```

### Durée des Créneaux
Par défaut : 60 minutes
```javascript
slot_duration: 60  // En minutes
```

## 📱 Vues Disponibles

### 1. Vue Mois (par défaut)
- Aperçu mensuel complet
- Tous les rendez-vous visibles
- Clic pour créer/modifier

### 2. Vue Semaine
- Détail horaire de la semaine
- Créneaux de 30 minutes
- Drag & drop activé

### 3. Vue Jour
- Planning détaillé du jour
- Vue horaire complète
- Idéal pour la gestion quotidienne

### 4. Vue Agenda
- Liste chronologique
- Tous les détails visibles
- Recherche facilitée

## 🧪 Test du Système

### 1. Appliquer la Migration
```sql
-- Dans Supabase → SQL Editor
-- Exécuter: 20250127000001_add_appointments.sql
```

### 2. Créer un Rendez-vous
```
1. Aller sur /dashboard/calendar
2. Cliquer sur un créneau (ex: demain 14h)
3. Remplir:
   - Titre: "Réparation iPhone"
   - Client: Sélectionner un client
   - Type: Réparation
4. Cliquer "Créer"
5. Vérifier: Rendez-vous apparaît en bleu
```

### 3. Modifier le Statut
```
1. Cliquer sur le rendez-vous
2. Dans le modal, changer le statut
3. Sauvegarder
4. Vérifier: Couleur change selon le statut
```

## 📋 Prochaines Fonctionnalités

### À Implémenter
1. **Page de configuration des horaires**
   - Définir les heures d'ouverture
   - Gérer les jours de fermeture

2. **Rappels automatiques**
   - Email 24h avant
   - SMS 2h avant
   - Configuration personnalisable

3. **Prise de RDV en ligne**
   - Widget public
   - Sélection de créneaux disponibles
   - Confirmation automatique

4. **Synchronisation calendrier**
   - Export iCal
   - Google Calendar
   - Outlook

5. **Statistiques avancées**
   - Taux de présence
   - Créneaux les plus demandés
   - Durée moyenne des RDV

## 🔐 Sécurité

### RLS Activé
- ✅ Utilisateurs voient uniquement leurs rendez-vous
- ✅ Basé sur `establishment_id`
- ✅ Politiques pour SELECT, INSERT, UPDATE, DELETE

### Validation
- ✅ Dates de fin après dates de début
- ✅ Vérification des conflits
- ✅ Respect des horaires d'ouverture

## 📞 Support

Pour toute question :
1. Vérifier la console du navigateur (F12)
2. Vérifier les logs Supabase
3. Vérifier que la migration SQL est appliquée

---

**Note** : Le système de calendrier est prêt pour la production ! 🚀

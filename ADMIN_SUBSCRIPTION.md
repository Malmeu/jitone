# 📱 Menu Responsive & 👑 Gestion des Abonnements

## ✨ Nouvelles Fonctionnalités

### 1. Menu Hamburger Responsive
Navigation mobile optimisée avec menu coulissant

### 2. Système d'Abonnement
Gestion complète des comptes avec période d'essai

## 📱 Menu Responsive

### Interface Mobile

#### Header Mobile
```
┌────────────────────────────────┐
│ [Logo] RepairTrack      [☰]   │
└────────────────────────────────┘
```

#### Menu Hamburger
- **Icône** : ☰ (Menu) / ✕ (Fermer)
- **Position** : En haut à droite
- **Animation** : Slide-in depuis la gauche
- **Overlay** : Fond noir semi-transparent

#### Menu Ouvert
```
┌────────────────────────────────┐
│ [Logo] RepairTrack      [✕]   │
├────────────────────────────────┤
│                                │
│  🏠 Accueil                    │
│  🔧 Réparations                │
│  👥 Clients                    │
│  📄 Factures                   │
│  💻 Widget                     │
│  ⚙️  Paramètres                │
│                                │
│  ─────────────────────────     │
│  🚪 Déconnexion                │
└────────────────────────────────┘
```

### Fonctionnalités

#### Auto-fermeture
- ✅ Clic sur l'overlay
- ✅ Changement de page
- ✅ Clic sur un lien

#### Animations
- ✅ Slide-in/out fluide
- ✅ Transition 300ms
- ✅ Overlay fade

#### Responsive
- ✅ Mobile : Menu hamburger
- ✅ Tablette : Menu hamburger
- ✅ Desktop : Sidebar fixe

## 👑 Système d'Abonnement

### Statuts Disponibles

#### 🔵 Essai (trial)
- **Durée** : 30 jours par défaut
- **Limite** : 100 réparations
- **Fonctionnalités** : Toutes
- **Prix** : Gratuit

#### ✅ Actif (active)
- **Durée** : Selon abonnement (1 an par défaut)
- **Limite** : Illimitée
- **Fonctionnalités** : Toutes
- **Prix** : Payant

#### ❌ Expiré (expired)
- **Accès** : Lecture seule
- **Création** : Bloquée
- **Fonctionnalités** : Limitées

#### ⏸️ Annulé (cancelled)
- **Accès** : Bloqué
- **Données** : Conservées
- **Réactivation** : Possible

### Base de Données

#### Nouvelles Colonnes (establishments)
```sql
subscription_status      -- trial, active, expired, cancelled
trial_ends_at           -- Date de fin d'essai
subscription_ends_at    -- Date de fin d'abonnement
max_repairs             -- Limite pour l'essai (100)
created_at              -- Date de création
```

#### Fonction de Vérification
```sql
can_create_repair(establishment_uuid)
```

**Vérifie** :
- ✅ Statut actif et non expiré
- ✅ Essai en cours et sous la limite
- ❌ Sinon bloqué

### Dashboard Admin

#### URL
```
/admin
```

#### Statistiques
```
┌──────────┬──────────┬──────────┬──────────┐
│ Total    │ Essai    │ Actifs   │ Expirés  │
│ 50       │ 20       │ 25       │ 5        │
└──────────┴──────────┴──────────┴──────────┘
```

#### Tableau des Comptes
```
┌─────────────┬─────────────┬────────┬──────────┬──────────┬─────────┐
│ Établ.      │ Email       │ Statut │ Expire   │ Créé le  │ Actions │
├─────────────┼─────────────┼────────┼──────────┼──────────┼─────────┤
│ Répar Pro   │ pro@mail.dz │ Essai  │ 15 jours │ 01/01/25 │ [Activ] │
│ Tech Mobile │ tech@dz.com │ Actif  │ 300 j    │ 15/12/24 │ [Expir] │
│ Fix Phone   │ fix@mail.dz │ Expiré │ -        │ 01/11/24 │ [Activ] │
└─────────────┴─────────────┴────────┴──────────┴──────────┴─────────┘
```

#### Actions Disponibles

**Pour Essai** :
- ✅ Activer 1 an
- ✅ Prolonger essai (30 jours)

**Pour Actif** :
- ✅ Expirer

**Pour Expiré** :
- ✅ Activer 1 an

### Workflow d'Inscription

#### 1. Inscription
```
Utilisateur s'inscrit
  ↓
Compte créé
  ↓
Statut: trial
  ↓
trial_ends_at: +30 jours
  ↓
max_repairs: 100
```

#### 2. Période d'Essai
```
Utilisation gratuite
  ↓
Jusqu'à 100 réparations
  ↓
Ou 30 jours
  ↓
Notification avant expiration
```

#### 3. Activation
```
Admin active le compte
  ↓
Statut: active
  ↓
subscription_ends_at: +1 an
  ↓
Limite illimitée
```

#### 4. Expiration
```
Date dépassée
  ↓
Statut: expired
  ↓
Accès lecture seule
  ↓
Notification
```

### Notifications (À Implémenter)

#### Essai
- ⏰ 7 jours avant expiration
- ⏰ 3 jours avant expiration
- ⏰ 1 jour avant expiration
- ⏰ Le jour de l'expiration

#### Abonnement
- ⏰ 30 jours avant expiration
- ⏰ 7 jours avant expiration
- ⏰ Le jour de l'expiration

#### Limite Atteinte
- ⏰ 90 réparations (90%)
- ⏰ 95 réparations (95%)
- ⏰ 100 réparations (100%)

### Restrictions par Statut

#### Essai (trial)
- ✅ Créer réparations (max 100)
- ✅ Gérer clients
- ✅ Voir factures
- ✅ Configurer widget
- ✅ Paramètres

#### Actif (active)
- ✅ Tout illimité

#### Expiré (expired)
- ✅ Voir réparations
- ✅ Voir clients
- ✅ Voir factures
- ❌ Créer réparations
- ❌ Modifier données
- ✅ Exporter données

#### Annulé (cancelled)
- ❌ Accès bloqué
- ✅ Données conservées
- ✅ Réactivation possible

## 🔧 Installation

### 1. Appliquer la Migration
```sql
-- Exécuter dans Supabase SQL Editor
-- Fichier: 20240111000000_add_subscription_system.sql
```

### 2. Accéder à l'Admin
```
URL: /admin
```

### 3. Gérer les Comptes
- Voir tous les établissements
- Activer/Désactiver
- Prolonger essais
- Suivre les expirations

## 📊 Statistiques Admin

### Métriques Clés
- **Total** : Nombre total de comptes
- **Essai** : Comptes en période d'essai
- **Actifs** : Comptes payants actifs
- **Expirés** : Comptes à réactiver

### Indicateurs
- 🟢 **Vert** : > 30 jours restants
- 🟡 **Jaune** : 7-30 jours restants
- 🔴 **Rouge** : < 7 jours restants

## 💰 Tarification (Exemple)

### Période d'Essai
- **Durée** : 30 jours
- **Prix** : Gratuit
- **Limite** : 100 réparations
- **Support** : Email

### Abonnement Mensuel
- **Durée** : 1 mois
- **Prix** : 2 000 DA/mois
- **Limite** : Illimitée
- **Support** : Prioritaire

### Abonnement Annuel
- **Durée** : 12 mois
- **Prix** : 20 000 DA/an (économie de 4 000 DA)
- **Limite** : Illimitée
- **Support** : Prioritaire + Formation

## 🚀 Prochaines Fonctionnalités

### Paiement
- 💳 Intégration CCP/BaridiMob
- 💳 Paiement en ligne
- 💳 Factures automatiques

### Notifications
- 📧 Email automatique
- 📱 SMS
- 🔔 Notifications in-app

### Analytics
- 📊 Taux de conversion
- 📊 Rétention
- 📊 Revenus

### Self-Service
- 🔄 Renouvellement automatique
- 💳 Gestion de carte
- 📄 Historique de paiements

## 🔒 Sécurité

### Protection
- ✅ RLS Supabase actif
- ✅ Vérification côté serveur
- ✅ Logs d'activité
- ✅ Données chiffrées

### Accès Admin
- ✅ Authentification requise
- ✅ Rôle admin vérifié
- ✅ Actions auditées

---

**Note** : Le système est prêt pour l'intégration de paiements et de notifications automatiques !

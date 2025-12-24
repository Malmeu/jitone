# RepairTrack DZ 🇩🇿

**SaaS complet de gestion de suivi de réparations pour artisans algériens**

Un système moderne et élégant permettant aux ateliers de réparation (téléphones, tailleurs, cordonniers, etc.) de gérer leurs réparations et d'offrir un suivi en temps réel à leurs clients.

---

## ✨ Fonctionnalités

### Pour les Clients
- 🔍 **Suivi en temps réel** : Recherche par code unique (REPAR-XXXXXX)
- 📱 **Interface mobile-first** : Optimisée pour smartphones
- 📊 **Timeline visuelle** : Progression claire de la réparation
- 📞 **Contact direct** : Bouton d'appel vers l'atelier

### Pour les Établissements
- 🏪 **Dashboard complet** : Vue d'ensemble des réparations et statistiques
- ➕ **Gestion des réparations** : Création, modification, suivi de statut
- 👥 **Gestion clients** : Base de données clients avec historique
- 🎯 **Génération automatique de codes** : Codes uniques pour chaque réparation
- 📈 **Statistiques** : Revenus, nombre de réparations, etc.
- ⚙️ **Paramètres** : Configuration de l'établissement

---

## 🚀 Installation

### Prérequis
- Node.js 18+ installé
- Un compte Supabase (gratuit)

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration Supabase

#### a) Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et la clé API

#### b) Configurer les variables d'environnement
Éditez le fichier `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

#### c) Appliquer le schéma de base de données
1. Dans Supabase, allez dans **SQL Editor**
2. Exécutez le contenu de `supabase/migrations/20240101000000_init.sql`
3. Puis exécutez `supabase/migrations/20240102000000_rls_policies.sql`

#### d) Désactiver la confirmation par email (développement)
1. Dans Supabase : **Authentication** → **Settings** → **Email Auth**
2. Désactivez "Enable email confirmations"

### 3. Lancer l'application
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

---

## 📂 Structure du Projet

```
repair-track/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/                      # Connexion
│   ├── register/                   # Inscription
│   ├── track/                      # Suivi client
│   │   ├── page.tsx               # Recherche par code
│   │   └── [code]/page.tsx        # Détails réparation
│   └── dashboard/                  # Dashboard établissement
│       ├── page.tsx               # Accueil
│       ├── repairs/               # Gestion réparations
│       ├── clients/               # Gestion clients
│       ├── settings/              # Paramètres
│       └── invoices/              # Factures (à venir)
├── components/
│   ├── ui/                        # Composants UI réutilisables
│   └── landing/                   # Composants landing page
├── lib/
│   ├── supabase.ts               # Client Supabase
│   └── utils.ts                  # Utilitaires
└── supabase/
    └── migrations/               # Migrations SQL
```

---

## 🎨 Design System

- **Couleurs** :
  - Primary: `#007AFF` (Bleu Apple)
  - Success: `#34C759` (Vert)
  - Warning: `#FF9500` (Orange)
  - Background: `#FAFAFA`

- **Typographie** : Inter (Google Fonts)
- **Effets** : Glassmorphism, ombres douces, coins arrondis (16-24px)
- **Animations** : Framer Motion pour transitions fluides

---

## 🔐 Sécurité

- **Row Level Security (RLS)** : Activé sur toutes les tables
- **Isolation multi-tenant** : Chaque établissement accède uniquement à ses données
- **Authentification** : Gérée par Supabase Auth

---

## 📱 Utilisation

### Créer un compte établissement
1. Cliquez sur "Essai Gratuit"
2. Remplissez le formulaire
3. Vous avez 14 jours d'essai gratuit

### Créer une réparation
1. Dashboard → "Nouvelle Réparation"
2. Sélectionnez ou créez un client
3. Renseignez l'appareil et la description
4. Un code unique est généré automatiquement (ex: REPAR-A3B9C2)

### Suivre une réparation (côté client)
1. Page d'accueil → "Suivre une réparation"
2. Entrez le code reçu
3. Consultez le statut en temps réel

---

## 🚢 Déploiement

### Vercel (recommandé)
```bash
npm run build
vercel --prod
```

N'oubliez pas d'ajouter vos variables d'environnement dans Vercel.

---

## 🛠️ Technologies

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Styling** : TailwindCSS v4
- **Animations** : Framer Motion
- **Base de données** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth
- **Déploiement** : Vercel

---

## 📝 Roadmap

- [ ] Notifications SMS automatiques (Twilio)
- [ ] Génération de factures PDF
- [ ] Multi-employés avec rôles
- [ ] Application mobile (PWA)
- [ ] Rapports et analytics avancés
- [ ] Support WhatsApp
- [ ] Paiement en ligne (Stripe)

---

## 🤝 Support

Pour toute question ou problème :
- Vérifiez que vos migrations SQL sont bien appliquées
- Vérifiez vos variables d'environnement
- Consultez la console du navigateur pour les erreurs

---

## 📄 Licence

Projet créé pour les artisans algériens 🇩🇿

Fait avec ❤️ et Next.js

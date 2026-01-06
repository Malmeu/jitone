# 📚 Base de Connaissances RepairTrack

Documentation complète pour maîtriser toutes les fonctionnalités de RepairTrack.

---

## 🗂️ Catégories

### 🚀 [Démarrage](#demarrage)
- [Installation et configuration initiale](#installation)
- [Premier paramétrage](#parametrage)
- [Comprendre l'interface](#interface)

### 🔧 [Gestion des Réparations](#reparations)
- [Créer une réparation](#creer-reparation)
- [Gérer les statuts](#statuts)
- [Assignation aux techniciens](#assignation)
- [Tickets et impression](#tickets)
- [Suivi client](#suivi-client)

### 🛒 [Point de Vente](#point-vente)
- [Utiliser la caisse](#caisse)
- [Gérer la TVA](#tva)
- [Historique des ventes](#historique-ventes)

### 📦 [Stock & Inventaire](#stock)
- [Ajouter des articles](#ajouter-articles)
- [Types d'articles](#types-articles)
- [Alertes de stock](#alertes-stock)
- [Inventaire physique](#inventaire)

### 👥 [Équipe](#equipe)
- [Rôles et permissions](#roles)
- [Inviter des membres](#inviter)
- [Gestion des accès](#acces)

### 💰 [Facturation](#facturation)
- [Créer des devis](#devis)
- [Générer des factures](#factures)
- [Rapports financiers](#rapports)

### ⚙️ [Paramètres](#parametres)
- [Configuration établissement](#config-etablissement)
- [Personnalisation](#personnalisation)
- [Intégrations](#integrations)

---

## 🚀 Démarrage

### Installation et configuration initiale

#### Prérequis
- Connexion internet stable
- Navigateur moderne (Chrome, Firefox, Safari, Edge)
- Adresse email professionnelle

#### Étapes d'installation

**1. Création du compte**
```
1. Accédez à https://fixwave.space
2. Cliquez sur "Créer un compte"
3. Remplissez le formulaire :
   - Email : votre-email@entreprise.dz
   - Mot de passe : Min. 8 caractères, 1 majuscule, 1 chiffre
   - Nom établissement : Votre nom commercial
4. Validez votre email (vérifiez vos spams)
5. Connectez-vous
```

**2. Configuration rapide (5 minutes)**
```
✅ Étape 1 : Informations de base
   - Nom, téléphone, adresse
   
✅ Étape 2 : Logo et couleurs
   - Uploadez votre logo (PNG/JPG, max 2MB)
   - Choisissez la couleur de vos tickets
   
✅ Étape 3 : Premier membre d'équipe
   - Ajoutez au moins un technicien
   
✅ Étape 4 : Articles de stock
   - Ajoutez 5-10 articles courants
   
✅ Étape 5 : Test
   - Créez une réparation test
   - Imprimez un ticket test
```

### Premier paramétrage

#### Configuration établissement complète

**Informations légales**
```yaml
Nom commercial: TechRepair Pro
Raison sociale: SARL TechRepair
Registre commerce: 16/00-1234567
NIF: 001234567891234
Adresse: 15 Rue Didouche Mourad, 16000 Alger
Téléphone: +213 555 123 456
Email: contact@techrepair.dz
Site web: www.techrepair.dz
```

**Personnalisation visuelle**
```yaml
Logo: logo-techrepair.png (500x500px)
Couleur principale: #2563EB (Bleu)
Couleur secondaire: #10B981 (Vert)
Police: Inter (par défaut)
```

**Messages personnalisés**
```yaml
Message ticket: "Merci de votre confiance ! Garantie 3 mois sur toutes nos réparations."
Message email: "Votre appareil est prêt ! Passez le récupérer aux heures d'ouverture."
Signature: "L'équipe TechRepair Pro"
```

### Comprendre l'interface

#### Menu principal (Sidebar)

```
📊 Tableau de bord    → Vue d'ensemble, statistiques
🔧 Réparations        → Gestion SAV
🛒 Ventes             → Point de vente (POS)
👥 Clients            → Base clients
📦 Stock              → Inventaire
👨‍💼 Équipe             → Gestion utilisateurs
📅 Calendrier         → Planning
📄 Factures           → Facturation
⚙️  Paramètres        → Configuration
```

#### Raccourcis clavier

```
Ctrl + N    → Nouvelle réparation
Ctrl + S    → Sauvegarder
Ctrl + P    → Imprimer
Ctrl + F    → Rechercher
Échap       → Fermer modal
```

---

## 🔧 Gestion des Réparations

### Créer une réparation

#### Formulaire détaillé

**Section 1 : Client**
```yaml
Option A - Client existant:
  - Recherchez par nom ou téléphone
  - Sélectionnez dans la liste
  - Historique affiché automatiquement

Option B - Nouveau client:
  - Nom complet: Ahmed Benali
  - Téléphone: +213 555 000 111
  - Email (optionnel): ahmed@email.dz
  - Adresse (optionnel): Alger
```

**Section 2 : Appareil**
```yaml
Type de panne:
  - Écran / Tactile
  - Batterie
  - Connecteur de charge
  - Boutons
  - Caméra
  - Haut-parleur / Micro
  - Carte mère
  - Logiciel / Déblocage
  - Autre

Appareil: iPhone 13 Pro Max
Description: Écran cassé suite à une chute. Tactile ne répond plus.
IMEI/SN: 356789012345678 (si déblocage iCloud)
```

**Section 3 : Diagnostic & Pièces**
```yaml
Diagnostic:
  "Écran LCD endommagé. Remplacement nécessaire.
   Tactile HS. Châssis légèrement tordu mais réparable."

Pièces utilisées:
  - Écran iPhone 13 Pro Max OLED × 1
  - Film de protection × 1
```

**Section 4 : Tarification**
```yaml
Prix client: 15 000 DA
Coût pièces: 8 500 DA (auto-calculé)
Marge: 6 500 DA (43%)
```

**Section 5 : Paiement**
```yaml
Options:
  ⏳ Non payé → Client paiera à la récupération
  💰 Partiel → Acompte versé (ex: 5 000 DA)
  ✅ Payé → Montant total réglé
```

**Section 6 : Assignation**
```yaml
Technicien: Karim (Technicien)
Statut initial: Diagnostic
Priorité: Normale
Date limite: 08/01/2026
```

### Gérer les statuts {#statuts}

#### Cycle de vie d'une réparation

```
🆕 NOUVEAU
   ↓ (Réception de l'appareil)
   
🔍 DIAGNOSTIC
   ↓ (Analyse terminée, pièces commandées)
   
🔧 EN RÉPARATION
   ↓ (Intervention terminée, tests OK)
   
✅ PRÊT À RÉCUPÉRER
   ↓ (Client notifié, vient récupérer)
   
📦 LIVRÉ
   (Appareil remis au client)
```

#### Changement de statut

**Méthode 1 : Depuis la liste**
```
1. Cliquez sur le statut actuel
2. Menu déroulant s'affiche
3. Sélectionnez le nouveau statut
4. Sauvegarde automatique
```

**Méthode 2 : Depuis le détail**
```
1. Ouvrez la réparation
2. Section "Statut"
3. Choisissez le nouveau statut
4. Ajoutez une note (optionnel)
5. Enregistrer
```

**Bonnes pratiques**
```
✅ Mettez à jour le statut en temps réel
✅ Ajoutez des notes à chaque changement
✅ Notifiez le client aux étapes clés
❌ Ne sautez pas d'étapes
❌ N'oubliez pas de passer en "Livré"
```

### Assignation aux techniciens

#### Comment assigner

**À la création**
```
1. Section "Assignation"
2. Sélectionnez le technicien
3. Le technicien reçoit une notification
4. La réparation apparaît dans son espace
```

**Après création**
```
1. Modifiez la réparation
2. Changez le technicien assigné
3. Ajoutez une note de transfert
4. Enregistrer
```

#### Répartition de charge

**Dashboard Manager**
```
Karim:    12 réparations en cours
Sofiane:   8 réparations en cours
Mehdi:    15 réparations en cours
```

**Conseils**
```
✅ Équilibrez la charge de travail
✅ Assignez selon les spécialités
✅ Tenez compte des délais
```

### Tickets et impression

#### Contenu du ticket

```
┌─────────────────────────────────┐
│     [LOGO ÉTABLISSEMENT]        │
│      TechRepair Pro             │
│   📞 +213 555 123 456           │
│   📍 15 Rue Didouche, Alger     │
├─────────────────────────────────┤
│  TICKET DE RÉPARATION           │
│  #TR-2026-0123        [QR CODE] │
├─────────────────────────────────┤
│ DATE: 06/01/2026 à 14:30        │
│ CLIENT: Ahmed Benali            │
│ TÉL: +213 555 000 111           │
├─────────────────────────────────┤
│ APPAREIL: iPhone 13 Pro Max     │
│ PANNE: Écran / Tactile          │
│ DESC: Écran cassé suite chute   │
│ IMEI: 356789012345678           │
├─────────────────────────────────┤
│ PRIX: 15 000 DA                 │
│ PAIEMENT: ⏳ Non payé           │
├─────────────────────────────────┤
│ ⚠️ IMPORTANT:                   │
│ • Conservez ce ticket           │
│ • Délai: 2-3 jours ouvrés       │
│ • Garantie: 3 mois              │
└─────────────────────────────────┘
```

#### Paramètres d'impression

**Format recommandé**
```
Papier: Thermique 80mm
Orientation: Portrait
Marges: Aucune
Qualité: Normale
Couleur: Noir et blanc
```

**Imprimantes compatibles**
```
✅ Imprimantes thermiques (tickets de caisse)
✅ Imprimantes laser A4
✅ Imprimantes jet d'encre
```

### Suivi client {#suivi-client}

#### Lien de suivi

Chaque réparation génère un lien unique :
```
https://fixwave.space/track/REPAR-ABCDEF
```

**Partage**
```
WhatsApp: "Bonjour, voici le lien pour suivre votre réparation : [LIEN]"
SMS: "Suivez votre réparation iPhone 13 : [LIEN]"
Email: Envoi automatique avec le lien
```

#### Page de suivi client

```
┌─────────────────────────────────┐
│  Suivi de réparation            │
│  #TR-2026-0123                  │
├─────────────────────────────────┤
│  ✅ Réception                   │
│  ✅ Diagnostic                  │
│  🔄 En réparation (actuel)      │
│  ⏳ Prêt à récupérer            │
│  ⏳ Livré                       │
├─────────────────────────────────┤
│  Appareil: iPhone 13 Pro Max    │
│  Statut: En cours de réparation │
│  Délai estimé: 1-2 jours        │
└─────────────────────────────────┘
```

---

## 🛒 Point de Vente 

### Utiliser la caisse

#### Interface POS

**Zone produits (gauche)**
```
[Recherche...]

┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ 📱  │ │ 🔌  │ │ 🎧  │ │ 🛡️  │
│iPhone│ │Charg│ │Écout│ │Coque│
│13Pro│ │65W  │ │BT   │ │Silico│
│140K │ │3K   │ │5K   │ │1.5K │
│Stock│ │Stock│ │Stock│ │Stock│
│  4  │ │ 12  │ │  8  │ │ 25  │
└─────┘ └─────┘ └─────┘ └─────┘
```

**Panier (droite)**
```
┌─────────────────────────────┐
│ 🛒 PANIER (3 articles)      │
├─────────────────────────────┤
│ iPhone 13 Pro Max           │
│ 1 × 140 000 DA      140 000 │
│                             │
│ Chargeur 65W                │
│ 2 × 3 000 DA          6 000 │
│                             │
│ Coque Silicone              │
│ 1 × 1 500 DA          1 500 │
├─────────────────────────────┤
│ Sous-total:         147 500 │
│ TVA (19%):           28 025 │
│ TOTAL:              175 525 │
├─────────────────────────────┤
│      [PAYER →]              │
└─────────────────────────────┘
```

### Gérer la TVA

#### Configuration

**Taux courants en Algérie**
```
0%  → Produits exonérés
9%  → Taux réduit
19% → Taux normal
```

**Application**
```
1. Dans le panier, champ "% TVA"
2. Saisissez le taux (ex: 19)
3. Calcul automatique :
   - Sous-total HT: 147 500 DA
   - TVA 19%: 28 025 DA
   - Total TTC: 175 525 DA
```

### Historique des ventes {#historique-ventes}

#### Consultation

**Filtres disponibles**
```
📅 Période: Aujourd'hui / Cette semaine / Ce mois / Personnalisé
💰 Montant: Min - Max
👤 Client: Recherche par nom
💳 Paiement: Espèces / Carte / BaridiMob
```

**Export**
```
Excel: Toutes les données tabulaires
PDF: Rapport formaté
CSV: Import comptabilité
```

---

## 📦 Stock & Inventaire {#stock}

### Ajouter des articles {#ajouter-articles}

#### Formulaire complet

```yaml
Informations de base:
  Nom: Écran iPhone 13 Pro Max OLED
  SKU: IP13PM-SCREEN-001
  Code-barres: 3700123456789 (optionnel)
  
Type:
  🔧 Pièce de réparation
  🛍️ Article de vente
  
Tarification:
  Prix d'achat HT: 8 000 DA
  Prix de vente TTC: 15 000 DA
  Marge: 7 000 DA (87.5%)
  
Stock:
  Quantité initiale: 5
  Stock minimum: 2
  Stock maximum: 20
  Emplacement: Étagère A3
  
Fournisseur:
  Nom: TechParts DZ
  Référence: TP-IP13PM-01
  Délai livraison: 3 jours
  
Visuel:
  Icône: Smartphone
  Photo: ecran-ip13pm.jpg (optionnel)
```

### Types d'articles

#### Pièce de réparation 🔧

**Caractéristiques**
```
- Utilisée dans les réparations
- Décrémente le stock lors de l'ajout à une réparation
- Calcul automatique du coût de revient
- Traçabilité par réparation
```

**Exemples**
```
- Écrans LCD/OLED
- Batteries
- Connecteurs de charge
- Nappes
- Caméras
- Haut-parleurs
- Châssis
```

#### Article de vente 🛍️

**Caractéristiques**
```
- Vendu au point de vente
- Décrémente le stock lors d'une vente
- Gestion de la TVA
- Statistiques de vente
```

**Exemples**
```
- Coques et protections
- Chargeurs et câbles
- Écouteurs
- Supports
- Accessoires
```

### Alertes de stock

#### Configuration

```yaml
Article: Écran iPhone 13 Pro Max
Stock actuel: 3
Stock minimum: 2
Stock maximum: 20

Alerte déclenchée si:
  - Stock ≤ 2 (alerte rouge)
  - Stock ≤ 5 (alerte orange)
```

#### Notifications

```
🔴 STOCK CRITIQUE
   Écran iPhone 13 Pro Max
   Stock: 1 unité
   Action: Commander immédiatement

🟠 STOCK FAIBLE
   Batterie iPhone 12
   Stock: 4 unités
   Action: Prévoir commande
```

### Inventaire physique

#### Procédure

**1. Préparation**
```
- Choisissez un moment calme
- Imprimez la liste de stock
- Préparez un compteur/scanner
```

**2. Comptage**
```
Pour chaque article:
  1. Comptez physiquement
  2. Notez la quantité réelle
  3. Comparez avec le système
  4. Notez les écarts
```

**3. Ajustement**
```
1. Menu Stock → Inventaire
2. Saisissez les quantités réelles
3. Ajoutez une note pour chaque écart
4. Validez l'inventaire
5. Le système ajuste automatiquement
```

**4. Analyse**
```
Écarts positifs: Stock réel > Stock système
  → Erreur de saisie ou oubli d'enregistrement

Écarts négatifs: Stock réel < Stock système
  → Vol, casse, ou erreur de saisie
```

---

## 👥 Équipe

### Rôles et permissions

#### Tableau des permissions

```
┌──────────────────┬───────┬─────────┬────────────┐
│ Fonctionnalité   │ Tech. │ Manager │ Proprio.   │
├──────────────────┼───────┼─────────┼────────────┤
│ Voir ses répara. │  ✅   │   ✅    │    ✅      │
│ Voir toutes rép. │  ❌   │   ✅    │    ✅      │
│ Créer réparation │  ❌   │   ✅    │    ✅      │
│ Modifier répara. │  ✅*  │   ✅    │    ✅      │
│ Supprimer répara.│  ❌   │   ✅    │    ✅      │
│ Point de vente   │  ❌   │   ✅    │    ✅      │
│ Gérer stock      │  ❌   │   ✅    │    ✅      │
│ Voir clients     │  ✅*  │   ✅    │    ✅      │
│ Gérer équipe     │  ❌   │   ✅    │    ✅      │
│ Factures/Devis   │  ❌   │   ✅    │    ✅      │
│ Statistiques     │  ✅*  │   ✅    │    ✅      │
│ Paramètres       │  ❌   │   ✅    │    ✅      │
│ Abonnement       │  ❌   │   ❌    │    ✅      │
└──────────────────┴───────┴─────────┴────────────┘

* Uniquement pour ses propres réparations/clients
```

### Inviter des membres {#inviter}

#### Processus d'invitation

**Étape 1 : Invitation**
```
1. Menu Équipe → Ajouter un membre
2. Formulaire:
   - Nom: Karim Technicien
   - Email: karim@techrepair.dz
   - Rôle: Technicien
3. Envoyer l'invitation
```

**Étape 2 : Email reçu**
```
┌─────────────────────────────────┐
│ Invitation à rejoindre          │
│ TechWave Pro sur Fixwave      │
├─────────────────────────────────┤
│ Bonjour Karim,                  │
│                                 │
│ Vous avez été invité à rejoindre│
│ l'équipe de TechRepair Pro.     │
│                                 │
│ Rôle: Technicien                │
│                                 │
│ [Accepter l'invitation]         │
└─────────────────────────────────┘
```

**Étape 3 : Création du compte**
```
1. Cliquez sur le lien
2. Créez votre mot de passe
3. Acceptez les CGU
4. Accédez à votre espace
```

### Gestion des accès {#acces}

#### Désactiver un membre

```
Raisons:
  - Départ de l'entreprise
  - Congé longue durée
  - Suspension temporaire

Action:
  1. Menu Équipe
  2. Trouvez le membre
  3. Cliquez sur "Désactiver"
  4. Confirmez

Effet:
  - Le membre ne peut plus se connecter
  - Ses réparations restent visibles
  - Historique conservé
  - Peut être réactivé plus tard
```

#### Supprimer un membre

```
⚠️ ATTENTION: Action irréversible

Effet:
  - Compte supprimé définitivement
  - Réparations transférées au manager
  - Historique anonymisé

Procédure:
  1. Menu Équipe
  2. Trouvez le membre
  3. Cliquez sur "Supprimer"
  4. Confirmez 2 fois
```

---

## 💰 Facturation

### Créer des devis

#### Formulaire de devis

```yaml
En-tête:
  Client: Ahmed Benali
  Date: 06/01/2026
  Validité: 30 jours
  Référence: DEV-2026-001

Lignes:
  1. Réparation écran iPhone 13 Pro Max
     Quantité: 1
     Prix unitaire: 15 000 DA
     Total: 15 000 DA
     
  2. Film de protection
     Quantité: 1
     Prix unitaire: 500 DA
     Total: 500 DA

Totaux:
  Sous-total HT: 15 500 DA
  TVA 19%: 2 945 DA
  Total TTC: 18 445 DA

Conditions:
  - Paiement: 50% à la commande, 50% à la livraison
  - Délai: 2-3 jours ouvrés
  - Garantie: 3 mois pièces et main d'œuvre
```

### Générer des factures

#### Types de factures

**Facture de réparation**
```
Générée automatiquement depuis une réparation payée
Contient: Main d'œuvre + Pièces
```

**Facture de vente**
```
Générée depuis le point de vente
Contient: Articles vendus + TVA
```

**Facture manuelle**
```
Créée manuellement pour services divers
Personnalisable entièrement
```

### Rapports financiers

#### Types de rapports

**Rapport journalier**
```
┌─────────────────────────────────┐
│ RAPPORT DU 06/01/2026           │
├─────────────────────────────────┤
│ Réparations:                    │
│   Nouvelles: 8                  │
│   Terminées: 5                  │
│   CA: 75 000 DA                 │
│                                 │
│ Ventes:                         │
│   Transactions: 12              │
│   CA: 45 000 DA                 │
│                                 │
│ TOTAL CA: 120 000 DA            │
└─────────────────────────────────┘
```

**Rapport mensuel**
```
Janvier 2026
  - CA total: 2 450 000 DA
  - Réparations: 156
  - Ventes: 234
  - Marge moyenne: 42%
  - Top 5 pannes
  - Top 5 produits vendus
```

---

## ⚙️ Paramètres

### Configuration établissement

#### Sections

**1. Informations générales**
```yaml
Nom: TechRepair Pro
Slogan: "Votre expert en réparation"
Téléphone: +213 555 123 456
Email: contact@techrepair.dz
Site web: www.techrepair.dz
```

**2. Adresse**
```yaml
Rue: 15 Rue Didouche Mourad
Ville: Alger
Code postal: 16000
Wilaya: Alger
Pays: Algérie
```

**3. Informations légales**
```yaml
Raison sociale: SARL TechRepair
Forme juridique: SARL
RC: 16/00-1234567
NIF: 001234567891234
NIS: 001234567891
```

**4. Coordonnées bancaires**
```yaml
Banque: CPA
RIB: 00400000123456789012 34
IBAN: DZ59 0040 0000 1234 5678 9012 34
```

### Personnalisation

#### Branding

**Logo**
```
Format: PNG ou JPG
Taille recommandée: 500x500px
Poids max: 2MB
Fond: Transparent (PNG) recommandé
```

**Couleurs**
```
Couleur principale: #2563EB (Bleu)
  → Utilisée pour les boutons, liens
  
Couleur tickets: #10B981 (Vert)
  → Couleur du code de suivi sur les tickets
  
Couleur secondaire: #F59E0B (Orange)
  → Accents et alertes
```

**Messages**
```
Ticket réparation:
  "Merci de votre confiance !
   Garantie 3 mois sur toutes nos réparations.
   Conservez précieusement ce ticket."

Email notification:
  "Bonjour {CLIENT},
   Votre {APPAREIL} est prêt !
   Passez le récupérer à nos heures d'ouverture.
   Cordialement, L'équipe TechRepair Pro"
```

### Intégrations

#### APIs disponibles

**SMS (à venir)**
```
Fournisseur: Twilio / Vonage
Usage: Notifications clients
Configuration: Clé API + Numéro expéditeur
```

**Email (à venir)**
```
Fournisseur: SendGrid / Mailgun
Usage: Devis, factures, notifications
Configuration: Clé API + Domaine vérifié
```

**Paiement en ligne (à venir)**
```
Fournisseur: Stripe / CIB
Usage: Paiements clients en ligne
Configuration: Clés publique/privée
```

---

## 🆘 Support

### Besoin d'aide ?

**Contact**
- 📧 Email: support@fixwave.space
- 💬 Chat: Disponible dans l'app
- 📱 WhatsApp: +213 540 031 126

**Ressources**
- 📚 Documentation: docs.fixwave.space
- 🎥 Vidéos: youtube.com/fixwave
- ❓ FAQ: fixwave.space/faq

---

*Dernière mise à jour : Janvier 2026*

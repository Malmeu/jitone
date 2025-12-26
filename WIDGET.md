# 🔌 Widget de Suivi des Réparations - RepairTrack DZ

## ✨ Fonctionnalité

### Widget Intégrable
Un système complet permettant à vos clients de suivre leurs réparations directement depuis votre site web ou tout autre site.

## 🎯 Avantages

### Pour Vous
- ✅ **Réduction des appels** : Les clients vérifient eux-mêmes
- ✅ **Disponibilité 24/7** : Accessible à tout moment
- ✅ **Image professionnelle** : Service moderne et transparent
- ✅ **Gain de temps** : Moins d'interruptions

### Pour Vos Clients
- ✅ **Suivi en temps réel** : Statut toujours à jour
- ✅ **Accessible partout** : Depuis n'importe quel appareil
- ✅ **Informations complètes** : Appareil, statut, progression
- ✅ **Contact facile** : Coordonnées de l'établissement

## 🛠️ Composants du Système

### 1. **API Publique**
- **Endpoint** : `/api/track/[code]`
- **Méthode** : GET
- **Sécurité** : Données publiques uniquement
- **Format** : JSON

### 2. **Page Widget**
- **URL** : `/widget`
- **Type** : Page standalone
- **Design** : Responsive et moderne
- **Personnalisation** : Logo et couleurs de l'établissement

### 3. **Configuration Dashboard**
- **URL** : `/dashboard/widget-config`
- **Accès** : Menu "Widget"
- **Fonctions** : Génération de code d'intégration

## 📋 Options d'Intégration

### Option 1 : iFrame (Recommandé)

#### Code
```html
<iframe 
    src="https://votre-domaine.com/widget" 
    width="100%" 
    height="800" 
    frameborder="0"
    style="border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
></iframe>
```

#### Avantages
- ✅ Intégration complète dans votre page
- ✅ Design cohérent avec votre site
- ✅ Mises à jour automatiques
- ✅ Aucune maintenance

#### Utilisation
1. Copiez le code
2. Collez dans votre page HTML
3. Ajustez la hauteur si nécessaire

### Option 2 : Lien Direct

#### Code
```html
<a href="https://votre-domaine.com/widget" 
   target="_blank"
   style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
    🔍 Suivre ma réparation
</a>
```

#### Avantages
- ✅ Simple à intégrer
- ✅ Fonctionne partout
- ✅ Personnalisable facilement
- ✅ Idéal pour emails et SMS

#### Utilisation
1. Copiez le code
2. Personnalisez les couleurs
3. Ajoutez où vous voulez

### Option 3 : URL Simple

#### URL
```
https://votre-domaine.com/widget
```

#### Avantages
- ✅ Ultra simple
- ✅ Partageable facilement
- ✅ QR Code possible
- ✅ Réseaux sociaux

#### Utilisation
- Email
- SMS
- WhatsApp
- Facebook
- Instagram
- Carte de visite (QR Code)

## 🎨 Interface du Widget

### Page de Recherche
```
┌─────────────────────────────────────┐
│   🔍 Suivi de Réparation            │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ REPAR-ABC123    [Rechercher]│   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Résultat du Suivi
```
┌─────────────────────────────────────┐
│   [Logo de l'établissement]         │
├─────────────────────────────────────┤
│   Code: REPAR-ABC123                │
│                                     │
│   Appareil: iPhone 12 Pro           │
│   Description: Remplacement écran   │
│                                     │
│   ✅ Prêt à récupérer                │
│   Votre appareil est prêt !         │
│                                     │
│   Progression:                      │
│   ✓ Nouveau                         │
│   ✓ Diagnostic                      │
│   ✓ En réparation                   │
│   ✓ Prêt à récupérer [En cours]     │
│                                     │
│   📞 Contact:                        │
│   Nom de l'établissement            │
│   Tél: +213 550 123 456             │
│   📍 Adresse                         │
└─────────────────────────────────────┘
```

## 🔒 Sécurité

### Données Publiques Uniquement
L'API ne retourne que :
- ✅ Code de réparation
- ✅ Appareil
- ✅ Description
- ✅ Statut
- ✅ Date de création
- ✅ Infos établissement

### Données Privées Protégées
Jamais exposées :
- ❌ Prix
- ❌ Coût
- ❌ Bénéfice
- ❌ Informations client complètes
- ❌ Données de paiement

### Protection RLS
- Supabase RLS actif
- Accès lecture seule
- Pas d'authentification requise
- Pas de modification possible

## 📱 Responsive Design

### Desktop
- Layout large
- Timeline verticale
- Tous les détails visibles

### Tablette
- Layout adapté
- Navigation fluide
- Optimisé pour tactile

### Mobile
- Layout compact
- Scroll vertical
- Boutons larges

## 🎨 Personnalisation

### Logo
- Affiché en haut du widget
- Format : PNG, JPG, SVG
- Taille recommandée : 200x60px

### Couleur
- Couleur principale du ticket
- Appliquée au code de réparation
- Définie dans les paramètres

### Messages
- Personnalisables par statut
- Adaptés à votre établissement
- Ton professionnel

## 📊 Statuts Affichés

### 🆕 Nouveau
- **Message** : "Votre réparation a été enregistrée"
- **Couleur** : Gris
- **Icône** : Horloge

### 🔍 Diagnostic
- **Message** : "Diagnostic en cours..."
- **Couleur** : Jaune
- **Icône** : Loupe

### 🔧 En réparation
- **Message** : "Nous travaillons sur votre appareil"
- **Couleur** : Bleu
- **Icône** : Clé

### ✅ Prêt à récupérer
- **Message** : "Votre appareil est prêt ! Vous pouvez venir le récupérer"
- **Couleur** : Vert
- **Icône** : Check

### 📦 Récupéré
- **Message** : "Appareil récupéré. Merci !"
- **Couleur** : Neutre
- **Icône** : Paquet

### ❌ Annulé
- **Message** : "Cette réparation a été annulée"
- **Couleur** : Rouge
- **Icône** : X

## 💡 Cas d'Usage

### 1. Site Web d'Établissement
```html
<!-- Page "Suivi" -->
<h1>Suivez votre réparation</h1>
<iframe src="https://votre-domaine.com/widget" ...></iframe>
```

### 2. Email de Confirmation
```html
Bonjour,

Votre réparation a été enregistrée.
Code: REPAR-ABC123

<a href="https://votre-domaine.com/widget">
    Suivre ma réparation
</a>
```

### 3. SMS
```
Votre réparation REPAR-ABC123 est prête !
Suivez-la ici: https://votre-domaine.com/widget
```

### 4. WhatsApp
```
✅ Votre iPhone est prêt !
Code: REPAR-ABC123
Suivez: https://votre-domaine.com/widget
```

### 5. Réseaux Sociaux
```
📱 Suivez vos réparations en temps réel !
👉 https://votre-domaine.com/widget
```

## 🚀 Installation

### Étape 1 : Accéder à la Configuration
1. Dashboard → **Widget**
2. Choisissez une option d'intégration

### Étape 2 : Copier le Code
1. Cliquez sur le bouton **Copier**
2. Le code est dans votre presse-papier

### Étape 3 : Intégrer
1. Ouvrez votre site web
2. Collez le code dans votre HTML
3. Sauvegardez

### Étape 4 : Tester
1. Ouvrez votre site
2. Entrez un code de réparation
3. Vérifiez l'affichage

## 🔧 Personnalisation Avancée

### Modifier la Hauteur de l'iFrame
```html
<iframe ... height="600"></iframe>  <!-- Plus petit -->
<iframe ... height="1000"></iframe> <!-- Plus grand -->
```

### Modifier les Couleurs du Bouton
```html
<a ... style="background: #10b981; ...">  <!-- Vert -->
<a ... style="background: #ef4444; ...">  <!-- Rouge -->
<a ... style="background: #8b5cf6; ...">  <!-- Violet -->
```

### Ajouter une Bordure à l'iFrame
```html
<iframe ... style="border: 2px solid #e5e7eb; ..."></iframe>
```

## 📈 Statistiques (Future)

### Métriques à Venir
- Nombre de recherches
- Codes les plus consultés
- Heures de consultation
- Taux de réussite

## 🐛 Dépannage

### Le Widget ne s'affiche pas
- ✅ Vérifiez l'URL
- ✅ Vérifiez le code HTML
- ✅ Vérifiez les permissions du site

### Code non trouvé
- ✅ Vérifiez l'orthographe
- ✅ Le code est en majuscules
- ✅ Format: REPAR-XXXXXX

### Design cassé
- ✅ Vérifiez la largeur de l'iFrame
- ✅ Vérifiez les CSS conflictuels
- ✅ Testez sur différents navigateurs

## 📝 Bonnes Pratiques

### Communication
✅ **Mentionnez le widget** sur vos tickets
✅ **Envoyez le lien** par SMS/Email
✅ **Affichez l'URL** en magasin
✅ **Partagez** sur les réseaux sociaux

### Mise à Jour
✅ **Gardez les statuts à jour** en temps réel
✅ **Répondez rapidement** aux questions
✅ **Testez régulièrement** le widget

### Support
✅ **Formez votre équipe** à l'utilisation
✅ **Expliquez aux clients** comment l'utiliser
✅ **Collectez les retours** pour améliorer

## 🎯 Prochaines Fonctionnalités

### En Développement
- 📊 Statistiques de consultation
- 🔔 Notifications push
- 💬 Chat intégré
- 📧 Alertes email automatiques
- 🌍 Multi-langues
- 🎨 Thèmes personnalisables

---

**Astuce** : Ajoutez le lien du widget sur votre carte de visite avec un QR Code !

# 🎨 Système de Thèmes - DaisyUI

## ✅ Installation Complète

### 1. **DaisyUI Installé**
```bash
npm install -D daisyui@latest
```

### 2. **Configuration Tailwind**
- ✅ 29 thèmes disponibles
- ✅ Sauvegarde automatique dans localStorage
- ✅ Classes DaisyUI activées

### 3. **Composant ThemeSelector**
- ✅ Sélecteur de thème avec aperçu
- ✅ Intégré dans le dashboard (mobile + desktop)
- ✅ Icône palette avec menu déroulant

## 🎨 Thèmes Disponibles

### Clairs
- ☀️ Light (par défaut)
- 🧁 Cupcake
- 🐝 Bumblebee
- 💚 Émeraude
- 💼 Corporate
- 🌸 Jardin
- 🎨 Pastel
- 📐 Wireframe
- 👑 Luxe
- 🍋 Limonade
- ❄️ Hiver

### Sombres
- 🌙 Dark
- 🌆 Synthwave
- 🤖 Cyberpunk
- 🎃 Halloween
- 🌲 Forêt
- 🌊 Aqua
- 🎵 Lo-Fi
- 🦄 Fantasy
- ⚫ Noir
- 🧛 Dracula
- 🌃 Nuit
- ☕ Café

### Colorés
- 📻 Rétro
- 💝 Valentine
- 🖨️ CMYK
- 🍂 Automne
- 📊 Business
- 🧪 Acid

## 🔧 Utilisation

### Classes DaisyUI
Utilisez les classes sémantiques de DaisyUI :

```tsx
// Au lieu de
<div className="bg-white text-black">

// Utilisez
<div className="bg-base-100 text-base-content">
```

### Classes Principales

#### Couleurs de Base
```
bg-base-100    // Fond principal
bg-base-200    // Fond secondaire
bg-base-300    // Fond tertiaire
text-base-content  // Texte principal
```

#### Couleurs Primaires
```
bg-primary     // Couleur primaire
text-primary   // Texte primaire
btn-primary    // Bouton primaire
```

#### Autres Couleurs
```
bg-secondary   // Secondaire
bg-accent      // Accent
bg-neutral     // Neutre
bg-info        // Info
bg-success     // Succès
bg-warning     // Attention
bg-error       // Erreur
```

### Composants DaisyUI

#### Boutons
```tsx
<button className="btn">Normal</button>
<button className="btn btn-primary">Primaire</button>
<button className="btn btn-secondary">Secondaire</button>
<button className="btn btn-accent">Accent</button>
<button className="btn btn-ghost">Ghost</button>
<button className="btn btn-link">Lien</button>
```

#### Cards
```tsx
<div className="card bg-base-100 shadow-xl">
  <div className="card-body">
    <h2 className="card-title">Titre</h2>
    <p>Contenu</p>
    <div className="card-actions">
      <button className="btn btn-primary">Action</button>
    </div>
  </div>
</div>
```

#### Badges
```tsx
<span className="badge">Défaut</span>
<span className="badge badge-primary">Primaire</span>
<span className="badge badge-secondary">Secondaire</span>
<span className="badge badge-accent">Accent</span>
```

#### Alerts
```tsx
<div className="alert alert-info">
  <span>Info</span>
</div>
<div className="alert alert-success">
  <span>Succès</span>
</div>
<div className="alert alert-warning">
  <span>Attention</span>
</div>
<div className="alert alert-error">
  <span>Erreur</span>
</div>
```

## 📱 Responsive

Les thèmes s'adaptent automatiquement à tous les écrans :
- Mobile : Menu déroulant compact
- Desktop : Menu déroulant avec aperçu

## 💾 Sauvegarde

Le thème sélectionné est sauvegardé dans `localStorage` :
```javascript
localStorage.setItem('theme', 'dark');
```

Au chargement de la page, le thème est restauré automatiquement.

## 🎯 Prochaines Étapes

Maintenant que les thèmes sont en place, nous allons implémenter :

1. ✅ **Devis/Factures Pro**
   - Templates professionnels
   - Export PDF
   - Numérotation automatique

2. ✅ **Calendrier & RDV**
   - Planning visuel
   - Réservation de créneaux
   - Rappels automatiques

---

**Astuce** : Essayez différents thèmes pour trouver celui qui correspond le mieux à votre marque ! 🎨

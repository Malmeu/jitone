# 🎨 Test du Système de Thèmes DaisyUI

## ✅ Checklist de Vérification

### 1. Redémarrer le Serveur
```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm run dev
```

### 2. Vider le Cache du Navigateur
- **Chrome/Edge** : Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
- **Firefox** : Ctrl+F5 (Windows) ou Cmd+Shift+R (Mac)

### 3. Localiser le Sélecteur de Thème

#### Sur Desktop
```
Sidebar gauche → En bas → Bouton avec bordure
[🎨 ☀️ Clair]
```

#### Sur Mobile
```
Header en haut → À droite du logo
[🎨] [☰]
```

### 4. Tester un Thème

1. **Cliquez** sur le bouton avec l'icône 🎨
2. **Menu s'ouvre** avec 29 thèmes
3. **Sélectionnez** "🌙 Sombre"
4. **Résultat attendu** :
   - Fond devient sombre
   - Texte devient clair
   - Menu se ferme
   - Thème sauvegardé

### 5. Vérifier la Persistance

1. **Rechargez la page** (F5)
2. **Le thème sombre reste** activé
3. **localStorage** contient : `theme: "dark"`

## 🐛 Dépannage

### Le bouton n'apparaît pas
```bash
# Vérifiez que le composant est importé
grep -r "ThemeSelector" app/dashboard/layout.tsx

# Devrait afficher 2 lignes:
# import ThemeSelector from '@/components/ThemeSelector';
# <ThemeSelector />
```

### Le thème ne change pas

#### Vérification 1 : Console du Navigateur
```javascript
// Ouvrez la console (F12)
// Tapez:
document.documentElement.getAttribute('data-theme')
// Devrait retourner le thème actuel (ex: "dark")
```

#### Vérification 2 : Classes DaisyUI
```javascript
// Dans la console:
document.querySelector('.bg-base-100')
// Devrait retourner un élément
```

#### Vérification 3 : Tailwind Config
```bash
# Vérifiez que DaisyUI est dans les plugins
cat tailwind.config.ts | grep daisyui
```

### Les couleurs ne changent pas

#### Solution : Remplacer les classes Tailwind par DaisyUI

**Avant** :
```tsx
<div className="bg-white text-black">
```

**Après** :
```tsx
<div className="bg-base-100 text-base-content">
```

## 📋 Classes à Remplacer

### Fonds
```
bg-white       → bg-base-100
bg-gray-50     → bg-base-200
bg-gray-100    → bg-base-300
```

### Textes
```
text-black         → text-base-content
text-neutral-900   → text-base-content
text-neutral-600   → text-base-content/60
text-neutral-500   → text-base-content/50
```

### Bordures
```
border-gray-100    → border-base-300
border-gray-200    → border-base-300
```

## 🎯 Test Complet

### Thèmes à Tester

1. **☀️ Light** (par défaut)
   - Fond blanc
   - Texte noir

2. **🌙 Dark**
   - Fond noir
   - Texte blanc

3. **🧁 Cupcake**
   - Fond rose pastel
   - Texte sombre

4. **🤖 Cyberpunk**
   - Fond jaune fluo
   - Texte noir/rose

5. **🧛 Dracula**
   - Fond violet foncé
   - Texte rose/cyan

### Résultat Attendu

Chaque thème devrait changer :
- ✅ Couleur de fond
- ✅ Couleur de texte
- ✅ Couleur des boutons
- ✅ Couleur des bordures
- ✅ Couleur primaire

## 🔧 Si Rien Ne Fonctionne

### Étape 1 : Vérifier l'Installation
```bash
npm list daisyui
# Devrait afficher: daisyui@x.x.x
```

### Étape 2 : Réinstaller DaisyUI
```bash
npm uninstall daisyui
npm install -D daisyui@latest
```

### Étape 3 : Nettoyer le Cache Next.js
```bash
rm -rf .next
npm run dev
```

### Étape 4 : Vérifier PostCSS
```bash
cat postcss.config.mjs
# Devrait contenir tailwindcss
```

## 📞 Support

Si le problème persiste :

1. **Vérifiez** la console du navigateur (F12)
2. **Cherchez** les erreurs JavaScript
3. **Partagez** le message d'erreur

---

**Note** : Le changement de thème devrait être **instantané** et **visible** immédiatement ! 🎨✨

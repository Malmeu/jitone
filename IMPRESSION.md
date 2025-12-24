# 🖨️ Guide d'Impression des Tickets - Format Ticket de Caisse

## 📐 Format du Ticket

### Dimensions
- **Largeur** : 80mm (standard ticket de caisse)
- **Hauteur** : Automatique (s'adapte au contenu)
- **Marges** : 0mm (impression sans marges)

### Compatibilité
✅ Imprimantes thermiques 80mm  
✅ Imprimantes à tickets de caisse  
✅ Imprimantes standards (avec ajustement)  

## 🎨 Optimisations pour l'Impression

### Tailles ajustées
- **Logo** : Max 40px de hauteur
- **QR Code** : 120x120px
- **Titre** : 16pt
- **Sous-titres** : 14pt
- **Texte** : 10pt

### Éléments masqués
- ❌ Header avec boutons
- ❌ Fond gris du modal
- ❌ Sidebar du dashboard
- ✅ Uniquement le contenu du ticket

## 🖨️ Comment Imprimer

### Méthode 1 : Impression Directe
1. Cliquez sur le bouton **"Imprimer"** (bleu)
2. La fenêtre d'impression s'ouvre
3. Le ticket se ferme automatiquement après

### Méthode 2 : Aperçu
1. Cliquez sur **"Aperçu"** (outline)
2. Vérifiez le rendu
3. Imprimez manuellement (Ctrl+P / Cmd+P)

## ⚙️ Configuration de l'Imprimante

### Pour Imprimante Thermique 80mm

1. **Ouvrir les paramètres d'impression**
2. **Sélectionner** :
   - Format : Personnalisé
   - Largeur : 80mm
   - Hauteur : Auto
   - Marges : 0mm

3. **Options recommandées** :
   - Qualité : Normale
   - Échelle : 100%
   - Orientation : Portrait

### Pour Imprimante Standard

1. **Paramètres** :
   - Format : A4 ou Letter
   - Échelle : Ajuster à la page
   - Marges : Minimales

2. **Découper** le ticket après impression

## 🔧 Résolution de Problèmes

### Le ticket est vide à l'impression
- ✅ **Solution** : Vérifiez que la classe `ticket-content` est présente
- ✅ Rechargez la page et réessayez

### Le QR code ne s'imprime pas
- ✅ **Solution** : Activez "Graphiques d'arrière-plan" dans les options d'impression
- ✅ Ou utilisez Chrome/Edge qui gèrent mieux les canvas

### Le ticket est trop petit/grand
- ✅ **Solution** : Ajustez l'échelle dans les paramètres d'impression
- ✅ Essayez 90% ou 110% selon votre imprimante

### Les couleurs ne s'impriment pas
- ✅ **Solution** : Activez "Imprimer les couleurs d'arrière-plan"
- ✅ Ou désactivez le mode économie d'encre

## 📱 Impression depuis Mobile

### iOS (Safari)
1. Ouvrez le ticket
2. Cliquez sur "Imprimer"
3. Utilisez AirPrint

### Android (Chrome)
1. Ouvrez le ticket
2. Menu → Imprimer
3. Sélectionnez votre imprimante

## 🎯 Conseils

### Pour une meilleure qualité
- Utilisez du papier thermique de qualité
- Nettoyez régulièrement la tête d'impression
- Vérifiez le niveau d'encre/ruban

### Pour économiser
- Désactivez le logo si non nécessaire
- Réduisez la taille du QR code dans les paramètres
- Utilisez le mode brouillon pour les tests

## 🔄 Réimpression

Vous pouvez réimprimer n'importe quel ticket :
1. Dashboard → Réparations
2. Cliquez sur l'icône 🖨️ à droite
3. Le ticket s'ouvre → Imprimez

## 📊 Contenu du Ticket

### Informations affichées
✅ Logo de l'établissement (si configuré)  
✅ Nom et coordonnées de l'atelier  
✅ Code de suivi (REPAR-XXXXXX)  
✅ QR Code scannable  
✅ Informations client  
✅ Détails de l'appareil  
✅ Description du problème  
✅ Prix estimé  
✅ Date de dépôt  
✅ Message personnalisé (si configuré)  
✅ Instructions de suivi  

---

**Astuce** : Gardez toujours quelques tickets vierges pour tester votre imprimante !

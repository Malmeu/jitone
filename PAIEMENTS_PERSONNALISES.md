# 💰 Paiements Personnalisés - RepairTrack DZ

## ✨ Nouvelle Fonctionnalité

### Montant Personnalisable
Vous pouvez maintenant modifier le montant à encaisser lors du paiement !

## 🎯 Cas d'Usage

### 1. Pièce Supplémentaire
- **Situation** : Vous devez remplacer une pièce supplémentaire
- **Action** : Augmentez le montant et ajoutez une note
- **Exemple** : 
  - Prix initial : 5 000 DA
  - Nouveau montant : 7 500 DA
  - Note : "Écran + batterie supplémentaire"

### 2. Remise Client
- **Situation** : Client fidèle ou promotion
- **Action** : Réduisez le montant et expliquez
- **Exemple** :
  - Prix initial : 10 000 DA
  - Nouveau montant : 8 500 DA
  - Note : "Remise client fidèle -15%"

### 3. Frais Supplémentaires
- **Situation** : Déplacement, urgence, etc.
- **Action** : Ajoutez les frais et documentez
- **Exemple** :
  - Prix initial : 3 000 DA
  - Nouveau montant : 4 000 DA
  - Note : "Frais de déplacement à domicile"

## 🔧 Comment Utiliser

### Étape 1 : Ouvrir le Paiement
1. Dashboard → Réparations
2. Cliquez sur **"💰 Payé"**

### Étape 2 : Modifier le Montant
1. Le champ **"Montant à encaisser"** est pré-rempli avec le prix de la réparation
2. Modifiez le montant selon vos besoins
3. Un indicateur montre la différence :
   - **Vert** : Montant augmenté (+X DA)
   - **Rouge** : Montant réduit (-X DA)

### Étape 3 : Ajouter une Note (Optionnel)
1. Champ **"Note"** : 200 caractères max
2. Expliquez la raison du changement
3. Exemples :
   - "Pièce supplémentaire"
   - "Remise -10%"
   - "Frais de déplacement"
   - "Réparation urgente"

### Étape 4 : Choisir la Méthode
1. 💵 **Espèces**
2. 📱 **BaridiMob**

### Étape 5 : Confirmer
1. Cliquez sur **"✓ Confirmer le paiement"**
2. Le paiement est enregistré avec le montant personnalisé

## 📊 Affichage dans les Factures

### Tableau des Paiements
- **Montant** : Le montant réellement encaissé
- **Note** : Affichée sous l'appareil avec l'icône 📝
- **Exemple** :
  ```
  iPhone 12
  📝 Écran + batterie supplémentaire
  ```

### Statistiques
- Les statistiques sont calculées sur les **montants réels** encaissés
- Pas sur les prix initiaux des réparations

## 🗄️ Base de Données

### Migration SQL
Fichier : `supabase/migrations/20240108000000_add_payment_note.sql`

```sql
alter table public.payments add column if not exists note text;
```

### Exécution
1. Ouvrez **Supabase → SQL Editor**
2. Copiez et exécutez le SQL ci-dessus
3. La colonne `note` est ajoutée

## 💡 Bonnes Pratiques

### Quand Modifier le Montant ?
✅ **OUI** :
- Pièce supplémentaire nécessaire
- Réparation plus complexe que prévu
- Frais de déplacement
- Remise commerciale
- Promotion spéciale

❌ **NON** :
- Erreur de saisie du prix initial → Modifiez le prix de la réparation
- Client ne peut pas payer → Utilisez les paiements partiels (à venir)

### Toujours Ajouter une Note
- **Traçabilité** : Savoir pourquoi le montant a changé
- **Comptabilité** : Justifier les écarts
- **Communication** : Expliquer au client

### Exemples de Notes Claires
✅ **Bonnes notes** :
- "Écran + batterie (pièces supplémentaires)"
- "Remise fidélité -15%"
- "Déplacement à domicile +1000 DA"
- "Réparation urgente (24h)"

❌ **Notes vagues** :
- "Plus cher"
- "Changement"
- "Autre"

## 📈 Avantages

### Pour Vous
- ✅ **Flexibilité** : Adaptez le prix à la situation
- ✅ **Traçabilité** : Toutes les modifications sont documentées
- ✅ **Transparence** : Le client comprend les frais
- ✅ **Comptabilité** : Justification des écarts

### Pour le Client
- ✅ **Clarté** : Comprend ce qu'il paie
- ✅ **Confiance** : Tout est documenté
- ✅ **Équité** : Remises possibles

## 🔮 Prochaines Améliorations

### Paiements Partiels
- Permettre plusieurs paiements pour une réparation
- Suivi du solde restant
- Historique des versements

### Factures PDF
- Génération automatique
- Détail des pièces et main d'œuvre
- Envoi par email

### Devis
- Créer un devis avant réparation
- Validation client
- Conversion en facture

---

**Astuce** : Utilisez toujours une note claire pour justifier les changements de prix. C'est important pour votre comptabilité et la confiance du client !

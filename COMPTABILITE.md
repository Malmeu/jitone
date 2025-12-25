# 📊 Comptabilité Détaillée - RepairTrack DZ

## ✨ Nouvelle Fonctionnalité

### Gestion des Coûts et Bénéfices
Vous pouvez maintenant suivre vos coûts, calculer vos bénéfices et analyser votre rentabilité !

## 🎯 Fonctionnalités

### 1. 📝 **Formulaire de Réparation**

#### Champs Prix
- **Prix de vente** : Ce que vous facturez au client
- **Prix de revient** : Ce que ça vous coûte (pièces, déblocage, etc.)
- **Bénéfice estimé** : Calculé automatiquement en temps réel

#### Affichage du Bénéfice
```
Prix de vente : 5000 DA
Prix de revient : 3000 DA
💰 Bénéfice estimé : 2000 DA (vert si positif, rouge si négatif)
```

### 2. 📊 **Page Factures & Paiements**

#### 6 Cartes de Statistiques

1. **💵 Chiffre d'Affaires**
   - Total encaissé
   - Fond bleu dégradé
   - Taille XL

2. **💵 Espèces**
   - Total en espèces
   - Fond blanc

3. **📱 BaridiMob**
   - Total BaridiMob
   - Fond blanc

4. **📦 Coût Total**
   - Somme des coûts
   - Fond blanc

5. **💰 Bénéfice**
   - Somme des bénéfices
   - Fond vert dégradé
   - Affiche la marge en %
   - Taille XL

6. **👁️ Transactions**
   - Nombre de paiements
   - Fond blanc

## 🗄️ Base de Données

### Migration SQL
Fichier : `supabase/migrations/20240110000000_add_cost_and_profit.sql`

```sql
-- Colonnes ajoutées
alter table public.repairs add column if not exists cost_price numeric(10,2) default 0;
alter table public.repairs add column if not exists profit numeric(10,2) generated always as (
    case 
        when payment_status = 'paid' and status != 'annule' 
        then (paid_amount - cost_price)
        else 0
    end
) stored;
```

### Colonne Calculée
- **`profit`** : Colonne **générée automatiquement**
- **Formule** : `paid_amount - cost_price`
- **Conditions** : Seulement si payé et non annulé
- **Type** : `GENERATED ALWAYS AS ... STORED`

### Exécution
1. Ouvrez **Supabase → SQL Editor**
2. Copiez et exécutez le SQL ci-dessus
3. Les colonnes sont ajoutées automatiquement

## 💡 Utilisation

### Créer une Réparation avec Coûts

1. **Dashboard → Nouvelle Réparation**
2. Remplissez les informations client et appareil
3. **Prix de vente** : 5000 DA
4. **Prix de revient** : 3000 DA
5. Le bénéfice s'affiche : **2000 DA** (vert)
6. Créez la réparation

### Exemple Complet
```
Client : Mohamed Benzema
Appareil : iPhone 12 Pro
Description : Remplacement écran
Prix de vente : 5000 DA
Prix de revient : 3000 DA
💰 Bénéfice estimé : 2000 DA

Détail du coût :
- Écran : 2500 DA
- Batterie : 500 DA
Total : 3000 DA
```

## 📈 Calculs Automatiques

### Bénéfice par Réparation
```sql
profit = paid_amount - cost_price
```

**Conditions** :
- ✅ `payment_status = 'paid'`
- ✅ `status != 'annule'`
- ❌ Sinon : `profit = 0`

### Statistiques Globales

#### Chiffre d'Affaires
```javascript
total = sum(paid_amount) // Réparations payées non annulées
```

#### Coût Total
```javascript
totalCost = sum(cost_price) // Réparations payées non annulées
```

#### Bénéfice Total
```javascript
profit = sum(profit) // Calculé automatiquement par la DB
```

#### Marge Bénéficiaire
```javascript
marge = (profit / total) * 100
```

## 🎨 Interface

### Formulaire
- **Layout** : 2 colonnes (Prix de vente | Prix de revient)
- **Bénéfice** : Carte verte avec dégradé
- **Couleur** : Vert si positif, rouge si négatif
- **Animation** : Apparaît quand les deux champs sont remplis

### Page Factures
- **Grille** : 6 colonnes sur desktop, 3 sur tablette, 1 sur mobile
- **Cartes importantes** : Chiffre d'affaires et Bénéfice (plus grandes)
- **Marge** : Affichée en petit sous le bénéfice

## 📊 Exemples de Scénarios

### Scénario 1 : Réparation Rentable
```
Prix de vente : 10 000 DA
Prix de revient : 6 000 DA
Bénéfice : 4 000 DA
Marge : 40%
```

### Scénario 2 : Réparation à Perte
```
Prix de vente : 3 000 DA
Prix de revient : 4 000 DA
Bénéfice : -1 000 DA (rouge)
Marge : -33.3%
```

### Scénario 3 : Déblocage
```
Prix de vente : 2 000 DA
Prix de revient : 500 DA (coût du déblocage)
Bénéfice : 1 500 DA
Marge : 75%
```

## 💰 Analyse de Rentabilité

### Marges Typiques (Algérie)

#### Réparations
- **Écran** : 30-50%
- **Batterie** : 40-60%
- **Connecteur** : 50-70%

#### Déblocages
- **Simple** : 60-80%
- **Complexe** : 40-60%

### Objectifs Recommandés
- **Marge minimale** : 30%
- **Marge cible** : 50%
- **Marge excellente** : 70%+

## 🔍 Suivi de Performance

### Indicateurs Clés

1. **Chiffre d'Affaires**
   - Objectif : Croissance mensuelle
   - Suivi : Tendance

2. **Bénéfice**
   - Objectif : Maximiser
   - Suivi : Par type de réparation

3. **Marge**
   - Objectif : > 50%
   - Suivi : Moyenne mensuelle

4. **Coût Moyen**
   - Objectif : Optimiser
   - Suivi : Par fournisseur

## 🚀 Prochaines Améliorations

### Fonctionnalités Futures

1. **Rapports Détaillés**
   - Graphiques de rentabilité
   - Évolution mensuelle
   - Comparaison par période

2. **Analyse par Catégorie**
   - Bénéfice par type d'appareil
   - Bénéfice par type de réparation
   - Produits les plus rentables

3. **Gestion des Stocks**
   - Suivi des pièces
   - Coût automatique
   - Alertes de stock

4. **Prévisions**
   - Tendances
   - Objectifs
   - Projections

5. **Export Comptable**
   - PDF
   - Excel
   - Format comptable

## 📝 Bonnes Pratiques

### Saisie des Coûts

✅ **À FAIRE** :
- Inclure le coût des pièces
- Inclure les frais de déblocage
- Inclure les frais annexes
- Être précis

❌ **À ÉVITER** :
- Oublier des coûts
- Arrondir trop
- Ne pas mettre à jour

### Analyse

✅ **Régulièrement** :
- Vérifier la marge globale
- Identifier les réparations à perte
- Ajuster les prix si nécessaire
- Optimiser les coûts

### Tarification

✅ **Stratégie** :
- Connaître vos coûts
- Fixer une marge cible
- Rester compétitif
- Valoriser votre expertise

## 🔒 Sécurité

### Protection des Données
- **Coûts** : Visibles uniquement par vous
- **Bénéfices** : Calculés côté serveur
- **RLS** : Protection par établissement

### Confidentialité
- Les clients ne voient que le prix de vente
- Les coûts ne sont jamais affichés sur les tickets
- Les bénéfices sont privés

## 📱 Responsive

### Desktop
- 6 colonnes de statistiques
- Tout visible d'un coup d'œil

### Tablette
- 3 colonnes
- 2 lignes

### Mobile
- 1 colonne
- Scroll vertical

---

**Astuce** : Suivez votre marge régulièrement pour optimiser votre rentabilité !

# 🔧 Système d'Interventions Multi-Appareils

## 📋 Vue d'ensemble

Ce système permet aux réparateurs de gérer deux types de réparations :
1. **Réparation Simple** : 1 appareil, 1 panne (système actuel)
2. **Intervention** : Plusieurs appareils, plusieurs pannes par appareil (nouveau)

---

## 🏗️ Architecture Base de Données

### Tables créées :

```
repairs
├── type: 'simple' | 'intervention'  ← Nouveau champ
│
intervention_devices (si type = 'intervention')
├── repair_id → repairs.id
├── device_model (ex: iPhone 13 Pro)
├── imei_sn
├── device_order (1, 2, 3...)
├── total_price (calculé automatiquement)
│
device_faults
├── device_id → intervention_devices.id
├── fault_type_id → fault_types.id
├── price
├── cost_price
├── status ('pending', 'in_progress', 'completed', 'cancelled')
│
fault_parts
├── fault_id → device_faults.id
├── inventory_id → inventory.id
├── quantity
├── unit_price
```

---

## 🎨 Interface Utilisateur

### Tabs (✅ Fait)
```
┌─────────────────────────────────────┐
│ [📱 Réparation Simple] [🔧 Intervention Multi-appareils] │
└─────────────────────────────────────┘
```

### Formulaire Réparation Simple (✅ Existant)
- Client
- 1 Appareil
- 1 Panne
- Prix
- Pièces

### Formulaire Intervention (🔄 À faire)
```
Client: [Dropdown]

📱 Appareils à réparer
┌─────────────────────────────────────┐
│ Appareil 1                    [🗑️]  │
│ Modèle: [Input]                     │
│ IMEI: [Input]                       │
│                                      │
│ Pannes:                              │
│ ☑ Écran cassé - 8000 DA             │
│ ☑ Batterie - 3000 DA                │
│ ☐ Caméra - 5000 DA                  │
│                                      │
│ Sous-total: 11,000 DA               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Appareil 2                    [🗑️]  │
│ ...                                  │
└─────────────────────────────────────┘

[+ Ajouter un autre appareil]

Total: 13,500 DA
[Enregistrer l'intervention]
```

---

## 🔄 Flux de Données

### Création d'une intervention :

1. **Utilisateur sélectionne** "Intervention"
2. **Ajoute des appareils** dynamiquement
3. **Sélectionne des pannes** pour chaque appareil (checkboxes)
4. **Prix calculés automatiquement** :
   - Prix par panne
   - Sous-total par appareil
   - Total intervention

5. **Enregistrement** :
   ```sql
   INSERT INTO repairs (type = 'intervention')
   → repair_id
   
   INSERT INTO intervention_devices (repair_id, model, imei...)
   → device_id
   
   INSERT INTO device_faults (device_id, fault_type_id, price...)
   → fault_id
   
   INSERT INTO fault_parts (fault_id, inventory_id, quantity...)
   ```

6. **Triggers automatiques** :
   - Calcul du `total_price` de chaque appareil
   - Mise à jour du prix total de la réparation

---

## 📊 Affichage dans le tableau

### Réparation Simple :
```
📱 iPhone 13 Pro
Écran cassé
8,000 DA
```

### Intervention :
```
🔧 Intervention (3 appareils)
iPhone 13 Pro + iPhone 12 + iPad Air
5 pannes au total
13,500 DA
```

---

## 🎯 Prochaines étapes

### ✅ Fait :
- [x] Migration SQL
- [x] Tabs UI
- [x] États React

### 🔄 En cours :
- [ ] Formulaire d'intervention
- [ ] Logique d'ajout/suppression d'appareils
- [ ] Sélection multiple de pannes
- [ ] Calcul automatique des prix

### 📝 À faire :
- [ ] Affichage dans le tableau
- [ ] Modal de détails d'intervention
- [ ] Ticket d'intervention
- [ ] Tests

---

## 💡 Cas d'usage

### Exemple 1 : Client avec 3 iPhones
```
Client: Mohammed Benali

Appareil 1: iPhone 13 Pro Max
- Écran cassé: 8,000 DA
- Batterie: 3,000 DA
Sous-total: 11,000 DA

Appareil 2: iPhone 12
- Problème de charge: 2,500 DA
Sous-total: 2,500 DA

Appareil 3: iPhone 11
- Caméra arrière: 4,000 DA
Sous-total: 4,000 DA

TOTAL: 17,500 DA
```

### Exemple 2 : Un iPhone avec plusieurs pannes
```
Client: Sarah Amrani

Appareil 1: iPhone 14 Pro
- Écran cassé: 9,000 DA
- Batterie défectueuse: 3,500 DA
- Caméra arrière cassée: 6,000 DA
- Problème Wi-Fi: 2,000 DA

TOTAL: 20,500 DA
```

---

## 🚀 Avantages

1. **Flexibilité** : Gère tous les cas de figure
2. **Précision** : Prix détaillé par panne
3. **Traçabilité** : Historique complet
4. **Efficacité** : Une seule intervention pour plusieurs appareils
5. **Professionnalisme** : Devis détaillé pour le client

---

## 📌 Notes techniques

- Les réparations simples continuent de fonctionner normalement
- Migration progressive possible
- Pas de perte de données
- Calculs automatiques via triggers SQL
- RLS configuré pour la sécurité

---

**Dernière mise à jour** : 07/01/2026
**Status** : En développement - Étape B terminée

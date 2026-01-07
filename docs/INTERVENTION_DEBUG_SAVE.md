# 🔍 Debug - Intervention ne sauvegarde pas les prix et noms

## ❌ Problème rapporté

"Je viens d'ajouter une intervention mais ça ne sauvegarde ni les prix ni les noms des appareils"

---

## ✅ Corrections appliquées

### **1. Calcul du prix total** ✅

Le code a été modifié pour calculer et sauvegarder le prix total :

```tsx
// 5. Calculer le prix total
const totalPrice = interventionDevices.reduce((total, device) => {
    const deviceTotal = (device.faults || []).reduce((sum, fault) => 
        sum + (fault.price || 0), 0
    );
    return total + deviceTotal;
}, 0);

// 6. Mettre à jour la réparation avec le prix
await supabase
    .from('repairs')
    .update({ 
        price: totalPrice,
        cost_price: 0
    })
    .eq('id', repair.id);
```

---

## 🧪 Tests à effectuer

### **Test 1 : Vérifier dans Supabase**

1. Allez dans **Supabase Dashboard** → **Table Editor**
2. Ouvrez la table **`repairs`**
3. Trouvez la dernière intervention créée (type = 'intervention')
4. Vérifiez :
   - ✅ `item` contient les noms des appareils (ex: "iPhone 13 + iPhone 12")
   - ✅ `price` contient le prix total
   - ✅ `type` = 'intervention'

### **Test 2 : Vérifier les appareils**

1. Ouvrez la table **`intervention_devices`**
2. Filtrez par `repair_id` (l'ID de votre intervention)
3. Vérifiez :
   - ✅ `device_model` contient les noms (ex: "iPhone 13 Pro")
   - ✅ `imei_sn` contient les IMEI si renseignés
   - ✅ `device_order` = 1, 2, 3...

### **Test 3 : Vérifier les pannes**

1. Ouvrez la table **`device_faults`**
2. Filtrez par `device_id` (l'ID d'un appareil)
3. Vérifiez :
   - ✅ `fault_type_id` contient l'ID de la panne
   - ✅ `price` contient le prix de chaque panne
   - ✅ `status` = 'pending'

---

## 🔍 Vérification manuelle dans la console

Ajoutez temporairement ces `console.log` dans le code (ligne ~260) :

```tsx
// Juste avant l'insertion des appareils
console.log('📱 Appareils à sauvegarder:', interventionDevices);

// Après l'insertion d'un appareil
console.log('✅ Appareil sauvegardé:', deviceData);

// Après l'insertion des pannes
console.log('✅ Pannes sauvegardées:', faultsToInsert);

// Après le calcul du prix
console.log('💰 Prix total calculé:', totalPrice);
```

Puis :
1. Ouvrez la console du navigateur (F12)
2. Créez une intervention
3. Vérifiez les logs

---

## 📊 Structure attendue des données

### **interventionDevices (avant sauvegarde)** :
```javascript
[
  {
    id: 1,
    model: "iPhone 13 Pro",
    imei: "123456789",
    faults: [
      { id: "fault-uuid-1", name: "Écran cassé", price: 8000 },
      { id: "fault-uuid-2", name: "Batterie", price: 3000 }
    ],
    notes: ""
  },
  {
    id: 2,
    model: "iPhone 12",
    imei: "987654321",
    faults: [
      { id: "fault-uuid-3", name: "Charge", price: 2500 }
    ],
    notes: ""
  }
]
```

### **Base de données (après sauvegarde)** :

**Table `repairs`** :
```
id: uuid-repair
type: 'intervention'
item: 'iPhone 13 Pro + iPhone 12'
description: 'Intervention sur 2 appareil(s)'
price: 13500
status: 'nouveau'
```

**Table `intervention_devices`** :
```
id: uuid-device-1
repair_id: uuid-repair
device_model: 'iPhone 13 Pro'
imei_sn: '123456789'
device_order: 1
```

**Table `device_faults`** :
```
id: uuid-fault-1
device_id: uuid-device-1
fault_type_id: fault-uuid-1
price: 8000
status: 'pending'
```

---

## ⚠️ Points de vérification

### **Si les noms d'appareils ne s'affichent pas** :

**Cause possible** : Le champ `device.model` est vide

**Solution** : Vérifiez que vous remplissez bien le champ "Modèle" pour chaque appareil

### **Si les prix ne s'affichent pas** :

**Cause possible** : Le champ `fault.price` est à 0

**Solution** : Vérifiez que vous entrez bien un prix pour chaque panne cochée

### **Si rien ne se sauvegarde** :

**Cause possible** : Erreur SQL ou RLS

**Solution** : 
1. Vérifiez la console du navigateur
2. Vérifiez que la migration SQL a été exécutée
3. Vérifiez les politiques RLS dans Supabase

---

## 🚀 Prochaine étape

**Testez maintenant** :

1. Créez une nouvelle intervention
2. Ajoutez 2 appareils avec des modèles
3. Cochez des pannes et entrez des prix
4. Enregistrez
5. Vérifiez dans Supabase que tout est bien sauvegardé

**Dites-moi** :
- ✅ Les données sont dans Supabase mais ne s'affichent pas ?
- ❌ Les données ne sont pas dans Supabase ?
- ⚠️ Vous avez un message d'erreur ?

---

**Date** : 07/01/2026 13:02  
**Status** : Code corrigé, en attente de tests

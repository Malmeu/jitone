# ✅ Corrections appliquées - Sauvegarde des interventions

## 🔧 Problèmes corrigés

### **1. Prix total non sauvegardé** ✅
**Ajouté** : Calcul automatique du prix total et mise à jour de la table `repairs`

### **2. Logs de débogage** ✅
**Ajouté** : Console.log pour tracer la sauvegarde

---

## 🧪 Comment tester maintenant

### **Étape 1 : Ouvrir la console**
1. Appuyez sur **F12** (ou Cmd+Option+I sur Mac)
2. Allez dans l'onglet **Console**

### **Étape 2 : Créer une intervention**
1. Allez sur la page Réparations
2. Cliquez sur l'onglet **"🔧 Intervention"**
3. Cliquez sur **"Nouvelle Intervention"**
4. Remplissez :
   - Client
   - **Appareil 1** :
     - Modèle : `iPhone 13 Pro`
     - IMEI : `123456789`
     - Cochez 2 pannes et entrez des prix (ex: 8000 et 3000)
   - Cliquez sur **"+ Ajouter un autre appareil"**
   - **Appareil 2** :
     - Modèle : `iPhone 12`
     - Cochez 1 panne avec un prix (ex: 2500)
5. Cliquez sur **"Enregistrer l'intervention"**

### **Étape 3 : Vérifier les logs**

Vous devriez voir dans la console :

```
📱 Début sauvegarde intervention
Appareils: [
  {
    id: 1,
    model: "iPhone 13 Pro",
    imei: "123456789",
    faults: [
      { id: "...", name: "Écran cassé", price: 8000 },
      { id: "...", name: "Batterie", price: 3000 }
    ]
  },
  {
    id: 2,
    model: "iPhone 12",
    imei: "",
    faults: [
      { id: "...", name: "Charge", price: 2500 }
    ]
  }
]
✅ Appareil sauvegardé: { id: "...", device_model: "iPhone 13 Pro", ... }
✅ Appareil sauvegardé: { id: "...", device_model: "iPhone 12", ... }
💰 Prix total calculé: 13500
✅ Intervention créée avec succès !
```

---

## 🔍 Vérifier dans Supabase

### **Table `repairs`** :
1. Allez dans **Supabase Dashboard** → **Table Editor** → **repairs**
2. Trouvez la dernière ligne (triez par `created_at` DESC)
3. Vérifiez :
   - ✅ `type` = `'intervention'`
   - ✅ `item` = `'iPhone 13 Pro + iPhone 12'`
   - ✅ `description` = `'Intervention sur 2 appareil(s)'`
   - ✅ `price` = `13500`
   - ✅ `status` = `'nouveau'`

### **Table `intervention_devices`** :
1. Allez dans **intervention_devices**
2. Filtrez par `repair_id` (copiez l'ID de la réparation ci-dessus)
3. Vous devriez voir **2 lignes** :
   - Ligne 1 : `device_model` = `'iPhone 13 Pro'`, `imei_sn` = `'123456789'`, `device_order` = `1`
   - Ligne 2 : `device_model` = `'iPhone 12'`, `device_order` = `2`

### **Table `device_faults`** :
1. Allez dans **device_faults**
2. Filtrez par `device_id` (copiez l'ID du premier appareil)
3. Vous devriez voir **2 lignes** (les 2 pannes de l'iPhone 13 Pro)
4. Vérifiez que `price` contient bien 8000 et 3000

---

## ❓ Si ça ne fonctionne toujours pas

### **Scénario A : Les logs montrent les bonnes données mais rien dans Supabase**
→ **Problème RLS** : Les politiques de sécurité bloquent l'insertion
→ **Solution** : Vérifiez les RLS dans Supabase

### **Scénario B : Les logs montrent `faults: []` (vide)**
→ **Problème UI** : Les pannes ne sont pas correctement ajoutées à l'état
→ **Solution** : Vérifiez que vous cochez bien les pannes ET entrez les prix

### **Scénario C : Les logs montrent `model: ""` (vide)**
→ **Problème UI** : Le modèle n'est pas saisi
→ **Solution** : Vérifiez que vous remplissez bien le champ "Modèle"

### **Scénario D : Erreur dans la console**
→ **Copiez l'erreur complète** et envoyez-la moi

---

## 📸 Capture d'écran demandée

Si ça ne fonctionne toujours pas, envoyez-moi :

1. **Screenshot de la console** (avec les logs)
2. **Screenshot du formulaire** (avant de cliquer sur Enregistrer)
3. **Screenshot de Supabase** (table repairs)

---

## ✅ Checklist

- [x] Code modifié pour calculer le prix total
- [x] Code modifié pour mettre à jour la table repairs
- [x] Logs de débogage ajoutés
- [ ] Test effectué
- [ ] Vérification dans Supabase
- [ ] Confirmation que ça fonctionne

---

**Date** : 07/01/2026 13:05  
**Status** : Prêt pour les tests avec logs de débogage

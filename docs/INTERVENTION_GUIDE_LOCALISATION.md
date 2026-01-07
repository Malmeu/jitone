# 📍 Guide de Localisation - Modifications Intervention

## 🎯 Objectif
Ce guide vous aide à localiser précisément où faire les 3 modifications dans `app/dashboard/repairs/page.tsx`

---

## 🔍 Modification 1 : Wrapper le formulaire simple

### **Comment trouver** :
1. Ouvrez `app/dashboard/repairs/page.tsx`
2. Cherchez (Ctrl+F) : `<form onSubmit={handleSubmit}`
3. Vous devriez trouver cette ligne vers **ligne 881** :

```tsx
<form onSubmit={handleSubmit} className="p-8 md:p-10 overflow-y-auto flex-1 custom-scrollbar">
```

### **Modification** :
**AVANT** :
```tsx
                            <form onSubmit={handleSubmit} className="p-8 md:p-10 overflow-y-auto flex-1 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
```

**APRÈS** :
```tsx
                            {/* Formulaire Réparation Simple */}
                            {repairType === 'simple' && (
                                <form onSubmit={handleSubmit} className="p-8 md:p-10 overflow-y-auto flex-1 custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
```

---

## 🔍 Modification 2 : Fermer la condition et ajouter le formulaire intervention

### **Comment trouver** :
1. Cherchez (Ctrl+F) : `</form>`
2. Trouvez la **dernière occurrence** dans le modal (vers **ligne 1176**)
3. Vous devriez voir :

```tsx
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
```

### **Modification** :
**REMPLACER** tout ce bloc par le code complet du fichier `INTERVENTION_FORM_CODE.md` (section 2)

---

## 🔍 Modification 3 : Modifier handleSubmit

### **Comment trouver** :
1. Cherchez (Ctrl+F) : `const handleSubmit = async`
2. Vous devriez trouver vers **ligne 215** :

```tsx
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishmentId) return;
```

### **Modification** :
**AJOUTER** le code de gestion des interventions juste après `if (!establishmentId) return;`

Voir le code complet dans `INTERVENTION_FORM_CODE.md` (section 3)

---

## ✅ Checklist de vérification

Après les modifications, vérifiez que :

- [ ] Le formulaire simple fonctionne toujours
- [ ] Les tabs changent bien le formulaire affiché
- [ ] Le bouton "Ajouter un appareil" fonctionne
- [ ] Les checkboxes de pannes fonctionnent
- [ ] Le calcul du total est correct
- [ ] La sauvegarde fonctionne

---

## 🆘 En cas de problème

### Erreur : "repairType is not defined"
→ Vérifiez que vous avez bien ajouté les états (lignes 42-44)

### Erreur : "interventionDevices is not defined"
→ Vérifiez que vous avez bien ajouté les états (lignes 42-44)

### Erreur : "addDevice is not defined"
→ Vérifiez que vous avez bien ajouté les fonctions helper (lignes 148-210)

### Le formulaire ne s'affiche pas
→ Vérifiez que vous avez bien fermé la condition `{repairType === 'simple' && (` avec `)}` avant le formulaire intervention

---

## 📊 Structure finale attendue

```
Modal
├── Header (titre adaptatif)
├── {repairType === 'simple' && (
│   └── Formulaire Simple (existant)
│   )}
└── {repairType === 'intervention' && (
    └── Formulaire Intervention (nouveau)
    )}
```

---

**Bon courage ! 🚀**

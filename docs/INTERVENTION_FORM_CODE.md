# 🔧 Code du Formulaire d'Intervention

## 📍 Instructions

Ce document contient le code complet à ajouter pour le formulaire d'intervention.

---

## 1️⃣ Wrapper le formulaire actuel (Ligne ~881)

**TROUVER** cette ligne dans `app/dashboard/repairs/page.tsx` :
```tsx
<form onSubmit={handleSubmit} className="p-8 md:p-10 overflow-y-auto flex-1 custom-scrollbar">
```

**REMPLACER PAR** :
```tsx
{/* Formulaire Réparation Simple */}
{repairType === 'simple' && (
    <form onSubmit={handleSubmit} className="p-8 md:p-10 overflow-y-auto flex-1 custom-scrollbar">
```

---

## 2️⃣ Fermer la condition (Ligne ~1176, juste AVANT `</motion.div>` qui ferme le modal)

**TROUVER** la fin du formulaire (juste avant la fermeture du modal) :
```tsx
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
```

**REMPLACER PAR** :
```tsx
                            </form>
                        )}

                        {/* Formulaire Intervention */}
                        {repairType === 'intervention' && (
                            <form onSubmit={handleSubmit} className="p-8 md:p-10 overflow-y-auto flex-1 custom-scrollbar">
                                {/* Section Client */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 text-primary mb-4">
                                        <User size={18} />
                                        <label className="text-sm font-black uppercase tracking-widest">Client</label>
                                    </div>
                                    <select
                                        value={formData.clientId}
                                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-neutral-50/50 dark:bg-neutral-900/50 font-medium text-foreground"
                                        required
                                    >
                                        <option value="">+ Nouveau client</option>
                                        {clients.map((client: any) => (
                                            <option key={client.id} value={client.id}>
                                                {client.name} - {client.phone}
                                            </option>
                                        ))}
                                    </select>

                                    {formData.clientId === '' && (
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <input
                                                type="text"
                                                placeholder="Nom du client *"
                                                value={formData.clientName}
                                                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                                className="px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-medium text-foreground"
                                                required
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Téléphone *"
                                                value={formData.clientPhone}
                                                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                                                className="px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-medium text-foreground"
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Section Appareils */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-primary">
                                            <Smartphone size={18} />
                                            <label className="text-sm font-black uppercase tracking-widest">Appareils à réparer</label>
                                        </div>
                                        <span className="text-xs text-neutral-400 font-medium">
                                            {interventionDevices.length} appareil{interventionDevices.length > 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {interventionDevices.map((device, index) => (
                                            <div key={device.id} className="bg-neutral-50 dark:bg-neutral-900/30 rounded-3xl p-6 border border-neutral-100 dark:border-neutral-800">
                                                {/* Header de l'appareil */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-bold text-foreground">
                                                        Appareil {index + 1}
                                                    </h3>
                                                    {interventionDevices.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeDevice(device.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Modèle et IMEI */}
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">
                                                            Modèle *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="ex: iPhone 13 Pro Max"
                                                            value={device.model}
                                                            onChange={(e) => updateDevice(device.id, 'model', e.target.value)}
                                                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-neutral-800 font-medium text-foreground"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">
                                                            IMEI / SN
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="Numéro de série"
                                                            value={device.imei}
                                                            onChange={(e) => updateDevice(device.id, 'imei', e.target.value)}
                                                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-neutral-800 font-medium text-foreground"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Pannes */}
                                                <div>
                                                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 block">
                                                        Pannes à réparer
                                                    </label>
                                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                                        {faultTypes.map((fault) => {
                                                            const isSelected = device.faults?.some((f: any) => f.id === fault.id);
                                                            const selectedFault = device.faults?.find((f: any) => f.id === fault.id);

                                                            return (
                                                                <div
                                                                    key={fault.id}
                                                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                                                        isSelected
                                                                            ? 'bg-primary/5 border-primary/30'
                                                                            : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-primary/20'
                                                                    }`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={() => toggleFault(device.id, fault.id)}
                                                                        className="w-5 h-5 rounded border-neutral-300 text-primary focus:ring-primary/20"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className="font-bold text-sm text-foreground">
                                                                            {fault.name}
                                                                        </div>
                                                                        {fault.description && (
                                                                            <div className="text-xs text-neutral-400 mt-0.5">
                                                                                {fault.description}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {isSelected && (
                                                                        <input
                                                                            type="number"
                                                                            placeholder="Prix"
                                                                            value={selectedFault?.price || ''}
                                                                            onChange={(e) => updateFaultPrice(device.id, fault.id, parseFloat(e.target.value) || 0)}
                                                                            className="w-28 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-neutral-800 font-bold text-sm text-foreground"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Sous-total de l'appareil */}
                                                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-neutral-500">
                                                            Sous-total appareil {index + 1}
                                                        </span>
                                                        <span className="text-lg font-black text-emerald-600">
                                                            {(device.faults || []).reduce((sum: number, f: any) => sum + (f.price || 0), 0).toLocaleString()} DA
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Bouton Ajouter appareil */}
                                    <button
                                        type="button"
                                        onClick={addDevice}
                                        className="w-full mt-4 py-4 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl text-neutral-400 hover:text-primary hover:border-primary/50 transition-all font-bold flex items-center justify-center gap-2"
                                    >
                                        <Plus size={20} />
                                        Ajouter un autre appareil
                                    </button>
                                </div>

                                {/* Total général */}
                                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-6 mb-8">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                                            Total intervention
                                        </span>
                                        <span className="text-xs text-neutral-400">
                                            {interventionDevices.reduce((total, d) => total + (d.faults?.length || 0), 0)} panne{interventionDevices.reduce((total, d) => total + (d.faults?.length || 0), 0) > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="text-3xl font-black text-primary">
                                        {calculateInterventionTotal().toLocaleString()} DA
                                    </div>
                                </div>

                                {/* Boutons */}
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 h-14 rounded-2xl text-neutral-400 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="h-14 flex-[2] rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black font-black hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-xl active:scale-[0.98] transition-all"
                                    >
                                        {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Enregistrer l'intervention"}
                                    </Button>
                                </div>
                            </form>
                        )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
```

---

## 3️⃣ Modifier le handleSubmit (Ligne ~215)

**TROUVER** cette ligne dans `handleSubmit` :
```tsx
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishmentId) return;
```

**AJOUTER JUSTE APRÈS** :
```tsx
    // Gérer les interventions multi-appareils
    if (repairType === 'intervention') {
        try {
            // 1. Créer ou récupérer le client
            let clientId = formData.clientId;
            if (!clientId) {
                const { data: newClient, error: clientError } = await supabase
                    .from('clients')
                    .insert([{
                        establishment_id: establishmentId,
                        name: formData.clientName,
                        phone: formData.clientPhone,
                    }])
                    .select()
                    .single();

                if (clientError) throw clientError;
                clientId = newClient.id;
            }

            // 2. Créer la réparation principale
            const { data: repair, error: repairError } = await supabase
                .from('repairs')
                .insert([{
                    establishment_id: establishmentId,
                    client_id: clientId,
                    code: generateCode(),
                    type: 'intervention',
                    status: 'nouveau',
                    payment_status: 'unpaid',
                    assigned_to: userProfile?.role === 'technician' ? userProfile.id : null,
                }])
                .select()
                .single();

            if (repairError) throw repairError;

            // 3. Créer les appareils et leurs pannes
            for (const device of interventionDevices) {
                if (!device.model || !device.faults || device.faults.length === 0) continue;

                const { data: deviceData, error: deviceError } = await supabase
                    .from('intervention_devices')
                    .insert([{
                        repair_id: repair.id,
                        device_model: device.model,
                        imei_sn: device.imei || null,
                        notes: device.notes || null,
                        device_order: interventionDevices.indexOf(device) + 1,
                    }])
                    .select()
                    .single();

                if (deviceError) throw deviceError;

                // 4. Créer les pannes pour cet appareil
                const faultsToInsert = device.faults.map((fault: any) => ({
                    device_id: deviceData.id,
                    fault_type_id: fault.id,
                    price: fault.price || 0,
                    status: 'pending',
                }));

                const { error: faultsError } = await supabase
                    .from('device_faults')
                    .insert(faultsToInsert);

                if (faultsError) throw faultsError;
            }

            alert('✅ Intervention créée avec succès !');
            setShowModal(false);
            setInterventionDevices([{ id: 1, model: '', imei: '', faults: [], notes: '' }]);
            fetchData();
        } catch (error: any) {
            console.error('Erreur:', error);
            alert('❌ Erreur: ' + error.message);
        } finally {
            setSubmitting(false);
        }
        return;
    }

    // Code existant pour les réparations simples continue ici...
```

---

## ✅ Résumé des modifications

1. **Wrapper le formulaire simple** dans une condition `{repairType === 'simple' && (...)}`
2. **Ajouter le formulaire d'intervention** juste après
3. **Modifier handleSubmit** pour gérer les deux types

---

## 🎯 Résultat attendu

Après ces modifications, vous aurez :
- ✅ Tabs fonctionnels
- ✅ Formulaire simple (inchangé)
- ✅ Formulaire intervention (nouveau)
  - Ajout dynamique d'appareils
  - Sélection multiple de pannes
  - Calcul automatique des prix
  - Sauvegarde en base de données

---

**Dernière mise à jour** : 07/01/2026 12:04

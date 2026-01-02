'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Send, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface QuoteItem {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export default function NewQuotePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [establishmentId, setEstablishmentId] = useState<string>('');

    // Données du devis
    const [formData, setFormData] = useState({
        client_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tax_rate: 0,
        discount_amount: 0,
        notes: '',
        terms_conditions: 'Devis valable 30 jours.\nPaiement à la commande.\nTravaux garantis 6 mois.',
    });

    // Lignes du devis
    const [items, setItems] = useState<QuoteItem[]>([
        { id: '1', description: '', quantity: 1, unit_price: 0, total: 0 }
    ]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('establishment_id')
                .eq('user_id', user.id)
                .single();

            if (profile) {
                setEstablishmentId(profile.establishment_id);
                const currentEstId = profile.establishment_id;

                // Récupérer les clients
                const { data: clientsData } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('establishment_id', currentEstId)
                    .order('name');

                setClients(clientsData || []);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const addItem = () => {
        setItems([...items, {
            id: Date.now().toString(),
            description: '',
            quantity: 1,
            unit_price: 0,
            total: 0
        }]);
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'quantity' || field === 'unit_price') {
                    updated.total = updated.quantity * updated.unit_price;
                }
                return updated;
            }
            return item;
        }));
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const tax_amount = subtotal * (formData.tax_rate / 100);
        const total = subtotal + tax_amount - formData.discount_amount;
        return { subtotal, tax_amount, total };
    };

    const handleSubmit = async (status: 'draft' | 'sent') => {
        if (!formData.client_id) {
            alert('Veuillez sélectionner un client');
            return;
        }

        if (items.some(item => !item.description)) {
            alert('Veuillez remplir toutes les descriptions');
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { subtotal } = calculateTotals();

            // Générer le numéro de devis
            const { data: quoteNumber } = await supabase
                .rpc('generate_quote_number');

            // Créer le devis
            const { data: quote, error: quoteError } = await supabase
                .from('quotes')
                .insert({
                    quote_number: quoteNumber,
                    establishment_id: establishmentId,
                    client_id: formData.client_id,
                    issue_date: formData.issue_date,
                    valid_until: formData.valid_until,
                    status: status,
                    subtotal: subtotal,
                    tax_rate: formData.tax_rate,
                    discount_amount: formData.discount_amount,
                    notes: formData.notes,
                    terms_conditions: formData.terms_conditions,
                    created_by: user.id,
                })
                .select()
                .single();

            if (quoteError) throw quoteError;

            // Créer les lignes du devis
            const quoteItems = items.map((item, index) => ({
                quote_id: quote.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                position: index,
            }));

            const { error: itemsError } = await supabase
                .from('quote_items')
                .insert(quoteItems);

            if (itemsError) throw itemsError;

            alert(`Devis ${quote.quote_number} créé avec succès !`);
            router.push('/dashboard/quotes');

        } catch (error) {
            console.error('Error:', error);
            alert('Erreur lors de la création du devis');
        } finally {
            setLoading(false);
        }
    };

    const { subtotal, tax_amount, total } = calculateTotals();

    return (
        <div className="max-w-[1600px] mx-auto pb-24 px-4 md:px-8 font-inter">
            {/* Header */}
            <div className="mb-12">
                <Link
                    href="/dashboard/quotes"
                    className="inline-flex items-center gap-2 text-neutral-500 hover:text-foreground mb-6 transition-colors font-bold uppercase text-[10px] tracking-widest"
                >
                    <ArrowLeft size={14} />
                    Retour aux devis
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Nouveau Document</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-2">Éditer un Devis</h1>
                        <p className="text-lg text-neutral-500 font-medium">Structurez vos offres commerciales avec précision et élégance.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Formulaire principal */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Informations générales */}
                    <div className="bg-card rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-soft p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl flex items-center justify-center text-neutral-400">
                                <FileText size={18} />
                            </div>
                            <h2 className="text-xl font-bold text-foreground tracking-tight">Configuration Document</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2 px-1">
                                    Client Distinataire
                                </label>
                                <select
                                    value={formData.client_id}
                                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                    className="w-full px-5 py-4 bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-foreground"
                                    required
                                >
                                    <option value="">Sélectionner un client</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id} className="bg-white dark:bg-neutral-900">
                                            {client.name} ({client.phone})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2 px-1">
                                    Date d'émission
                                </label>
                                <input
                                    type="date"
                                    value={formData.issue_date}
                                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                                    className="w-full px-5 py-4 bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-foreground"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2 px-1">
                                    Échéance Validité
                                </label>
                                <input
                                    type="date"
                                    value={formData.valid_until}
                                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                    className="w-full px-5 py-4 bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-foreground"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2 px-1">
                                    Taux de Taxe (%)
                                </label>
                                <input
                                    type="number"
                                    value={formData.tax_rate}
                                    onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-5 py-4 bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-foreground"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Lignes du devis */}
                    <div className="bg-card rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-soft p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-foreground tracking-tight">Postes & Prestations</h2>
                            <button
                                onClick={addItem}
                                className="flex items-center gap-2 text-primary hover:text-primary/80 font-black text-[10px] uppercase tracking-widest"
                            >
                                <Plus size={16} />
                                Nouveau Poste
                            </button>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={item.id} className="group relative bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-800 rounded-[2rem] p-6 transition-all hover:bg-white dark:hover:bg-neutral-900/50 hover:shadow-soft">
                                    <div className="flex items-start gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="grid grid-cols-12 gap-4">
                                                <div className="col-span-12 md:col-span-7">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1.5 px-1">
                                                        Description du service
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                        placeholder="Ex: Main d'oeuvre spécialisée"
                                                        className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-foreground"
                                                    />
                                                </div>

                                                <div className="col-span-12 md:col-span-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1.5 px-1">
                                                        Qté
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-foreground text-center"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>

                                                <div className="col-span-12 md:col-span-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1.5 px-1 text-right">
                                                        Unit. (DA)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-foreground text-right"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Total ligne</span>
                                                <span className="font-black text-foreground">
                                                    {item.total.toLocaleString('fr-DZ')} <span className="text-[10px] text-neutral-400">DA</span>
                                                </span>
                                            </div>
                                        </div>

                                        {items.length > 1 && (
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all self-start mt-6 group-hover:scale-110"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes et conditions */}
                    <div className="bg-card rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-soft p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl flex items-center justify-center text-neutral-400">
                                <Plus size={18} />
                            </div>
                            <h2 className="text-xl font-bold text-foreground tracking-tight">Mentions Obligatoires & Notes</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2 px-1">
                                    Notes Internes (privé)
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={4}
                                    placeholder="Précisions techniques, contexte..."
                                    className="w-full px-5 py-4 bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium text-foreground resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2 px-1">
                                    Conditions de Vente (public)
                                </label>
                                <textarea
                                    value={formData.terms_conditions}
                                    onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                                    rows={4}
                                    placeholder="Validité, Garanties, Paiement..."
                                    className="w-full px-5 py-4 bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium text-foreground resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Résumé */}
                <div className="lg:col-span-4">
                    <div className="bg-neutral-900 dark:bg-white rounded-[2.5rem] shadow-heavy p-8 text-white dark:text-black sticky top-8">
                        <h2 className="text-xl font-bold mb-8 tracking-tight">Résumé de l'offre</h2>

                        <div className="space-y-5 mb-8">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Total Hors Taxes</span>
                                <span className="font-bold">
                                    {subtotal.toLocaleString('fr-DZ')} DA
                                </span>
                            </div>

                            {formData.tax_rate > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Taxe collectée ({formData.tax_rate}%)</span>
                                    <span className="font-bold">
                                        {tax_amount.toLocaleString('fr-DZ')} DA
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Geste Commercial</span>
                                <div className="w-32">
                                    <input
                                        type="number"
                                        value={formData.discount_amount}
                                        onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-white/10 dark:bg-neutral-100 border-none rounded-lg px-2 py-1 text-right font-bold text-rose-400 dark:text-rose-600 focus:ring-2 focus:ring-rose-500/50"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-neutral-800 dark:border-neutral-100 mt-6">
                                <div className="flex justify-between items-end">
                                    <span className="font-black uppercase tracking-widest text-[11px] mb-1">Montant TTC</span>
                                    <div className="text-right">
                                        <p className="text-4xl font-black text-blue-400 dark:text-blue-600 tracking-tighter leading-none">
                                            {total.toLocaleString('fr-DZ')}
                                        </p>
                                        <span className="text-[10px] font-black uppercase text-neutral-500 mt-2 block tracking-widest">Dinars Algériens</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => handleSubmit('draft')}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 h-14 bg-white/10 dark:bg-neutral-100 text-white dark:text-black hover:bg-white/20 dark:hover:bg-neutral-200 transition-all rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50"
                            >
                                <Save size={18} />
                                {loading ? 'Traitement...' : 'Enregistrer Brouillon'}
                            </button>

                            <button
                                onClick={() => handleSubmit('sent')}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 h-14 bg-blue-500 hover:bg-blue-600 text-white transition-all rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50 shadow-xl shadow-blue-500/20"
                            >
                                <Send size={18} />
                                {loading ? 'Envoi...' : 'Enregistrer & Finaliser'}
                            </button>
                        </div>

                        <div className="mt-8 p-4 bg-white/5 dark:bg-neutral-50 rounded-2xl border border-white/5 dark:border-neutral-100">
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold tracking-tight leading-relaxed text-center">
                                Le numéro de référence unique sera alloué automatiquement lors de la finalisation du document.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

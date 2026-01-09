'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface QuoteItem {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export default function EditQuotePage() {
    const router = useRouter();
    const params = useParams();
    const quoteId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [establishmentId, setEstablishmentId] = useState<string>('');

    const [formData, setFormData] = useState({
        client_id: '',
        issue_date: '',
        valid_until: '',
        tax_rate: '' as any,
        discount_amount: '' as any,
        notes: '',
        terms_conditions: '',
        status: 'draft',
    });

    const [items, setItems] = useState<QuoteItem[]>([]);

    useEffect(() => {
        if (quoteId) {
            fetchData();
        }
    }, [quoteId]);

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

                // Récupérer le devis
                const { data: quote, error } = await supabase
                    .from('quotes')
                    .select(`
                        *,
                        quote_items(*)
                    `)
                    .eq('id', quoteId)
                    .single();

                if (error) throw error;

                setFormData({
                    client_id: quote.client_id,
                    issue_date: quote.issue_date,
                    valid_until: quote.valid_until,
                    tax_rate: quote.tax_rate,
                    discount_amount: quote.discount_amount,
                    notes: quote.notes || '',
                    terms_conditions: quote.terms_conditions || '',
                    status: quote.status,
                });

                setItems(quote.quote_items.map((item: any) => ({
                    id: item.id,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    total: item.quantity * item.unit_price,
                })));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erreur lors du chargement du devis');
        } finally {
            setLoading(false);
        }
    };

    const addItem = () => {
        setItems([...items, {
            id: 'new-' + Date.now().toString(),
            description: '',
            quantity: '' as any,
            unit_price: '' as any,
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
                    const q = field === 'quantity' ? (parseFloat(value) || 0) : (parseFloat(item.quantity.toString()) || 0);
                    const p = field === 'unit_price' ? (parseFloat(value) || 0) : (parseFloat(item.unit_price.toString()) || 0);
                    updated.total = q * p;
                }
                return updated;
            }
            return item;
        }));
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.total.toString()) || 0), 0);
        const taxRate = parseFloat(formData.tax_rate?.toString() || '0') || 0;
        const discountAmount = parseFloat(formData.discount_amount?.toString() || '0') || 0;
        const tax_amount = subtotal * (taxRate / 100);
        const total = subtotal + tax_amount - discountAmount;
        return { subtotal, tax_amount, total };
    };

    const handleSubmit = async () => {
        if (!formData.client_id) {
            alert('Veuillez sélectionner un client');
            return;
        }

        if (items.some(item => !item.description)) {
            alert('Veuillez remplir toutes les descriptions');
            return;
        }

        setSaving(true);

        try {
            const { subtotal } = calculateTotals();

            // Mettre à jour le devis
            const { error: quoteError } = await supabase
                .from('quotes')
                .update({
                    client_id: formData.client_id,
                    issue_date: formData.issue_date,
                    valid_until: formData.valid_until,
                    subtotal: subtotal,
                    tax_rate: parseFloat(formData.tax_rate?.toString() || '0'),
                    discount_amount: parseFloat(formData.discount_amount?.toString() || '0'),
                    notes: formData.notes,
                    terms_conditions: formData.terms_conditions,
                })
                .eq('id', quoteId);

            if (quoteError) throw quoteError;

            // Supprimer les anciennes lignes
            const { error: deleteError } = await supabase
                .from('quote_items')
                .delete()
                .eq('quote_id', quoteId);

            if (deleteError) throw deleteError;

            // Créer les nouvelles lignes
            const quoteItems = items.map((item, index) => ({
                quote_id: quoteId,
                description: item.description,
                quantity: parseFloat(item.quantity?.toString() || '0'),
                unit_price: parseFloat(item.unit_price?.toString() || '0'),
                position: index,
            }));

            const { error: itemsError } = await supabase
                .from('quote_items')
                .insert(quoteItems);

            if (itemsError) throw itemsError;

            alert('Devis mis à jour avec succès !');
            router.push(`/dashboard/quotes/${quoteId}`);

        } catch (error) {
            console.error('Error:', error);
            alert('Erreur lors de la mise à jour du devis');
        } finally {
            setSaving(false);
        }
    };

    const { subtotal, tax_amount, total } = calculateTotals();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest animate-pulse">Chargement du document...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto pb-24 px-4 md:px-8 font-inter">
            {/* Header */}
            <div className="mb-12">
                <Link
                    href={`/dashboard/quotes/${quoteId}`}
                    className="inline-flex items-center gap-2 text-neutral-500 hover:text-foreground mb-6 transition-colors font-bold uppercase text-[10px] tracking-widest"
                >
                    <ArrowLeft size={14} />
                    Retour au devis
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">Mode Édition</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-2">Révision du Devis</h1>
                        <p className="text-lg text-neutral-500 font-medium">Ajustez les détails de votre proposition commerciale.</p>
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
                                    onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                                    className="w-full px-5 py-4 bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-foreground"
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
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
                            {items.map((item) => (
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
                                                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-foreground text-center"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0"
                                                    />
                                                </div>

                                                <div className="col-span-12 md:col-span-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1.5 px-1 text-right">
                                                        Unit. (DA)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateItem(item.id, 'unit_price', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-foreground text-right"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0"
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
                        <h2 className="text-xl font-bold mb-8 tracking-tight">Résumé financier</h2>

                        <div className="space-y-5 mb-8">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Total HT révisé</span>
                                <span className="font-bold">
                                    {subtotal.toLocaleString('fr-DZ')} DA
                                </span>
                            </div>

                            {formData.tax_rate > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Taxe de vente ({formData.tax_rate}%)</span>
                                    <span className="font-bold">
                                        {tax_amount.toLocaleString('fr-DZ')} DA
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Ajustement Remise</span>
                                <div className="w-32">
                                    <input
                                        type="number"
                                        value={formData.discount_amount}
                                        onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                                        className="w-full bg-white/10 dark:bg-neutral-100 border-none rounded-lg px-2 py-1 text-right font-bold text-rose-400 dark:text-rose-600 focus:ring-2 focus:ring-rose-500/50"
                                        min="0"
                                        step="0.01"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-neutral-800 dark:border-neutral-100 mt-6">
                                <div className="flex justify-between items-end">
                                    <span className="font-black uppercase tracking-widest text-[11px] mb-1">Total Final TTC</span>
                                    <div className="text-right">
                                        <p className="text-4xl font-black text-blue-400 dark:text-blue-600 tracking-tighter leading-none">
                                            {total.toLocaleString('fr-DZ')}
                                        </p>
                                        <span className="text-[10px] font-black uppercase text-neutral-500 mt-2 block tracking-widest">Dinars Algériens</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-3 h-16 bg-blue-500 hover:bg-blue-600 text-white transition-all rounded-2xl font-black text-sm uppercase tracking-widest disabled:opacity-50 shadow-xl shadow-blue-500/20"
                        >
                            <Save size={20} />
                            {saving ? 'Synchronisation...' : 'Enregistrer Modifications'}
                        </button>

                        <div className="mt-8 p-6 bg-white/5 dark:bg-neutral-50 rounded-3xl border border-white/5 dark:border-neutral-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Système de Verrouillage</span>
                            </div>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold tracking-tight leading-relaxed">
                                Toute modification sera enregistrée immédiatement dans l'historique du document et sera visible sur la version PDF exportée.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
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
        tax_rate: 0,
        discount_amount: 0,
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

            const { data: establishment } = await supabase
                .from('establishments')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (establishment) {
                setEstablishmentId(establishment.id);

                // Récupérer les clients
                const { data: clientsData } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('establishment_id', establishment.id)
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
                    tax_rate: formData.tax_rate,
                    discount_amount: formData.discount_amount,
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
                quantity: item.quantity,
                unit_price: item.unit_price,
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
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href={`/dashboard/quotes/${quoteId}`}
                    className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
                >
                    <ArrowLeft size={20} />
                    Retour au devis
                </Link>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Modifier le Devis</h1>
                <p className="text-neutral-500">Modifiez les informations du devis</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulaire principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Informations générales */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-neutral-900 mb-4">Informations</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Client *
                                </label>
                                <select
                                    value={formData.client_id}
                                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    required
                                >
                                    <option value="">Sélectionner un client</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} - {client.phone}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Date d'émission
                                </label>
                                <input
                                    type="date"
                                    value={formData.issue_date}
                                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Valide jusqu'au
                                </label>
                                <input
                                    type="date"
                                    value={formData.valid_until}
                                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    TVA (%)
                                </label>
                                <input
                                    type="number"
                                    value={formData.tax_rate}
                                    onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Lignes du devis */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-neutral-900">Articles / Services</h2>
                            <button
                                onClick={addItem}
                                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm"
                            >
                                <Plus size={18} />
                                Ajouter une ligne
                            </button>
                        </div>

                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                    Description *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                    placeholder="Ex: Réparation écran iPhone 13"
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                                />
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                        Quantité
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                        Prix unitaire (DA)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                        Total (DA)
                                                    </label>
                                                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-neutral-900">
                                                        {item.total.toLocaleString('fr-FR')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {items.length > 1 && (
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes et conditions */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-neutral-900 mb-4">Notes et Conditions</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Notes internes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    placeholder="Notes visibles uniquement par vous..."
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Conditions générales
                                </label>
                                <textarea
                                    value={formData.terms_conditions}
                                    onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                                    rows={4}
                                    placeholder="Conditions qui apparaîtront sur le devis..."
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Résumé */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-6">
                        <h2 className="text-lg font-bold text-neutral-900 mb-4">Résumé</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">Sous-total</span>
                                <span className="font-medium text-neutral-900">
                                    {subtotal.toLocaleString('fr-FR')} DA
                                </span>
                            </div>

                            {formData.tax_rate > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-600">TVA ({formData.tax_rate}%)</span>
                                    <span className="font-medium text-neutral-900">
                                        {tax_amount.toLocaleString('fr-FR')} DA
                                    </span>
                                </div>
                            )}

                            {formData.discount_amount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-600">Remise</span>
                                    <span className="font-medium text-red-600">
                                        -{formData.discount_amount.toLocaleString('fr-FR')} DA
                                    </span>
                                </div>
                            )}

                            <div className="pt-3 border-t border-gray-200">
                                <div className="flex justify-between">
                                    <span className="font-bold text-neutral-900">Total TTC</span>
                                    <span className="font-bold text-xl text-primary">
                                        {total.toLocaleString('fr-FR')} DA
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Remise (DA)
                            </label>
                            <input
                                type="number"
                                value={formData.discount_amount}
                                onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-4"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                        >
                            <Save size={20} />
                            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Eye, Edit, Trash2, Send, Check, X, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function QuotesPage() {
    const [quotes, setQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: establishment } = await supabase
                .from('establishments')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!establishment) return;

            const { data, error } = await supabase
                .from('quotes')
                .select(`
                    *,
                    client:clients(name, phone, email),
                    quote_items(*)
                `)
                .eq('establishment_id', establishment.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuotes(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
            sent: { label: 'Envoyé', color: 'bg-blue-100 text-blue-700' },
            accepted: { label: 'Accepté', color: 'bg-green-100 text-green-700' },
            rejected: { label: 'Refusé', color: 'bg-red-100 text-red-700' },
            expired: { label: 'Expiré', color: 'bg-orange-100 text-orange-700' },
        };
        const badge = badges[status as keyof typeof badges] || badges.draft;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    const filteredQuotes = quotes.filter(quote => {
        const matchesSearch =
            quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.client?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Devis</h1>
                    <p className="text-neutral-500">Gérez vos devis professionnels</p>
                </div>
                <Link
                    href="/dashboard/quotes/new"
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors font-medium"
                >
                    <Plus size={20} />
                    Nouveau Devis
                </Link>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Rechercher
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Numéro, client..."
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Statut
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                            <option value="all">Tous</option>
                            <option value="draft">Brouillon</option>
                            <option value="sent">Envoyé</option>
                            <option value="accepted">Accepté</option>
                            <option value="rejected">Refusé</option>
                            <option value="expired">Expiré</option>
                        </select>
                    </div>
                </div>
                <p className="text-sm text-neutral-500 mt-4">
                    {filteredQuotes.length} devis trouvé{filteredQuotes.length > 1 ? 's' : ''}
                </p>
            </div>

            {/* Liste des devis */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {filteredQuotes.length === 0 ? (
                    <div className="text-center py-16">
                        <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">
                            Aucun devis
                        </h3>
                        <p className="text-neutral-500 mb-6">
                            Créez votre premier devis professionnel
                        </p>
                        <Link
                            href="/dashboard/quotes/new"
                            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors font-medium"
                        >
                            <Plus size={20} />
                            Créer un devis
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">Numéro</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">Client</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">Valide jusqu'au</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">Montant</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">Statut</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredQuotes.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-medium text-neutral-900">
                                                {quote.quote_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-neutral-900">{quote.client?.name}</p>
                                                <p className="text-sm text-neutral-500">{quote.client?.phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-700">
                                            {new Date(quote.issue_date).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-700">
                                            {new Date(quote.valid_until).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-neutral-900">
                                                {quote.total.toLocaleString('fr-DZ')} DA
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(quote.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/dashboard/quotes/${quote.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Voir"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <Link
                                                    href={`/dashboard/quotes/${quote.id}/edit`}
                                                    className="p-2 text-neutral-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Télécharger PDF"
                                                >
                                                    <Download size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

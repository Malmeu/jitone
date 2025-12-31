'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Eye, Edit3, Trash2, Send, Check, X, Download, Search, Filter, History, Calendar, Info, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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

    const handleDelete = async (id: string, quoteNumber: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le devis ${quoteNumber} ?`)) return;

        try {
            const { error } = await supabase
                .from('quotes')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setQuotes(quotes.filter(q => q.id !== id));
        } catch (error) {
            console.error('Error deleting quote:', error);
            alert('Erreur lors de la suppression du devis');
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            draft: { label: 'Brouillon', color: 'bg-neutral-100 text-neutral-500' },
            sent: { label: 'Envoyé', color: 'bg-blue-50 text-blue-500' },
            accepted: { label: 'Accepté', color: 'bg-emerald-50 text-emerald-500' },
            rejected: { label: 'Refusé', color: 'bg-rose-50 text-rose-500' },
            expired: { label: 'Expiré', color: 'bg-amber-50 text-amber-500' },
        };
        const badge = badges[status as keyof typeof badges] || badges.draft;
        return (
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${badge.color}`}>
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
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1600px] mx-auto pb-24 px-4 md:px-8 font-inter"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full font-inter">Commercial & Ventes</span>
                    </motion.div>
                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-2 font-inter"
                    >
                        Devis & Offres
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-lg text-neutral-500 font-medium font-inter"
                    >
                        Convertissez vos prospections en interventions confirmées.
                    </motion.p>
                </div>
                <motion.div variants={itemVariants}>
                    <Link
                        href="/dashboard/quotes/new"
                        className="inline-flex items-center h-14 px-8 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white shadow-xl transition-all active:scale-[0.98] font-bold font-inter"
                    >
                        <Plus className="w-5 h-5 mr-3" />
                        Nouveau Devis
                    </Link>
                </motion.div>
            </div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
                <div className="lg:col-span-7 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary transition-colors font-inter" />
                    <input
                        type="text"
                        placeholder="Rechercher par numéro de devis, client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-white shadow-sm font-medium font-inter"
                    />
                </div>
                <div className="lg:col-span-3">
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-4 rounded-2xl border border-neutral-100 appearance-none bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 font-medium text-neutral-600 font-inter"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="draft">Brouillon</option>
                            <option value="sent">Envoyé</option>
                            <option value="accepted">Accepté</option>
                            <option value="rejected">Refusé</option>
                            <option value="expired">Expiré</option>
                        </select>
                    </div>
                </div>
                <div className="lg:col-span-2 flex items-center justify-center bg-white rounded-2xl border border-neutral-100 shadow-sm px-4 py-4">
                    <span className="text-xl font-black text-neutral-900 font-inter">{filteredQuotes.length}</span>
                    <span className="ml-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-inter">Émis</span>
                </div>
            </motion.div>

            {/* List */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-100 overflow-hidden font-inter">
                {filteredQuotes.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-neutral-50 rounded-[2.5rem] flex items-center justify-center text-neutral-200 mx-auto mb-6">
                            <FileText size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">Aucun devis généré</h3>
                        <p className="text-neutral-400 font-medium mb-8 max-w-md mx-auto">Créez des offres professionnelles et envoyez-les directement à vos clients en quelques clics.</p>
                        <Link
                            href="/dashboard/quotes/new"
                            className="inline-flex items-center gap-2 bg-neutral-50 text-neutral-900 px-8 py-4 rounded-2xl hover:bg-neutral-100 border border-neutral-100 transition-all font-bold"
                        >
                            Créer mon premier devis
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#FBFBFD] text-neutral-400 text-[11px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-6">Référence</th>
                                    <th className="px-8 py-6">Propriétaire</th>
                                    <th className="px-8 py-6">Planning</th>
                                    <th className="px-8 py-6">Montant Total</th>
                                    <th className="px-8 py-6">Statut Commercial</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50 font-inter font-inter">
                                {filteredQuotes.map((quote) => (
                                    <tr key={quote.id} className="group hover:bg-[#FBFBFD]/50 transition-all border-l-4 border-l-transparent hover:border-l-primary/30">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400 group-hover:scale-110 transition-transform">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-mono text-sm font-black text-neutral-900">{quote.quote_number}</div>
                                                    <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">Offre technique</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-neutral-700">{quote.client?.name}</div>
                                            <div className="text-neutral-400 text-xs mt-1 font-medium">{quote.client?.phone}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5 font-medium text-xs">
                                                <div className="flex items-center gap-2 text-neutral-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                    Émis: {new Date(quote.issue_date).toLocaleDateString('fr-FR')}
                                                </div>
                                                <div className="flex items-center gap-2 text-neutral-400">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
                                                    Expire: {new Date(quote.valid_until).toLocaleDateString('fr-FR')}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-neutral-900 text-base">
                                                {quote.total.toLocaleString('fr-DZ')} <span className="text-[10px] text-neutral-400">DA</span>
                                            </div>
                                            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">TTC</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {getStatusBadge(quote.status)}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/dashboard/quotes/${quote.id}`}
                                                    className="p-2.5 bg-white text-neutral-600 rounded-xl border border-neutral-100 hover:bg-neutral-50 shadow-sm transition-all"
                                                    title="Visualiser"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <Link
                                                    href={`/dashboard/quotes/${quote.id}/edit`}
                                                    className="p-2.5 bg-white text-blue-500 rounded-xl border border-neutral-100 hover:bg-blue-50 shadow-sm transition-all"
                                                    title="Modifier"
                                                >
                                                    <Edit3 size={18} />
                                                </Link>
                                                <button
                                                    className="p-2.5 bg-white text-emerald-500 rounded-xl border border-neutral-100 hover:bg-emerald-50 shadow-sm transition-all"
                                                    title="Télécharger"
                                                >
                                                    <Download size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(quote.id, quote.quote_number)}
                                                    className="p-2.5 bg-white text-red-500 rounded-xl border border-neutral-100 hover:bg-red-50 shadow-sm transition-all"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

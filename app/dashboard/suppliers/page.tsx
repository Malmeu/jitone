'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Search, Edit3, Trash2, TrendingUp, TrendingDown,
    DollarSign, Users, CreditCard, History, X, Loader2,
    Phone, Mail, MapPin, Building2, FileText, Calendar,
    ArrowUpRight, ArrowDownRight, Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface Supplier {
    id: string;
    name: string;
    company_name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    country: string;
    tax_id: string;
    initial_balance: number;
    current_balance: number;
    notes: string;
    is_active: boolean;
    created_at: string;
}

interface Transaction {
    id: string;
    supplier_id: string;
    type: 'purchase' | 'payment';
    amount: number;
    description: string;
    reference: string;
    payment_method: string;
    transaction_date: string;
    created_at: string;
}

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [establishmentId, setEstablishmentId] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: '',
        company_name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        country: 'Algérie',
        tax_id: '',
        initial_balance: '' as any,
        notes: ''
    });

    const [transactionForm, setTransactionForm] = useState({
        type: 'purchase' as 'purchase' | 'payment',
        amount: '' as any,
        description: '',
        reference: '',
        payment_method: 'cash'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('*, establishment:establishments(*)')
                .eq('user_id', user.id)
                .single();

            if (!profile) return;
            setUserProfile(profile);
            setEstablishmentId(profile.establishment_id);

            await loadSuppliers(profile.establishment_id);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSuppliers = async (estId: string) => {
        const { data } = await supabase
            .from('suppliers')
            .select('*')
            .eq('establishment_id', estId)
            .order('name');
        if (data) setSuppliers(data);
    };

    const loadTransactions = async (supplierId: string) => {
        const { data } = await supabase
            .from('supplier_transactions')
            .select('*')
            .eq('supplier_id', supplierId)
            .order('transaction_date', { ascending: false });
        if (data) setTransactions(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!establishmentId) return;
        setSubmitting(true);

        try {
            const payload = {
                ...formData,
                establishment_id: establishmentId
            };

            if (editingSupplier) {
                const { error } = await supabase
                    .from('suppliers')
                    .update(payload)
                    .eq('id', editingSupplier.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('suppliers')
                    .insert([payload]);
                if (error) throw error;
            }

            setShowModal(false);
            setEditingSupplier(null);
            resetForm();
            fetchData();
        } catch (error: any) {
            console.error('Error saving supplier:', error);
            alert('Erreur lors de la sauvegarde: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!establishmentId || !selectedSupplier) return;
        setSubmitting(true);

        try {
            const { error } = await supabase
                .from('supplier_transactions')
                .insert([{
                    establishment_id: establishmentId,
                    supplier_id: selectedSupplier.id,
                    ...transactionForm,
                    created_by: userProfile.id
                }]);

            if (error) throw error;

            setShowTransactionModal(false);
            setTransactionForm({
                type: 'purchase',
                amount: '' as any,
                description: '',
                reference: '',
                payment_method: 'cash'
            });
            await fetchData();
            if (selectedSupplier) {
                const updated = suppliers.find(s => s.id === selectedSupplier.id);
                if (updated) setSelectedSupplier(updated);
            }
        } catch (error: any) {
            console.error('Error adding transaction:', error);
            alert('Erreur: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Supprimer le fournisseur "${name}" ?`)) return;
        try {
            const { error } = await supabase.from('suppliers').delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error: any) {
            alert('Erreur: ' + error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            company_name: '',
            phone: '',
            email: '',
            address: '',
            city: '',
            country: 'Algérie',
            tax_id: '',
            initial_balance: '' as any,
            notes: ''
        });
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalSuppliers: suppliers.length,
        activeSuppliers: suppliers.filter(s => s.is_active).length,
        totalDebt: suppliers.reduce((acc, s) => acc + (s.current_balance > 0 ? s.current_balance : 0), 0),
        totalCredit: suppliers.reduce((acc, s) => acc + (s.current_balance < 0 ? Math.abs(s.current_balance) : 0), 0)
    };

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
            opacity: 1, y: 0,
            transition: { duration: 0.6, staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden" animate="visible" variants={containerVariants}
            className="max-w-[1600px] mx-auto pb-24 px-4 md:px-8 font-inter"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Gestion Fournisseurs</span>
                    </motion.div>
                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-2"
                    >
                        Fournisseurs
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-lg text-neutral-500 font-medium"
                    >
                        Gérez vos fournisseurs et suivez vos paiements.
                    </motion.p>
                </div>
                <motion.div variants={itemVariants}>
                    <Button
                        onClick={() => {
                            setEditingSupplier(null);
                            resetForm();
                            setShowModal(true);
                        }}
                        className="h-14 px-8 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-xl transition-all active:scale-[0.98] font-bold flex items-center gap-3"
                    >
                        <Plus size={20} />
                        Nouveau Fournisseur
                    </Button>
                </motion.div>
            </div>

            {/* Quick Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Fournisseurs', val: stats.totalSuppliers, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10', icon: Users },
                    { label: 'Actifs', val: stats.activeSuppliers, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10', icon: Check },
                    { label: 'Total Dettes', val: `${stats.totalDebt.toLocaleString()} DA`, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/10', icon: TrendingUp },
                    { label: 'Total Crédits', val: `${stats.totalCredit.toLocaleString()} DA`, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10', icon: TrendingDown }
                ].map((stat, i) => (
                    <div key={i} className="bg-card rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-sm p-8 flex items-center gap-6 group hover:shadow-md transition-all">
                        <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{stat.label}</div>
                            <div className="text-2xl font-black text-foreground">{stat.val}</div>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Search Bar */}
            <motion.div variants={itemVariants} className="mb-8">
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher un fournisseur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-card shadow-sm font-medium text-foreground placeholder-neutral-400"
                    />
                </div>
            </motion.div>

            {/* Suppliers Table */}
            <motion.div variants={itemVariants} className="bg-card rounded-[2.5rem] shadow-soft border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#FBFBFD] dark:bg-neutral-900/50 text-neutral-400 text-[11px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-6">Fournisseur</th>
                                <th className="px-8 py-6">Contact</th>
                                <th className="px-8 py-6">Solde Initial</th>
                                <th className="px-8 py-6">Solde Actuel</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                            {filteredSuppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-neutral-400 font-medium">
                                        Aucun fournisseur trouvé.
                                    </td>
                                </tr>
                            ) : (
                                filteredSuppliers.map((supplier) => (
                                    <tr key={supplier.id} className="group hover:bg-[#FBFBFD]/50 dark:hover:bg-neutral-900/50 transition-all border-l-4 border-l-transparent hover:border-l-primary/30">
                                        <td className="px-8 py-6">
                                            <div>
                                                <div className="font-bold text-foreground text-base">{supplier.name}</div>
                                                {supplier.company_name && (
                                                    <div className="text-xs text-neutral-400 mt-0.5">{supplier.company_name}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                {supplier.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                        <Phone size={12} />
                                                        {supplier.phone}
                                                    </div>
                                                )}
                                                {supplier.email && (
                                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                        <Mail size={12} />
                                                        {supplier.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-base font-bold text-neutral-600">
                                                {supplier.initial_balance.toLocaleString()} DA
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`text-lg font-black ${supplier.current_balance > 0 ? 'text-rose-500' : supplier.current_balance < 0 ? 'text-emerald-500' : 'text-neutral-400'}`}>
                                                {supplier.current_balance.toLocaleString()} DA
                                            </div>
                                            <div className="text-[10px] text-neutral-400 mt-1">
                                                {supplier.current_balance > 0 ? 'À payer' : supplier.current_balance < 0 ? 'Crédit' : 'Soldé'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setSelectedSupplier(supplier);
                                                        loadTransactions(supplier.id);
                                                        setShowHistoryModal(true);
                                                    }}
                                                    className="p-2.5 bg-card text-purple-500 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 shadow-sm transition-all"
                                                    title="Historique"
                                                >
                                                    <History size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedSupplier(supplier);
                                                        setShowTransactionModal(true);
                                                    }}
                                                    className="p-2.5 bg-card text-emerald-500 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 shadow-sm transition-all"
                                                    title="Ajouter transaction"
                                                >
                                                    <CreditCard size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingSupplier(supplier);
                                                        setFormData({
                                                            name: supplier.name,
                                                            company_name: supplier.company_name || '',
                                                            phone: supplier.phone || '',
                                                            email: supplier.email || '',
                                                            address: supplier.address || '',
                                                            city: supplier.city || '',
                                                            country: supplier.country || 'Algérie',
                                                            tax_id: supplier.tax_id || '',
                                                            initial_balance: supplier.initial_balance,
                                                            notes: supplier.notes || ''
                                                        });
                                                        setShowModal(true);
                                                    }}
                                                    className="p-2.5 bg-card text-blue-500 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-sm transition-all"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(supplier.id, supplier.name)}
                                                    className="p-2.5 bg-card text-red-500 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Supplier Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative bg-card rounded-[3rem] shadow-heavy max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-neutral-100 dark:border-neutral-800"
                        >
                            <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:border-neutral-900/50">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">{editingSupplier ? 'Modifier le fournisseur' : 'Nouveau Fournisseur'}</h2>
                                    <p className="text-sm text-neutral-400 font-medium">Renseignez les informations du fournisseur.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-800 transition-all active:scale-90">
                                    <X className="w-6 h-6 text-neutral-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Nom du fournisseur *</label>
                                        <input
                                            type="text" required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                            placeholder="ex: Tech Parts DZ"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Raison sociale</label>
                                        <input
                                            type="text"
                                            value={formData.company_name}
                                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                            placeholder="ex: SARL Tech Parts"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Téléphone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full pl-11 pr-4 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                                placeholder="+213 XXX XXX XXX"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-11 pr-4 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                                placeholder="contact@example.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Adresse</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                            placeholder="Rue, quartier..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Ville</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                            placeholder="ex: Alger"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">NIF / NIS</label>
                                        <input
                                            type="text"
                                            value={formData.tax_id}
                                            onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                            placeholder="Numéro fiscal"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Solde Initial (DA)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                            <input
                                                type="number"
                                                value={formData.initial_balance}
                                                onChange={(e) => setFormData({ ...formData, initial_balance: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                                className="w-full pl-11 pr-4 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground resize-none"
                                        placeholder="Notes supplémentaires..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-14 rounded-2xl text-neutral-400 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">Annuler</button>
                                    <button type="submit" disabled={submitting} className="flex-[2] h-14 bg-neutral-900 dark:bg-white text-white dark:text-black font-black rounded-2xl hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-xl transition-all active:scale-95 flex items-center justify-center">
                                        {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (editingSupplier ? 'Mettre à jour' : 'Ajouter le fournisseur')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Transaction Modal */}
            <AnimatePresence>
                {showTransactionModal && selectedSupplier && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md" onClick={() => setShowTransactionModal(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative bg-card rounded-[2.5rem] shadow-heavy max-w-lg w-full border border-neutral-100 dark:border-neutral-800"
                        >
                            <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Nouvelle Transaction</h2>
                                    <p className="text-sm text-neutral-400 font-medium mt-1">{selectedSupplier.name}</p>
                                </div>
                                <button onClick={() => setShowTransactionModal(false)} className="w-10 h-10 flex items-center justify-center bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-800 transition-all active:scale-90">
                                    <X className="w-5 h-5 text-neutral-400" />
                                </button>
                            </div>

                            <form onSubmit={handleAddTransaction} className="p-8 space-y-6">
                                <div className="flex gap-2 bg-neutral-100 dark:bg-neutral-900/50 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setTransactionForm({ ...transactionForm, type: 'purchase' })}
                                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${transactionForm.type === 'purchase' ? 'bg-rose-500 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                                    >
                                        <ArrowUpRight size={16} className="inline mr-1" />
                                        Achat
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTransactionForm({ ...transactionForm, type: 'payment' })}
                                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${transactionForm.type === 'payment' ? 'bg-emerald-500 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                                    >
                                        <ArrowDownRight size={16} className="inline mr-1" />
                                        Versement
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Montant (DA) *</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                        <input
                                            type="number" required
                                            value={transactionForm.amount}
                                            onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                            className="w-full pl-11 pr-4 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Description</label>
                                    <input
                                        type="text"
                                        value={transactionForm.description}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                        placeholder="ex: Achat pièces détachées"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Référence</label>
                                        <input
                                            type="text"
                                            value={transactionForm.reference}
                                            onChange={(e) => setTransactionForm({ ...transactionForm, reference: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                            placeholder="N° facture"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Paiement</label>
                                        <select
                                            value={transactionForm.payment_method}
                                            onChange={(e) => setTransactionForm({ ...transactionForm, payment_method: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                        >
                                            <option value="cash">Espèces</option>
                                            <option value="check">Chèque</option>
                                            <option value="transfer">Virement</option>
                                            <option value="card">Carte</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-neutral-500">Solde actuel</span>
                                        <span className={`text-lg font-black ${selectedSupplier.current_balance > 0 ? 'text-rose-500' : selectedSupplier.current_balance < 0 ? 'text-emerald-500' : 'text-neutral-400'}`}>
                                            {selectedSupplier.current_balance.toLocaleString()} DA
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setShowTransactionModal(false)} className="flex-1 h-14 rounded-2xl text-neutral-400 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">Annuler</button>
                                    <button type="submit" disabled={submitting} className="flex-[2] h-14 bg-neutral-900 dark:bg-white text-white dark:text-black font-black rounded-2xl hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-xl transition-all active:scale-95 flex items-center justify-center">
                                        {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Enregistrer'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* History Modal */}
            <AnimatePresence>
                {showHistoryModal && selectedSupplier && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md" onClick={() => setShowHistoryModal(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative bg-card rounded-[2.5rem] shadow-heavy max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-neutral-100 dark:border-neutral-800"
                        >
                            <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Historique des Transactions</h2>
                                    <p className="text-sm text-neutral-400 font-medium mt-1">{selectedSupplier.name}</p>
                                </div>
                                <button onClick={() => setShowHistoryModal(false)} className="w-10 h-10 flex items-center justify-center bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-800 transition-all active:scale-90">
                                    <X className="w-5 h-5 text-neutral-400" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto">
                                {transactions.length === 0 ? (
                                    <div className="text-center py-12 text-neutral-400">
                                        <History size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-medium">Aucune transaction</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {transactions.map((transaction) => (
                                            <div key={transaction.id} className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${transaction.type === 'purchase' ? 'bg-rose-100 dark:bg-rose-900/20 text-rose-600' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600'}`}>
                                                            {transaction.type === 'purchase' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-foreground">{transaction.type === 'purchase' ? 'Achat' : 'Versement'}</div>
                                                            {transaction.description && (
                                                                <div className="text-sm text-neutral-500 mt-0.5">{transaction.description}</div>
                                                            )}
                                                            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar size={12} />
                                                                    {new Date(transaction.transaction_date).toLocaleDateString('fr-FR')}
                                                                </span>
                                                                {transaction.reference && (
                                                                    <span className="flex items-center gap-1">
                                                                        <FileText size={12} />
                                                                        {transaction.reference}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`text-lg font-black ${transaction.type === 'purchase' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                        {transaction.type === 'purchase' ? '+' : '-'}{transaction.amount.toLocaleString()} DA
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

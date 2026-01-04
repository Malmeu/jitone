'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, Edit3, Trash2,
    AlertTriangle, TrendingUp, DollarSign,
    Loader2, X, Check, Box, Settings, Package
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { IconRenderer, AVAILABLE_ICONS } from '@/components/ui/IconRenderer';

interface InventoryItem {
    id: string;
    name: string;
    sku: string;
    category_id: string;
    category?: { name: string };
    current_stock: number;
    low_stock_threshold: number;
    cost_price: number;
    selling_price: number;
    location: string;
    image_url: string;
    icon?: string;
    supplier?: string;
    created_at: string;
}

interface Category {
    id: string;
    name: string;
}

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [establishmentId, setEstablishmentId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category_id: '',
        current_stock: 0,
        low_stock_threshold: 5,
        cost_price: 0,
        selling_price: 0,
        location: '',
        image_url: '',
        icon: 'Box',
        supplier: ''
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
                .select('role, establishment_id')
                .eq('user_id', user.id)
                .single();

            if (!profile) return;
            setUserRole(profile.role);
            setEstablishmentId(profile.establishment_id);
            await loadInventoryData(profile.establishment_id);
        } catch (error) {
            console.error('Exception dans fetchData:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadInventoryData = async (estId: string) => {
        try {
            const [itemsRes, catsRes] = await Promise.all([
                supabase
                    .from('inventory')
                    .select('*, category:inventory_categories(name)')
                    .eq('establishment_id', estId)
                    .order('name'),
                supabase
                    .from('inventory_categories')
                    .select('id, name')
                    .eq('establishment_id', estId)
                    .order('name')
            ]);

            if (itemsRes.data) setItems(itemsRes.data);
            if (catsRes.data) setCategories(catsRes.data);
        } catch (error) {
            console.error('Error loading inventory:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!establishmentId) return;
        setSubmitting(true);

        try {
            const payload = {
                ...formData,
                establishment_id: establishmentId,
                category_id: formData.category_id || null
            };

            if (editingItem) {
                const { error } = await supabase
                    .from('inventory')
                    .update(payload)
                    .eq('id', editingItem.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('inventory')
                    .insert([payload]);
                if (error) throw error;
            }

            setShowModal(false);
            setEditingItem(null);
            fetchData();
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const categoryName = newCategoryName.trim();

        if (!establishmentId) {
            console.error('Establishment ID missing');
            alert('Erreur: Identifiant établissement manquant. Veuillez rafraîchir la page.');
            return;
        }

        if (!categoryName) return;

        setSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('inventory_categories')
                .insert([{
                    name: categoryName,
                    establishment_id: establishmentId
                }])
                .select()
                .single();

            if (error) throw error;

            setCategories([...categories, (data as Category)]);
            setNewCategoryName('');
            // On ne ferme plus forcément le modal pour permettre d'en ajouter plusieurs ou de voir la liste
        } catch (error: any) {
            console.error('Error detail:', error);
            alert(`Erreur lors de l'ajout de la catégorie: ${error.message || 'Erreur inconnue'}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        const hasItems = items.some(item => item.category_id === id);
        if (hasItems) {
            alert("Cette catégorie contient des articles. Vous devez d'abord changer la catégorie de ces articles avant de pouvoir la supprimer.");
            return;
        }

        if (!confirm(`Supprimer la catégorie "${name}" ?`)) return;

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('inventory_categories')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setCategories(categories.filter(c => c.id !== id));
        } catch (error: any) {
            alert("Erreur lors de la suppression : " + error.message);
        } finally {
            setSubmitting(true); // Small delay to prevent double clicks
            setTimeout(() => setSubmitting(false), 500);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Supprimer ${name} de l'inventaire ?`)) return;
        try {
            const { error } = await supabase.from('inventory').delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category_id === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const stats = {
        totalItems: items.length,
        lowStock: items.filter(i => i.current_stock <= i.low_stock_threshold && i.current_stock > 0).length,
        outOfStock: items.filter(i => i.current_stock === 0).length,
        totalValue: items.reduce((acc, i) => acc + (i.cost_price * i.current_stock), 0)
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full font-inter">Logistique & Pièces</span>
                    </motion.div>
                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-2 font-inter"
                    >
                        Stock & Inventaire
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-lg text-neutral-500 font-medium font-inter"
                    >
                        Gérez vos pièces détachées et accessoires avec précision.
                    </motion.p>
                </div>
                <motion.div variants={itemVariants} className="flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => setShowCategoryModal(true)}
                        className="h-14 px-8 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all active:scale-[0.98] font-bold flex items-center gap-3 font-inter shadow-sm"
                    >
                        <Settings size={20} />
                        Catégories
                    </Button>
                    <Button
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({
                                name: '', sku: '', category_id: '',
                                current_stock: 0, low_stock_threshold: 5,
                                cost_price: 0, selling_price: 0,
                                location: '', image_url: '',
                                icon: 'Box', supplier: ''
                            });
                            setShowModal(true);
                        }}
                        className="h-14 px-8 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-xl transition-all active:scale-[0.98] font-bold flex items-center gap-3 font-inter"
                    >
                        <Plus size={20} />
                        Nouvel Article
                    </Button>
                </motion.div>
            </div>

            {/* Quick Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 font-inter">
                {[
                    { label: 'Articles Totaux', val: stats.totalItems, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10', icon: Box },
                    { label: 'Stock Faible', val: stats.lowStock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10', icon: AlertTriangle },
                    { label: 'Rupture de Stock', val: stats.outOfStock, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/10', icon: Trash2 },
                    { label: 'Valeur du Stock', val: `${stats.totalValue.toLocaleString()} DA`, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10', icon: TrendingUp }
                ].map((stat, i) => (
                    <div key={i} className="bg-card rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-sm p-8 flex items-center gap-6 group hover:shadow-md transition-all">
                        <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 font-inter">{stat.label}</div>
                            <div className="text-2xl font-black text-foreground font-inter">{stat.val}</div>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Filters Bar */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
                <div className="lg:col-span-8 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-card shadow-sm font-medium text-foreground placeholder-neutral-400"
                    />
                </div>
                <div className="lg:col-span-4 relative group">
                    <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-card shadow-sm font-medium text-neutral-600 dark:text-neutral-400 appearance-none"
                    >
                        <option value="all">Toutes les catégories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </motion.div>

            {/* Inventory Table */}
            <motion.div variants={itemVariants} className="bg-card rounded-[2.5rem] shadow-soft border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#FBFBFD] dark:bg-neutral-900/50 text-neutral-400 text-[11px] font-black uppercase tracking-widest font-inter">
                            <tr>
                                <th className="px-8 py-6">Article</th>
                                <th className="px-8 py-6">Catégorie</th>
                                <th className="px-8 py-6">Stock</th>
                                <th className="px-8 py-6">Fournisseur</th>
                                {userRole !== 'technician' && <th className="px-8 py-6">Prix (DA)</th>}
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800 font-inter">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-neutral-400 font-medium">
                                        Aucun article trouvé dans l'inventaire.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="group hover:bg-[#FBFBFD]/50 dark:hover:bg-neutral-900/50 transition-all border-l-4 border-l-transparent hover:border-l-primary/30">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl flex items-center justify-center text-primary overflow-hidden">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <IconRenderer name={item.icon || 'Box'} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground text-base">{item.name}</div>
                                                    <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">SKU: {item.sku || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 rounded-full text-[10px] font-black uppercase tracking-tight">
                                                {item.category?.name || 'Général'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className={`text-lg font-black ${item.current_stock === 0 ? 'text-rose-500' : item.current_stock <= item.low_stock_threshold ? 'text-amber-500' : 'text-foreground'}`}>
                                                    {item.current_stock}
                                                </div>
                                                {item.current_stock <= item.low_stock_threshold && (
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-tighter">
                                                        <AlertTriangle size={10} /> Stock faible
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-neutral-500 font-medium">{item.supplier || 'N/A'}</div>
                                        </td>
                                        {userRole !== 'technician' && (
                                            <td className="px-8 py-6">
                                                <div className="text-foreground font-bold">{item.selling_price.toLocaleString()} DA</div>
                                                <div className="text-[10px] text-neutral-400 mt-1">Coût: {item.cost_price.toLocaleString()} DA</div>
                                            </td>
                                        )}
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(item);
                                                        setFormData({
                                                            name: item.name, sku: item.sku || '', category_id: item.category_id || '',
                                                            current_stock: item.current_stock, low_stock_threshold: item.low_stock_threshold,
                                                            cost_price: item.cost_price, selling_price: item.selling_price,
                                                            location: item.location || '', image_url: item.image_url || '',
                                                            icon: item.icon || 'Box', supplier: item.supplier || ''
                                                        });
                                                        setShowModal(true);
                                                    }}
                                                    className="p-2.5 bg-card text-blue-500 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-sm transition-all"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.name)}
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

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative bg-card rounded-[3rem] shadow-heavy max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col font-inter border border-neutral-100 dark:border-neutral-800"
                        >
                            <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50 font-inter">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">{editingItem ? 'Modifier l\'article' : 'Nouvel Article'}</h2>
                                    <p className="text-sm text-neutral-400 font-medium font-inter">Tous les champs marqués d'une étoile (*) sont requis.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-800 transition-all active:scale-90"><X className="w-6 h-6 text-neutral-400" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Nom de l'article *</label>
                                        <input
                                            type="text" required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-5 py-4 rounded-3xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                            placeholder="ex: Écran iPhone 13 Pro Max"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Référence / SKU</label>
                                            <input
                                                type="text"
                                                value={formData.sku}
                                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                                className="w-full px-5 py-4 rounded-3xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                                placeholder="ex: SCR-I13PM-BLK"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Catégorie</label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={formData.category_id}
                                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                                    className="flex-1 px-5 py-4 rounded-3xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                                >
                                                    <option value="">Aucune catégorie</option>
                                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCategoryModal(true)}
                                                    className="w-14 h-14 bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl flex items-center justify-center text-neutral-400 border border-neutral-100 dark:border-neutral-800 transition-all font-inter"
                                                    title="Gérer les catégories"
                                                >
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {userRole !== 'technician' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Prix d'Achat (Coût) *</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                                    <input
                                                        type="number" required
                                                        value={formData.cost_price}
                                                        onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) })}
                                                        className="w-full pl-10 pr-4 py-4 rounded-3xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Prix de Vente *</label>
                                                <div className="relative">
                                                    <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                                    <input
                                                        type="number" required
                                                        value={formData.selling_price}
                                                        onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) })}
                                                        className="w-full pl-10 pr-4 py-4 rounded-3xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Stock Actuel *</label>
                                            <input
                                                type="number" required
                                                value={formData.current_stock}
                                                onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) })}
                                                className="w-full px-5 py-4 rounded-3xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Seuil d'Alerte *</label>
                                            <input
                                                type="number" required
                                                value={formData.low_stock_threshold}
                                                onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) })}
                                                className="w-full px-5 py-4 rounded-3xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Localisation (Rayon / Tiroir)</label>
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="w-full px-5 py-4 rounded-3xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                                placeholder="ex: Étagère SAV-01"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Fournisseur</label>
                                            <input
                                                type="text"
                                                value={formData.supplier}
                                                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                                className="w-full px-5 py-4 rounded-3xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                                placeholder="ex: Tech Parts DZ"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Icône de l'article</label>
                                        <div className="grid grid-cols-6 md:grid-cols-9 gap-3">
                                            {AVAILABLE_ICONS.map((iconObj) => (
                                                <button
                                                    key={iconObj.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, icon: iconObj.id })}
                                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${formData.icon === iconObj.id
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110'
                                                        : 'bg-neutral-50 dark:bg-neutral-900/50 text-neutral-400 hover:text-primary hover:bg-primary/5 border border-neutral-100 dark:border-neutral-800'
                                                        }`}
                                                >
                                                    <IconRenderer name={iconObj.id} size={20} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-14 rounded-2xl text-neutral-400 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">Annuler</button>
                                    <button type="submit" disabled={submitting} className="flex-[2] h-14 bg-neutral-900 dark:bg-white text-white dark:text-black font-black rounded-2xl hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-xl transition-all active:scale-95 flex items-center justify-center font-inter">
                                        {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (editingItem ? 'Mettre à jour l\'article' : 'Ajouter à l\'inventaire')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Category Modal */}
            <AnimatePresence>
                {showCategoryModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md" onClick={() => setShowCategoryModal(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative bg-card rounded-[2.5rem] shadow-heavy max-w-lg w-full p-8 border border-neutral-100 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground font-inter">Gestion des Catégories</h2>
                                    <p className="text-xs text-neutral-400 font-medium">Ajoutez ou supprimez vos catégories de stock.</p>
                                </div>
                                <button onClick={() => setShowCategoryModal(false)} className="w-10 h-10 flex items-center justify-center bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-800 transition-all active:scale-90"><X className="w-5 h-5 text-neutral-400" /></button>
                            </div>

                            <form onSubmit={handleAddCategory} className="flex gap-2 mb-8 items-end">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Nouveau nom</label>
                                    <input
                                        type="text" required
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-foreground"
                                        placeholder="ex: Batteries, Écrans..."
                                    />
                                </div>
                                <Button type="submit" disabled={submitting} className="h-[58px] aspect-square rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center">
                                    <Plus size={24} />
                                </Button>
                            </form>

                            <div className="space-y-3 overflow-y-auto pr-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1 block mb-2">Catégories existantes ({categories.length})</label>
                                {categories.length === 0 ? (
                                    <div className="text-center py-10 bg-neutral-50 dark:bg-neutral-900/50 rounded-[2rem] border border-dashed border-neutral-200 dark:border-neutral-800">
                                        <Package className="w-10 h-10 text-neutral-200 dark:text-neutral-800 mx-auto mb-2" />
                                        <p className="text-xs text-neutral-400 font-medium">Aucune catégorie</p>
                                    </div>
                                ) : (
                                    categories.map(cat => (
                                        <div key={cat.id} className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-800 rounded-2xl group hover:border-primary/30 transition-all">
                                            <span className="font-bold text-neutral-700 dark:text-neutral-300">{cat.name}</span>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                                className="p-2 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

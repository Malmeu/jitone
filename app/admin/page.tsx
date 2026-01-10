'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield, Users, CreditCard, Clock, CheckCircle2, AlertCircle, Search, ArrowUpRight, Check, X, Mail, Phone, Calendar } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_EMAILS = [
    'admin@repairtrack.dz',
    'contact@repairtrack.dz',
];

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'establishments' | 'packs' | 'messages' | 'users'>('dashboard');
    const [establishments, setEstablishments] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [authUsers, setAuthUsers] = useState<any[]>([]);
    const [configs, setConfigs] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [authorized, setAuthorized] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        trial: 0,
        active: 0,
        expired: 0,
    });

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && ADMIN_EMAILS.includes(user.email || '')) {
            setAuthorized(true);
            await Promise.all([
                fetchEstablishments(),
                fetchConfigs(),
                fetchMessages(),
                fetchUsers()
            ]);
        } else {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const deleteMessage = async (id: string) => {
        if (!confirm('Supprimer ce message ?')) return;
        try {
            const { error } = await supabase
                .from('contact_messages')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchMessages();
        } catch (error) {
            alert('Erreur lors de la suppression');
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from('contact_messages')
                .update({ status: 'read' })
                .eq('id', id);

            if (error) throw error;
            await fetchMessages();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const fetchConfigs = async () => {
        try {
            const response = await fetch('/api/admin/configs');
            const data = await response.json();
            if (Array.isArray(data)) setConfigs(data);
        } catch (error) {
            console.error('Error fetching configs:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            const result = await response.json();

            setUsers(result.profiles || []);
            setAuthUsers(result.authUsers || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchEstablishments = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch('/api/admin/establishments', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            const result = await response.json();

            const establishmentsArray = result.establishments || [];
            setEstablishments(establishmentsArray);

            setStats({
                total: establishmentsArray.length,
                trial: establishmentsArray.filter((e: any) => e.subscription_status === 'trial').length,
                active: establishmentsArray.filter((e: any) => e.subscription_status === 'active').length,
                expired: establishmentsArray.filter((e: any) => e.subscription_status === 'expired').length,
            });
        } catch (error) {
            console.error('Error fetching establishments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserAction = async (userId: string, action: string, data?: any) => {
        if (!confirm(`Confirmer l'action : ${action} ?`)) return;

        setIsUpdating(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch('/api/admin/users', {
                method: action === 'delete' ? 'DELETE' : 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, action, data })
            });

            if (!response.ok) throw new Error('Erreur lors de l\'action');
            await fetchUsers();
            alert('Action effectuée avec succès');
        } catch (error) {
            console.error('User action error:', error);
            alert('Erreur lors de l\'action');
        } finally {
            setIsUpdating(false);
        }
    };

    const updateSubscription = async (id: string, updates: any) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch('/api/admin/establishments', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, updates })
            });

            if (!response.ok) throw new Error('Erreur de mise à jour');
            await fetchEstablishments();
        } catch (error) {
            console.error('Error:', error);
            alert('Erreur lors de la mise à jour');
        }
    };

    const updatePackConfig = async (plan_id: string, updates: any) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch('/api/admin/configs', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plan_id, updates })
            });

            if (!response.ok) throw new Error('Erreur de mise à jour');
            await fetchConfigs();
            alert('Configuration mise à jour avec succès');
        } catch (error) {
            console.error('Error:', error);
            alert('Erreur lors de la mise à jour');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'trial': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'expired': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-neutral-50 text-neutral-600 border-neutral-100';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Actif';
            case 'trial': return 'Essai';
            case 'expired': return 'Expiré';
            case 'cancelled': return 'Annulé';
            default: return status;
        }
    };

    const getDaysRemaining = (date: string) => {
        if (!date) return null;
        const remaining = new Date(date).getTime() - Date.now();
        return Math.ceil(remaining / (1000 * 60 * 60 * 24));
    };

    const isOnline = (lastSignIn: string | null) => {
        if (!lastSignIn) return false;
        const lastActive = new Date(lastSignIn).getTime();
        const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
        return lastActive > thirtyMinutesAgo;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!authorized) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Accès Refusé</h1>
                    <p className="text-neutral-500 mb-8 font-medium">Vous n'avez pas les autorisations nécessaires pour accéder à cet espace.</p>
                    <Link href="/dashboard" className="inline-flex items-center justify-center w-full h-14 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-neutral-800 transition-all">
                        Retour au Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBFBFD] pb-24">
            {/* Header */}
            <header className="bg-white border-b border-neutral-100 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center text-white">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-neutral-900">Admin Control</h1>
                            <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Gestion & Configuration</p>
                        </div>
                    </div>

                    <nav className="flex bg-neutral-50 p-1.5 rounded-2xl border border-neutral-100">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('establishments')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'establishments' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                        >
                            Boutiques
                        </button>
                        <button
                            onClick={() => setActiveTab('packs')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'packs' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                        >
                            Packs
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-neutral-900 shadow-sm relative' : 'text-neutral-400 hover:text-neutral-600'}`}
                        >
                            Comptes
                            <span className="ml-2 px-1.5 py-0.5 bg-neutral-100 rounded text-[10px] text-neutral-500">
                                {authUsers.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'messages' ? 'bg-white text-neutral-900 shadow-sm relative' : 'text-neutral-400 hover:text-neutral-600'}`}
                        >
                            Messages
                            {messages.filter(m => m.status === 'unread').length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full animate-pulse">
                                    {messages.filter(m => m.status === 'unread').length}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-12">
                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' ? (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-10"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-white p-10 rounded-[3rem] border border-neutral-100 shadow-xl shadow-neutral-100/50">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                                            <ArrowUpRight size={28} />
                                        </div>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">+7j</span>
                                    </div>
                                    <div className="text-4xl font-black text-neutral-900 mb-1">
                                        {authUsers.filter(u => new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                                    </div>
                                    <div className="text-sm font-bold text-neutral-400 uppercase tracking-wide">Nouveaux Inscrits</div>
                                    <p className="text-xs text-neutral-400 mt-4 leading-relaxed font-medium">Potentiel de conversion élevé. Pensez à vérifier les boutiques créées.</p>
                                </div>

                                <div className="bg-white p-10 rounded-[3rem] border border-neutral-100 shadow-xl shadow-neutral-100/50">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                                            <AlertCircle size={28} />
                                        </div>
                                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">Action</span>
                                    </div>
                                    <div className="text-4xl font-black text-neutral-900 mb-1">
                                        {authUsers.filter(u => !users.find(p => p.id === u.id)).length}
                                    </div>
                                    <div className="text-sm font-bold text-neutral-400 uppercase tracking-wide">Comptes Incomplets</div>
                                    <p className="text-xs text-neutral-400 mt-4 leading-relaxed font-medium">Inscrits sans boutique créée. Cible idéale pour la relance commerciale.</p>
                                </div>

                                <div className="bg-white p-10 rounded-[3rem] border border-neutral-100 shadow-xl shadow-neutral-100/50">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                                            <CheckCircle2 size={28} />
                                        </div>
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Santé</span>
                                    </div>
                                    <div className="text-4xl font-black text-neutral-900 mb-1">{establishments.length}</div>
                                    <div className="text-sm font-bold text-neutral-400 uppercase tracking-wide">Boutiques Actives</div>
                                    <p className="text-xs text-neutral-400 mt-4 leading-relaxed font-medium">Total des établissements utilisant la plateforme actuellement.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-neutral-900 p-10 rounded-[3rem] text-white">
                                    <h3 className="text-xl font-black mb-6 uppercase tracking-tight">Activité Récente</h3>
                                    <div className="space-y-6">
                                        {authUsers.slice(0, 5).map((u, i) => {
                                            const profile = users.find(p => p.id === u.id);
                                            return (
                                                <div key={i} className="flex items-center justify-between py-4 border-b border-white/10 last:border-0">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-bold text-xs">
                                                            {profile?.name?.charAt(0) || u.email?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm">{profile?.name || u.email?.split('@')[0]}</div>
                                                            <div className="text-white/40 text-[10px] uppercase font-black">{new Date(u.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                                                        </div>
                                                    </div>
                                                    <div className={`w-2 h-2 rounded-full ${isOnline(u.last_sign_in_at) ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-white/20'}`} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-white p-10 rounded-[3rem] border border-neutral-100">
                                    <h3 className="text-xl font-black text-neutral-900 mb-6 uppercase tracking-tight text-center">Répartition Forfaits</h3>
                                    <div className="flex items-center justify-center gap-10 py-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-black text-neutral-900">{stats.trial}</div>
                                            <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Essai</div>
                                        </div>
                                        <div className="w-px h-12 bg-neutral-100" />
                                        <div className="text-center">
                                            <div className="text-3xl font-black text-blue-600">{stats.active}</div>
                                            <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Actifs</div>
                                        </div>
                                        <div className="w-px h-12 bg-neutral-100" />
                                        <div className="text-center">
                                            <div className="text-3xl font-black text-red-500">{stats.expired}</div>
                                            <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Expirés</div>
                                        </div>
                                    </div>
                                    <div className="mt-10 p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-bold text-neutral-500">Total Enregistré (DA)</span>
                                            <span className="text-lg font-black text-neutral-900">Calcul en cours...</span>
                                        </div>
                                        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                                            <div className="w-[65%] h-full bg-neutral-900 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTab === 'establishments' ? (
                        <motion.div
                            key="est"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                                {[
                                    { label: 'Total', value: stats.total, icon: Users, color: 'text-neutral-900', bg: 'bg-white' },
                                    { label: 'En Essai', value: stats.trial, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50/50' },
                                    { label: 'Actifs', value: stats.active, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                                    { label: 'Expirés', value: stats.expired, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50/50' },
                                ].map((stat, i) => (
                                    <div key={i} className={`${stat.bg} p-8 rounded-[2rem] border border-neutral-100 shadow-sm`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <stat.icon className={stat.color} size={24} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Statistiques</span>
                                        </div>
                                        <div className="text-3xl font-black text-neutral-900">{stat.value}</div>
                                        <div className="text-sm font-bold text-neutral-400 mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white rounded-[2.5rem] shadow-sm border border-neutral-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#FBFBFD] border-b border-neutral-100">
                                            <tr>
                                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">Boutique</th>
                                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">Propriétaire</th>
                                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">Statut</th>
                                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">Forfait</th>
                                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-neutral-400 text-center">Limite</th>
                                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">Expire</th>
                                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-neutral-400 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-50 text-sm">
                                            {establishments.map((est) => {
                                                const endDate = est.subscription_status === 'trial' ? est.trial_ends_at : est.subscription_ends_at;
                                                const daysRemaining = getDaysRemaining(endDate);

                                                return (
                                                    <tr key={est.id} className="hover:bg-neutral-50/50 transition-colors">
                                                        <td className="px-8 py-6">
                                                            <div className="font-bold text-neutral-900">{est.name}</div>
                                                            <div className="text-xs text-neutral-400 font-medium">ID: {est.id.slice(0, 8)}</div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2 text-neutral-700 font-bold">
                                                                    <Mail size={12} className="text-neutral-300" />
                                                                    {est.owner_email}
                                                                </div>
                                                                {est.phone && (
                                                                    <div className="flex items-center gap-2 text-neutral-400 text-xs">
                                                                        <Phone size={12} className="text-neutral-300" />
                                                                        {est.phone}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getStatusColor(est.subscription_status)}`}>
                                                                {getStatusLabel(est.subscription_status)}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <select
                                                                value={est.subscription_plan || 'standard'}
                                                                onChange={(e) => updateSubscription(est.id, { subscription_plan: e.target.value })}
                                                                className={`text-xs font-bold px-3 py-1.5 rounded-xl border-none focus:ring-0 appearance-none cursor-pointer ${est.subscription_plan === 'premium' ? 'bg-indigo-100 text-indigo-700' : 'bg-neutral-100 text-neutral-600'}`}
                                                            >
                                                                <option value="standard">Standard</option>
                                                                <option value="premium">Premium 👑</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-8 py-6 text-center">
                                                            <input
                                                                type="number"
                                                                value={est.max_repairs || 100}
                                                                onChange={(e) => updateSubscription(est.id, { max_repairs: parseInt(e.target.value) })}
                                                                className="w-20 px-2 py-1.5 text-xs font-bold bg-neutral-50 border border-neutral-100 rounded-xl text-center focus:ring-1 focus:ring-primary focus:border-primary"
                                                            />
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={14} className="text-neutral-300" />
                                                                <div className="text-xs font-bold text-neutral-700">
                                                                    {daysRemaining !== null ? (
                                                                        <span className={daysRemaining <= 7 ? 'text-red-500' : ''}>
                                                                            {daysRemaining} j
                                                                        </span>
                                                                    ) : '-'}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {est.subscription_status !== 'active' && (
                                                                    <button
                                                                        onClick={() => updateSubscription(est.id, {
                                                                            subscription_status: 'active',
                                                                            subscription_ends_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                                                                        })}
                                                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                                                        title="Activer 1 an"
                                                                    >
                                                                        <Check size={18} />
                                                                    </button>
                                                                )}
                                                                {est.subscription_status === 'active' && (
                                                                    <button
                                                                        onClick={() => updateSubscription(est.id, { subscription_status: 'expired' })}
                                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                                        title="Expirer"
                                                                    >
                                                                        <X size={18} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTab === 'users' ? (
                        <motion.div
                            key="users"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <ArrowUpRight className="text-blue-500" size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Croissance</span>
                                    </div>
                                    <div className="text-3xl font-black text-neutral-900">
                                        {authUsers.filter(u => new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                                    </div>
                                    <div className="text-sm font-bold text-neutral-400 mt-1">Nouveaux (7 derniers jours)</div>
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <AlertCircle className="text-amber-500" size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">En attente</span>
                                    </div>
                                    <div className="text-3xl font-black text-neutral-900">
                                        {authUsers.filter(u => !users.find(p => p.id === u.id)).length}
                                    </div>
                                    <div className="text-sm font-bold text-neutral-400 mt-1">Profils non créés</div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] shadow-sm border border-neutral-100 overflow-hidden">
                                <div className="p-8 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-neutral-900">Comptes Utilisateurs</h3>
                                        <p className="text-sm text-neutral-400">Gérez les accès, rôles et sécurité.</p>
                                    </div>
                                    <div className="relative w-full md:w-80">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Rechercher email ou nom..."
                                            value={userSearchTerm}
                                            onChange={(e) => setUserSearchTerm(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#FBFBFD] border-b border-neutral-100">
                                            <tr>
                                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">Utilisateur</th>
                                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">Établissement</th>
                                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">Rôle</th>
                                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">Vérifié</th>
                                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-neutral-400">Connexion</th>
                                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-neutral-400 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-50 text-sm">
                                            {authUsers
                                                .filter(u => {
                                                    const searchTerm = userSearchTerm.toLowerCase();
                                                    const profile = users.find(p => p.id === u.id);
                                                    return (
                                                        u.email?.toLowerCase().includes(searchTerm) ||
                                                        profile?.name?.toLowerCase().includes(searchTerm) ||
                                                        profile?.establishments?.name?.toLowerCase().includes(searchTerm)
                                                    );
                                                })
                                                .map((u) => {
                                                    const profile = users.find(p => p.id === u.id);
                                                    const isBanned = u.banned_until && new Date(u.banned_until) > new Date();
                                                    const online = isOnline(u.last_sign_in_at);

                                                    return (
                                                        <tr key={u.id} className={`hover:bg-neutral-50/50 transition-colors ${isBanned ? 'opacity-60 bg-red-50/20' : ''}`}>
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="relative">
                                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${isBanned ? 'bg-red-100 text-red-600' : 'bg-neutral-100 text-neutral-500'}`}>
                                                                            {profile?.name?.charAt(0) || u.email?.charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full ${online ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-neutral-900">
                                                                            {profile?.name || u.email?.split('@')[0]}
                                                                            {isBanned && <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-[8px] rounded-full uppercase tracking-tighter">Banni</span>}
                                                                        </div>
                                                                        <div className="text-xs text-neutral-400 font-medium">{u.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                {profile?.establishments ? (
                                                                    <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl w-fit text-[10px] uppercase tracking-wider">
                                                                        <CheckCircle2 size={12} />
                                                                        {profile.establishments.name}
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 text-red-400 font-bold bg-red-50 px-3 py-1.5 rounded-xl w-fit text-[10px] uppercase tracking-wider">
                                                                        <AlertCircle size={12} />
                                                                        Aucun
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <select
                                                                    disabled={!profile || isUpdating}
                                                                    value={profile?.role || 'visitor'}
                                                                    onChange={(e) => handleUserAction(u.id, 'update_role', { role: e.target.value })}
                                                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer ${profile?.role === 'owner' ? 'bg-indigo-50 text-indigo-600' : 'bg-neutral-100 text-neutral-500'}`}
                                                                >
                                                                    <option value="owner">Owner</option>
                                                                    <option value="technician">Technician</option>
                                                                    <option value="visitor">Visitor</option>
                                                                </select>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                {u.email_confirmed_at ? (
                                                                    <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center" title="Email vérifié">
                                                                        <Check size={14} />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center" title="Email non vérifié">
                                                                        <Clock size={14} />
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="text-xs font-bold text-neutral-700">
                                                                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Jamais'}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        disabled={isUpdating}
                                                                        onClick={() => handleUserAction(u.id, 'reset_password', { email: u.email })}
                                                                        className="p-2 bg-neutral-50 text-neutral-500 rounded-lg hover:bg-neutral-100 transition-colors"
                                                                        title="Reset Password"
                                                                    >
                                                                        <Mail size={16} />
                                                                    </button>
                                                                    <button
                                                                        disabled={isUpdating}
                                                                        onClick={() => handleUserAction(u.id, 'ban', { banned: !isBanned })}
                                                                        className={`p-2 rounded-lg transition-colors ${isBanned ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                                                                        title={isBanned ? 'Débannir' : 'Bannir'}
                                                                    >
                                                                        <Shield size={16} />
                                                                    </button>
                                                                    <button
                                                                        disabled={isUpdating}
                                                                        onClick={() => handleUserAction(u.id, 'delete')}
                                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                                        title="Supprimer définitivement"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTab === 'messages' ? (
                        <motion.div
                            key="msg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Messages</h1>
                                <div className="px-4 py-2 bg-white rounded-xl border border-neutral-100 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                                    {messages.length} Messages
                                </div>
                            </div>
                            <div className="grid gap-6">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`bg-white p-8 rounded-[2.5rem] border transition-all ${msg.status === 'unread' ? 'border-primary/20 shadow-lg' : 'border-neutral-100'}`}>
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${msg.status === 'unread' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                                                        {msg.status === 'unread' ? 'Nouveau' : 'Lu'}
                                                    </span>
                                                    <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">
                                                        {new Date(msg.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-black text-neutral-900 mb-2">{msg.subject || 'Sans sujet'}</h3>
                                                <p className="text-neutral-600 font-medium whitespace-pre-wrap mb-6">{msg.message}</p>
                                                <div className="flex flex-wrap gap-6 items-center pt-6 border-t border-neutral-50 text-sm font-bold">
                                                    <div className="flex items-center gap-2 text-neutral-400">
                                                        <Users size={16} />
                                                        <span className="text-neutral-900">{msg.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-neutral-400">
                                                        <Phone size={16} />
                                                        <a href={`tel:${msg.phone}`} className="text-primary">{msg.phone}</a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex md:flex-col gap-2">
                                                {msg.status === 'unread' && (
                                                    <button onClick={() => markAsRead(msg.id)} className="p-3 bg-primary/10 text-primary rounded-2xl hover:bg-primary/20"><Check size={20} /></button>
                                                )}
                                                <button onClick={() => deleteMessage(msg.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100"><X size={20} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {messages.length === 0 && (
                                    <div className="text-center py-24 bg-white rounded-[3rem] border border-neutral-100 border-dashed">
                                        <Mail className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                                        <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Aucun message</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="packs"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-10"
                        >
                            {configs.map((config) => (
                                <div key={config.plan_id} className="bg-white p-10 rounded-[3rem] border border-neutral-100 shadow-xl relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-neutral-900 uppercase">{config.plan_id}</h3>
                                            <p className="text-sm text-neutral-400 font-bold uppercase mt-1">Configuration</p>
                                        </div>
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.plan_id === 'premium' ? 'bg-indigo-50 text-indigo-600' : 'bg-neutral-50 text-neutral-600'}`}>
                                            <CreditCard size={28} />
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-neutral-400">Prix Annuel (DA)</label>
                                            <input
                                                type="number"
                                                value={config.price_da}
                                                onChange={(e) => {
                                                    const newConfigs = [...configs];
                                                    const c = newConfigs.find(x => x.plan_id === config.plan_id);
                                                    if (c) c.price_da = parseFloat(e.target.value);
                                                    setConfigs(newConfigs);
                                                }}
                                                className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase text-neutral-400">Max Réparations</label>
                                                <input
                                                    type="number"
                                                    value={config.default_max_repairs}
                                                    onChange={(e) => {
                                                        const newConfigs = [...configs];
                                                        const c = newConfigs.find(x => x.plan_id === config.plan_id);
                                                        if (c) c.default_max_repairs = parseInt(e.target.value);
                                                        setConfigs(newConfigs);
                                                    }}
                                                    className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase text-neutral-400">Max Team</label>
                                                <input
                                                    type="number"
                                                    value={config.default_max_team_members}
                                                    onChange={(e) => {
                                                        const newConfigs = [...configs];
                                                        const c = newConfigs.find(x => x.plan_id === config.plan_id);
                                                        if (c) c.default_max_team_members = parseInt(e.target.value);
                                                        setConfigs(newConfigs);
                                                    }}
                                                    className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => updatePackConfig(config.plan_id, {
                                                price_da: config.price_da,
                                                default_max_repairs: config.default_max_repairs,
                                                default_max_team_members: config.default_max_team_members
                                            })}
                                            className="w-full py-5 bg-neutral-900 text-white rounded-2xl font-bold"
                                        >
                                            Mettre à jour
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

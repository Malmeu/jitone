'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield, Users, CreditCard, Clock, CheckCircle2, AlertCircle, Search, Filter, ArrowUpRight, Check, X, Smartphone, Mail, Phone, Calendar } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_EMAILS = [
    'admin@repairtrack.dz',
    'contact@repairtrack.dz',
];

export default function AdminPage() {
    const [establishments, setEstablishments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
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
            fetchEstablishments();
        } else {
            setLoading(false);
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

            // Sécurité: extraire le tableau d'établissements depuis l'objet retourné
            const establishmentsArray = result.establishments || [];

            setEstablishments(establishmentsArray);

            // Calculate stats
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
                            <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Gestion des Établissements</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-12">
                {/* Stats */}
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

                {/* Table */}
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
            </main>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { Wrench, CheckCircle2, DollarSign, Plus, ArrowRight, Wallet, Activity, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState({
        todayRepairs: 0,
        readyRepairs: 0,
        todayRevenue: 0,
        monthRevenue: 0,
        customRevenue: 0,
    });
    const [recentRepairs, setRecentRepairs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [establishmentId, setEstablishmentId] = useState<string | null>(null);
    const [revenueFilter, setRevenueFilter] = useState<'today' | 'month' | 'custom'>('today');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: establishment } = await supabase
                    .from('establishments')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (!establishment) return;
                setEstablishmentId(establishment.id);

                const { data: repairs } = await supabase
                    .from('repairs')
                    .select(`
            *,
            client:clients(name)
          `)
                    .eq('establishment_id', establishment.id)
                    .order('created_at', { ascending: false });

                if (repairs) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const todayRepairs = repairs.filter(r =>
                        new Date(r.created_at) >= today
                    ).length;

                    const readyRepairs = repairs.filter(r =>
                        r.status === 'pret_recup'
                    ).length;

                    const todayRevenue = repairs
                        .filter(r =>
                            new Date(r.created_at) >= today &&
                            r.payment_status === 'paid' &&
                            r.status !== 'annule'
                        )
                        .reduce((sum, r) => sum + parseFloat(r.paid_amount || 0), 0);

                    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    const monthRevenue = repairs
                        .filter(r =>
                            new Date(r.created_at) >= firstDayOfMonth &&
                            r.payment_status === 'paid' &&
                            r.status !== 'annule'
                        )
                        .reduce((sum, r) => sum + parseFloat(r.paid_amount || 0), 0);

                    let customRevenue = 0;
                    if (customStartDate && customEndDate) {
                        const startDate = new Date(customStartDate);
                        const endDate = new Date(customEndDate);
                        endDate.setHours(23, 59, 59, 999);

                        customRevenue = repairs
                            .filter(r => {
                                const repairDate = new Date(r.created_at);
                                return repairDate >= startDate &&
                                    repairDate <= endDate &&
                                    r.payment_status === 'paid' &&
                                    r.status !== 'annule';
                            })
                            .reduce((sum, r) => sum + parseFloat(r.paid_amount || 0), 0);
                    }

                    setStats({
                        todayRepairs,
                        readyRepairs,
                        todayRevenue,
                        monthRevenue,
                        customRevenue,
                    });

                    setRecentRepairs(repairs.slice(0, 8));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [customStartDate, customEndDate]);

    const statusColors: Record<string, string> = {
        nouveau: 'bg-blue-50 text-blue-600',
        diagnostic: 'bg-amber-50 text-amber-600',
        en_reparation: 'bg-indigo-50 text-indigo-600',
        pret_recup: 'bg-emerald-50 text-emerald-600',
        recupere: 'bg-neutral-50 text-neutral-400',
        annule: 'bg-red-50 text-red-600',
    };

    const statusLabels: Record<string, string> = {
        nouveau: 'Nouveau',
        diagnostic: 'Diagnostic',
        en_reparation: 'Réparation',
        pret_recup: 'Terminé',
        recupere: 'Livré',
        annule: 'Annulé',
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
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.1 }
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
            className="max-w-[1400px] mx-auto"
        >
            {/* Top Bar / Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-2"
                    >
                        Tableau de bord
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-lg text-neutral-500 font-medium"
                    >
                        Voici ce qu&apos;il se passe dans votre boutique aujourd&apos;hui.
                    </motion.p>
                </div>
                <motion.div variants={itemVariants}>
                    <Button
                        onClick={() => router.push('/dashboard/repairs')}
                        className="h-14 px-8 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-xl transition-all active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5 mr-3" />
                        Nouvelle Réparation
                    </Button>
                </motion.div>
            </div>

            {/* Stats Grid - Large Rounded Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <motion.div
                    variants={itemVariants}
                    className="bg-card p-8 rounded-[2.5rem] shadow-soft border border-neutral-100 dark:border-neutral-800 hover:shadow-medium transition-all group"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/10 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Activity size={28} />
                        </div>
                    </div>
                    <p className="text-neutral-400 text-sm font-bold uppercase tracking-widest mb-1">Prises en charge</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-foreground">{stats.todayRepairs}</h3>
                        <span className="text-neutral-400 font-bold mb-1">Aujourd&apos;hui</span>
                    </div>
                    <button
                        onClick={() => router.push(`/dashboard/repairs`)}
                        className="mt-6 flex items-center text-primary font-bold text-sm hover:gap-2 transition-all"
                    >
                        Voir les réparations <ArrowRight size={16} className="ml-1" />
                    </button>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="bg-card p-8 rounded-[2.5rem] shadow-soft border border-neutral-100 dark:border-neutral-800 hover:shadow-medium transition-all group"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CheckCircle2 size={28} />
                        </div>
                    </div>
                    <p className="text-neutral-400 text-sm font-bold uppercase tracking-widest mb-1">Prêtes à récupérer</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-foreground">{stats.readyRepairs}</h3>
                        <span className="text-neutral-400 font-bold mb-1">Appareils</span>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/repairs')}
                        className="mt-6 flex items-center text-primary font-bold text-sm hover:gap-2 transition-all"
                    >
                        Gérer les remises <ArrowRight size={16} className="ml-1" />
                    </button>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="bg-neutral-900 dark:bg-white p-8 rounded-[2.5rem] shadow-heavy text-white dark:text-black relative overflow-hidden group col-span-1 md:col-span-2 lg:col-span-1"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[80px] -mr-16 -mt-16" />

                    <div className="flex justify-between items-center mb-6">
                        <div className="w-14 h-14 bg-white/10 dark:bg-black/5 backdrop-blur-md text-primary rounded-2xl flex items-center justify-center">
                            <Wallet size={28} />
                        </div>
                        <div className="flex gap-1.5 p-1 bg-white/5 dark:bg-black/5 rounded-xl border border-white/5 dark:border-black/5">
                            {(['today', 'month'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setRevenueFilter(f)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${revenueFilter === f ? 'bg-white dark:bg-black text-black dark:text-white shadow-xl' : 'text-neutral-400 hover:text-white dark:hover:text-black'}`}
                                >
                                    {f === 'today' ? 'Jour' : 'Mois'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="text-neutral-400 text-sm font-bold uppercase tracking-widest mb-1">
                        Chiffre d&apos;affaires {revenueFilter === 'month' && 'du mois'}
                    </p>
                    <h3 className="text-4xl font-black mb-1">
                        {revenueFilter === 'today' ? `${stats.todayRevenue.toLocaleString('fr-DZ')} DA` : `${stats.monthRevenue.toLocaleString('fr-DZ')} DA`}
                    </h3>
                    <p className="text-xs text-neutral-500 font-medium">Paiements confirmés encaissés.</p>

                    <button
                        onClick={() => router.push('/dashboard/invoices')}
                        className="mt-8 py-3 w-full bg-white/5 dark:bg-black/5 hover:bg-white/10 dark:hover:bg-black/10 rounded-xl text-sm font-bold transition-all border border-white/5 dark:border-black/5"
                    >
                        Afficher les rapports financiers
                    </button>
                </motion.div>
            </div>

            {/* Recent Activity Table */}
            <motion.div
                variants={itemVariants}
                className="bg-card rounded-[2.5rem] shadow-soft border border-neutral-100 dark:border-neutral-800 overflow-hidden"
            >
                <div className="p-8 border-b border-neutral-50 dark:border-neutral-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center">
                            <Clock size={20} />
                        </div>
                        <h3 className="font-bold text-xl text-foreground tracking-tight">Activité Récente</h3>
                    </div>
                    <Button variant="ghost" size="sm" className="font-bold text-primary rounded-xl" onClick={() => router.push('/dashboard/repairs')}>
                        Tout voir
                    </Button>
                </div>

                {recentRepairs.length === 0 ? (
                    <div className="p-20 text-center">
                        <Wrench className="w-16 h-16 text-neutral-100 dark:text-neutral-800 mx-auto mb-6" />
                        <p className="text-neutral-400 font-bold mb-6">Aucun dossier en cours</p>
                        <Button onClick={() => router.push('/dashboard/repairs')} className="rounded-2xl h-12">
                            Lancer une première réparation
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#FBFBFD] dark:bg-neutral-900/50 text-neutral-400 text-[11px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Référence</th>
                                    <th className="px-8 py-5">Client & Appareil</th>
                                    <th className="px-8 py-5">État actuel</th>
                                    <th className="px-8 py-5 text-right">Montant</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                                {recentRepairs.map((repair) => (
                                    <tr
                                        key={repair.id}
                                        className="group hover:bg-[#FBFBFD] dark:hover:bg-neutral-900/50 transition-all cursor-pointer"
                                        onClick={() => router.push('/dashboard/repairs')}
                                    >
                                        <td className="px-8 py-6 font-mono text-neutral-400 text-xs">
                                            #{repair.code}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-foreground mb-0.5">{repair.client?.name || 'Inconnu'}</div>
                                            <div className="text-neutral-400 text-xs font-medium">{repair.item}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`${statusColors[repair.status]} dark:bg-opacity-20 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tight`}>
                                                {statusLabels[repair.status]}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-foreground">
                                            {(repair.payment_status === 'paid' ? parseFloat(repair.paid_amount || 0) : parseFloat(repair.price || 0)).toLocaleString('fr-DZ')} <span className="text-[10px] text-neutral-400">DA</span>
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

'use client';

import { useEffect, useState } from 'react';
import { Loader2, Download, Eye, DollarSign, Calendar, Filter, Smartphone, User, History, Check, X, TrendingUp, CreditCard, Wallet, Percent } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export default function InvoicesPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [revenueFilter, setRevenueFilter] = useState<'today' | 'month' | 'custom'>('today');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [stats, setStats] = useState({
        todayTotal: 0,
        monthTotal: 0,
        customTotal: 0,
        todayCash: 0,
        monthCash: 0,
        customCash: 0,
        todayBaridimob: 0,
        monthBaridimob: 0,
        customBaridimob: 0,
        todayCount: 0,
        monthCount: 0,
        customCount: 0,
        todayCost: 0,
        monthCost: 0,
        customCost: 0,
        todayProfit: 0,
        monthProfit: 0,
        customProfit: 0,
    });

    useEffect(() => {
        fetchPayments();
    }, [customStartDate, customEndDate]);

    const fetchPayments = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('establishment_id')
                .eq('user_id', user.id)
                .single();

            if (!profile) return;
            const currentEstId = profile.establishment_id;

            const { data: repairsData } = await supabase
                .from('repairs')
                .select('id')
                .eq('establishment_id', currentEstId);

            if (!repairsData || repairsData.length === 0) {
                setLoading(false);
                return;
            }

            const repairIds = repairsData.map(r => r.id);

            const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select(`
                    *,
                    repair:repairs(
                        code,
                        item,
                        status,
                        cost_price,
                        profit,
                        establishment_id,
                        client:clients(name, phone)
                    )
                `)
                .in('repair_id', repairIds)
                .order('created_at', { ascending: false });

            if (paymentsError) throw paymentsError;

            if (paymentsData) {
                setPayments(paymentsData);
                const validPayments = paymentsData.filter(p => p.repair?.status !== 'annule');
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

                const calculatePeriodStats = (filterFn: (p: any) => boolean) => {
                    const periodPayments = validPayments.filter(filterFn);
                    return {
                        total: periodPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
                        cash: periodPayments.filter(p => p.payment_method === 'cash').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
                        baridimob: periodPayments.filter(p => p.payment_method === 'baridimob').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
                        count: periodPayments.length,
                        cost: periodPayments.reduce((sum, p) => sum + parseFloat(p.repair?.cost_price || 0), 0),
                        profit: periodPayments.reduce((sum, p) => sum + parseFloat(p.repair?.profit || 0), 0),
                    };
                };

                const todayStats = calculatePeriodStats(p => new Date(p.created_at) >= today);
                const monthStats = calculatePeriodStats(p => new Date(p.created_at) >= firstDayOfMonth);

                let customStats = { total: 0, cash: 0, baridimob: 0, count: 0, cost: 0, profit: 0 };
                if (customStartDate && customEndDate) {
                    const startDate = new Date(customStartDate);
                    const endDate = new Date(customEndDate);
                    endDate.setHours(23, 59, 59, 999);
                    customStats = calculatePeriodStats(p => {
                        const paymentDate = new Date(p.created_at);
                        return paymentDate >= startDate && paymentDate <= endDate;
                    });
                }

                setStats({
                    todayTotal: todayStats.total,
                    monthTotal: monthStats.total,
                    customTotal: customStats.total,
                    todayCash: todayStats.cash,
                    monthCash: monthStats.cash,
                    customCash: customStats.cash,
                    todayBaridimob: todayStats.baridimob,
                    monthBaridimob: monthStats.baridimob,
                    customBaridimob: customStats.baridimob,
                    todayCount: todayStats.count,
                    monthCount: monthStats.count,
                    customCount: customStats.count,
                    todayCost: todayStats.cost,
                    monthCost: monthStats.cost,
                    customCost: customStats.cost,
                    todayProfit: todayStats.profit,
                    monthProfit: monthStats.profit,
                    customProfit: customStats.profit,
                });
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
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
            transition: { duration: 0.6, staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    const currentRevenue = revenueFilter === 'today' ? stats.todayTotal : revenueFilter === 'month' ? stats.monthTotal : stats.customTotal;
    const currentProfit = revenueFilter === 'today' ? stats.todayProfit : revenueFilter === 'month' ? stats.monthProfit : stats.customProfit;
    const currentCash = revenueFilter === 'today' ? stats.todayCash : revenueFilter === 'month' ? stats.monthCash : stats.customCash;
    const currentBaridi = revenueFilter === 'today' ? stats.todayBaridimob : revenueFilter === 'month' ? stats.monthBaridimob : stats.customBaridimob;
    const currentCost = revenueFilter === 'today' ? stats.todayCost : revenueFilter === 'month' ? stats.monthCost : stats.customCost;
    const currentMargin = currentRevenue > 0 ? ((currentProfit / currentRevenue) * 100).toFixed(1) : 0;

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
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Trésorerie & Billing</span>
                    </motion.div>
                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-2"
                    >
                        Finances & Factures
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-lg text-neutral-500 font-medium"
                    >
                        Suivez votre rentabilité et encaissez vos prestations.
                    </motion.p>
                </div>

                <motion.div variants={itemVariants} className="flex gap-2 p-1.5 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                    {['today', 'month', 'custom'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setRevenueFilter(f as any)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${revenueFilter === f ? 'bg-neutral-900 text-white shadow-lg' : 'text-neutral-400 hover:text-neutral-600'}`}
                        >
                            {f === 'today' ? 'Jour' : f === 'month' ? 'Mois' : 'Période'}
                        </button>
                    ))}
                </motion.div>
            </div>

            {revenueFilter === 'custom' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-6 bg-white rounded-3xl border border-neutral-100 shadow-sm font-inter"
                >
                    <div className="space-y-2 font-inter">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 font-inter">Date de début</label>
                        <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-neutral-50 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-[#FBFBFD] font-bold font-inter" />
                    </div>
                    <div className="space-y-2 font-inter">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 font-inter font-inter">Date de fin</label>
                        <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-neutral-50 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-[#FBFBFD] font-bold font-inter font-inter" />
                    </div>
                </motion.div>
            )}

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-neutral-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] group-hover:bg-primary/40 transition-all" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                            <TrendingUp size={24} className="text-primary" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">Chiffre d'affaires</div>
                        <div className="text-3xl font-black">{currentRevenue.toLocaleString()} <span className="text-sm font-bold text-white/40">DA</span></div>
                    </div>
                </div>

                <div className="bg-emerald-500 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 blur-[60px] group-hover:scale-125 transition-transform" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                            <Wallet size={24} />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-2 font-inter">Bénéfice Net</div>
                        <div className="text-3xl font-black font-inter">{currentProfit.toLocaleString()} <span className="text-sm font-bold text-white/50 font-inter">DA</span></div>
                        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black font-inter uppercase tracking-tight">
                            <Percent size={10} /> {currentMargin}% de marge
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-sm relative group hover:shadow-xl transition-all">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform">
                        <CreditCard size={24} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2 font-inter">Modes de paiement</div>
                    <div className="space-y-3 font-inter">
                        <div className="flex justify-between items-center font-inter">
                            <span className="text-xs font-bold text-neutral-500 font-inter">💵 Cash</span>
                            <span className="text-sm font-black text-neutral-900 font-inter font-inter">{currentCash.toLocaleString()} DA</span>
                        </div>
                        <div className="flex justify-between items-center font-inter">
                            <span className="text-xs font-bold text-neutral-500 font-inter">📱 BaridiMob</span>
                            <span className="text-sm font-black text-neutral-900 font-inter">{currentBaridi.toLocaleString()} DA</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-sm relative group hover:shadow-xl transition-all">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 text-rose-500 group-hover:scale-110 transition-transform font-inter">
                        <Smartphone size={24} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2 font-inter">Dépenses Pièces</div>
                    <div className="text-3xl font-black text-neutral-900 font-inter">{currentCost.toLocaleString()} <span className="text-sm font-bold text-neutral-300 font-inter font-inter font-inter">DA</span></div>
                    <div className="mt-4 text-[10px] font-bold text-neutral-400 uppercase tracking-tight font-inter">Coût total des interventions</div>
                </div>
            </motion.div>

            {/* Transactions Table */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-100 overflow-hidden font-inter">
                <div className="overflow-x-auto font-inter">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#FBFBFD] text-neutral-400 text-[11px] font-black uppercase tracking-widest font-inter">
                            <tr>
                                <th className="px-8 py-6 font-inter">Transaction</th>
                                <th className="px-8 py-6 font-inter font-inter">Détails Client</th>
                                <th className="px-8 py-6 font-inter font-inter">Méthode</th>
                                <th className="px-8 py-6 font-inter font-inter">Montant</th>
                                <th className="px-8 py-6 font-inter font-inter">État</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 font-inter font-inter">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center font-inter">
                                        <History className="w-12 h-12 text-neutral-100 mx-auto mb-4 font-inter font-inter" />
                                        <p className="text-neutral-400 font-bold font-inter">Aucun flux financier enregistré.</p>
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="group hover:bg-[#FBFBFD]/50 transition-all border-l-4 border-l-transparent hover:border-l-emerald-300">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400">
                                                    <CreditCard size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-neutral-900 font-bold">{new Date(payment.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                                                    <div className="font-mono text-[10px] text-neutral-400 mt-0.5 font-bold uppercase tracking-widest">REF: {payment.repair?.code || '---'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-neutral-700 font-bold">{payment.repair?.client?.name || 'N/A'}</div>
                                            <div className="text-neutral-400 text-[10px] mt-0.5 font-medium">{payment.repair?.item || 'N/A'}</div>
                                        </td>
                                        <td className="px-8 py-6 font-inter">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${payment.payment_method === 'baridimob' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {payment.payment_method === 'baridimob' ? '📱 BaridiMob' : '💵 Espèces'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`text-base font-black ${payment.repair?.status === 'annule' ? 'text-neutral-300 line-through' : 'text-neutral-900 font-inter font-inter'}`}>
                                                {parseFloat(payment.amount).toLocaleString()} <span className="text-[10px] text-neutral-400 font-inter">DA</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-inter">
                                            {payment.repair?.status === 'annule' ? (
                                                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[10px] uppercase tracking-widest">
                                                    <X size={12} strokeWidth={3} /> Annulé
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase tracking-widest font-inter">
                                                    <Check size={12} strokeWidth={3} /> Confirmé
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}

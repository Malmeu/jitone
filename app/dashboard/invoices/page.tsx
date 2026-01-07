'use client';

import { useEffect, useState } from 'react';
import { Loader2, Download, Eye, DollarSign, Calendar, Filter, Smartphone, User, History, Check, X, TrendingUp, CreditCard, Wallet, Percent, Box } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import * as XLSX from 'xlsx';

const FAULT_TYPES = [
    { id: 'ecran', label: 'Écran / Tactile', color: '#3b82f6' },
    { id: 'batterie', label: 'Batterie', color: '#10b981' },
    { id: 'connecteur', label: 'Connecteur de Charge', color: '#f59e0b' },
    { id: 'reseau', label: 'Réseau / Wifi', color: '#6366f1' },
    { id: 'camera', label: 'Caméra / Lentille', color: '#ec4899' },
    { id: 'boutons', label: 'Boutons / Micro / HP', color: '#8b5cf6' },
    { id: 'logiciel', label: 'Déblocage / Logiciel', color: '#06b6d4' },
    { id: 'eau', label: 'Dégât des eaux', color: '#14b8a6' },
    { id: 'carte_mere', label: 'Micro-Soudure / Carte Mère', color: '#f43f5e' },
    { id: 'autre', label: 'Autre panne', color: '#94a3b8' }
];

export default function InvoicesPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [revenueFilter, setRevenueFilter] = useState<'today' | 'month' | 'custom'>('today');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [stats, setStats] = useState({
        todayTotal: 0, todayCash: 0, todayBaridi: 0, todayCount: 0, todayCost: 0, todayProfit: 0, todayExpenses: 0,
        monthTotal: 0, monthCash: 0, monthBaridi: 0, monthCount: 0, monthCost: 0, monthProfit: 0, monthExpenses: 0,
        customTotal: 0, customCash: 0, customBaridi: 0, customCount: 0, customCost: 0, customProfit: 0, customExpenses: 0,
    });
    const [faultStats, setFaultStats] = useState<any[]>([]);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseData, setExpenseData] = useState({ title: '', amount: '', category: 'autre', date: new Date().toISOString().split('T')[0] });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [establishment, setEstablishment] = useState<any>(null);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile } = await supabase.from('profiles').select('establishment_id').eq('user_id', user.id).single();
            if (!profile) return;

            const { error } = await supabase.from('expenses').insert({
                establishment_id: profile.establishment_id,
                title: expenseData.title,
                amount: parseFloat(expenseData.amount),
                category: expenseData.category,
                expense_date: expenseData.date
            });

            if (error) throw error;
            setShowExpenseModal(false);
            setExpenseData({ title: '', amount: '', category: 'autre', date: new Date().toISOString().split('T')[0] });
            fetchPayments();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'ajout de la dépense");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [customStartDate, customEndDate, revenueFilter]);

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

            const { data: estData } = await supabase
                .from('establishments')
                .select('*')
                .eq('id', currentEstId)
                .single();
            setEstablishment(estData);

            // Fetch repairs for fault stats
            const { data: allRepairs } = await supabase
                .from('repairs')
                .select('fault_type, created_at, status')
                .eq('establishment_id', currentEstId);

            // Fetch expenses
            const { data: expensesData } = await supabase
                .from('expenses')
                .select('*')
                .eq('establishment_id', currentEstId);

            // Fetch sales
            const { data: salesData, error: salesError } = await supabase
                .from('sales')
                .select('*, items:sale_items(*, inventory:inventory(cost_price))')
                .eq('establishment_id', currentEstId)
                .order('created_at', { ascending: false });

            const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select(`
                    *,
                    repair:repairs(
                        code, item, status, cost_price, profit, establishment_id, client:clients(name, phone)
                    )
                `)
                .eq('establishment_id', currentEstId)
                .order('created_at', { ascending: false });

            if (paymentsError) throw paymentsError;
            if (salesError) throw salesError;

            if (paymentsData) {
                setPayments(paymentsData);
                const validPayments = paymentsData.filter(p => p.repair?.status !== 'annule');
                const today = new Date(); today.setHours(0, 0, 0, 0);
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

                const getPeriodStats = (filterFn: (d: Date) => boolean) => {
                    const periodPayments = validPayments.filter(p => filterFn(new Date(p.created_at)));
                    const periodSales = (salesData || []).filter(s => filterFn(new Date(s.created_at)));
                    const periodExpenses = (expensesData || []).filter(e => filterFn(new Date(e.expense_date)));

                    const salesTotal = periodSales.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
                    const salesCost = periodSales.reduce((sum, s) => {
                        const itemsCost = s.items?.reduce((iSum: number, item: any) => iSum + (item.quantity * (item.inventory?.cost_price || 0)), 0) || 0;
                        return sum + itemsCost;
                    }, 0);
                    const salesProfit = salesTotal - salesCost;

                    return {
                        total: periodPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) + salesTotal,
                        cash: periodPayments.filter(p => p.payment_method === 'cash').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) +
                            periodSales.filter(s => s.payment_method === 'cash').reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0),
                        baridi: periodPayments.filter(p => p.payment_method === 'baridimob').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) +
                            periodSales.filter(s => s.payment_method === 'card').reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0),
                        count: periodPayments.length + periodSales.length,
                        cost: periodPayments.reduce((sum, p) => sum + parseFloat(p.repair?.cost_price || 0), 0) + salesCost,
                        profit: periodPayments.reduce((sum, p) => sum + parseFloat(p.repair?.profit || 0), 0) + salesProfit,
                        expenses: periodExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
                    };
                };

                const todayStats = getPeriodStats(d => d >= today);
                const monthStats = getPeriodStats(d => d >= firstDayOfMonth);

                let customStats = { total: 0, cash: 0, baridi: 0, count: 0, cost: 0, profit: 0, expenses: 0 };
                if (customStartDate && customEndDate) {
                    const start = new Date(customStartDate);
                    const end = new Date(customEndDate); end.setHours(23, 59, 59, 999);
                    customStats = getPeriodStats(d => d >= start && d <= end);
                }

                setStats({
                    todayTotal: todayStats.total, todayCash: todayStats.cash, todayBaridi: todayStats.baridi, todayCount: todayStats.count, todayCost: todayStats.cost, todayProfit: todayStats.profit, todayExpenses: todayStats.expenses,
                    monthTotal: monthStats.total, monthCash: monthStats.cash, monthBaridi: monthStats.baridi, monthCount: monthStats.count, monthCost: monthStats.cost, monthProfit: monthStats.profit, monthExpenses: monthStats.expenses,
                    customTotal: customStats.total, customCash: customStats.cash, customBaridi: customStats.baridi, customCount: customStats.count, customCost: customStats.cost, customProfit: customStats.profit, customExpenses: customStats.expenses,
                });

                // Calculate Fault Stats for current filter
                const filterDate = revenueFilter === 'today' ? today : revenueFilter === 'month' ? firstDayOfMonth : (customStartDate ? new Date(customStartDate) : new Date(0));
                const filteredRepairs = (allRepairs || []).filter(r => new Date(r.created_at) >= filterDate && r.status !== 'annule');

                const faultCounts: Record<string, number> = {};
                filteredRepairs.forEach(r => {
                    const type = r.fault_type || 'autre';
                    faultCounts[type] = (faultCounts[type] || 0) + 1;
                });

                const faultData = Object.entries(faultCounts)
                    .map(([id, count]) => {
                        const typeInfo = FAULT_TYPES.find(t => t.id === id) || FAULT_TYPES[FAULT_TYPES.length - 1];
                        return { name: typeInfo.label, value: count, color: typeInfo.color };
                    })
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5);

                // Merge and Sort all entries
                const combined = [
                    ...paymentsData.map(p => ({ ...p, type: 'repair' })),
                    ...(salesData || []).map(s => ({ ...s, type: 'sale', amount: s.total_amount }))
                ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                setPayments(combined);
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
    const currentBaridi = revenueFilter === 'today' ? stats.todayBaridi : revenueFilter === 'month' ? stats.monthBaridi : stats.customBaridi;
    const currentCost = revenueFilter === 'today' ? stats.todayCost : revenueFilter === 'month' ? stats.monthCost : stats.customCost;
    const currentExpenses = revenueFilter === 'today' ? stats.todayExpenses : revenueFilter === 'month' ? stats.monthExpenses : stats.customExpenses;
    const currentNetProfit = currentProfit - currentExpenses;
    const currentMargin = currentRevenue > 0 ? ((currentNetProfit / currentRevenue) * 100).toFixed(1) : 0;

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

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <Button
                        onClick={() => setShowExpenseModal(true)}
                        className="bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] py-4 px-6 rounded-2xl shadow-lg border-none"
                    >
                        <Wallet size={16} className="mr-2" /> Ajouter une charge
                    </Button>
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

                    <Button
                        onClick={() => {
                            if (establishment?.subscription_plan !== 'premium') {
                                alert("Cette fonctionnalité nécessite le forfait Premium.");
                                return;
                            }
                            const data = payments.map(p => ({
                                Date: new Date(p.created_at).toLocaleDateString(),
                                Type: p.type === 'repair' ? 'Réparation' : 'Vente Produit',
                                Référence: p.type === 'repair' ? p.repair?.code : `VNT-${p.id.slice(0, 5)}`,
                                Client: p.type === 'repair' ? p.repair?.client?.name : (p.client_name || 'Client passage'),
                                Détails: p.type === 'repair' ? p.repair?.item : p.items?.map((i: any) => `${i.quantity}x ${i.item_name}`).join(', '),
                                Montant: p.amount,
                                Méthode: p.payment_method === 'cash' ? 'Espèces' : (p.payment_method === 'baridimob' || p.payment_method === 'card' ? 'Carte/Baridi' : p.payment_method),
                                Statut: p.repair?.status === 'annule' ? 'Annulé' : 'Confirmé'
                            }));
                            const ws = XLSX.utils.json_to_sheet(data);
                            const wb = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(wb, ws, "Transactions");
                            XLSX.writeFile(wb, `Export_Comptable_${new Date().toISOString().split('T')[0]}.xlsx`);
                        }}
                        className={`${establishment?.subscription_plan === 'premium' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-neutral-200 text-neutral-400 group'} text-white font-black uppercase tracking-widest text-[10px] py-4 px-6 rounded-2xl shadow-lg border-none relative`}
                    >
                        <Download size={16} className="mr-2" />
                        Export Comptable
                        {establishment?.subscription_plan !== 'premium' && (
                            <span className="absolute -top-2 -right-2 bg-primary text-white text-[8px] px-1.5 py-0.5 rounded-full shadow-lg">PRO</span>
                        )}
                    </Button>
                </div>
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
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-2 font-inter">Marge Nets Réelle</div>
                        <div className="text-3xl font-black font-inter">{currentNetProfit.toLocaleString()} <span className="text-sm font-bold text-white/50 font-inter">DA</span></div>
                        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black font-inter uppercase tracking-tight">
                            <Percent size={10} /> {currentMargin}% de marge
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-sm relative group hover:shadow-xl transition-all">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 text-rose-500 group-hover:scale-110 transition-transform font-inter">
                        <Smartphone size={24} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2 font-inter">Coûts Totaux</div>
                    <div className="space-y-3 font-inter">
                        <div className="flex justify-between items-center font-inter">
                            <span className="text-xs font-bold text-neutral-500 font-inter">🔧 Pièces</span>
                            <span className="text-sm font-black text-rose-500 font-inter">{currentCost.toLocaleString()} DA</span>
                        </div>
                        <div className="flex justify-between items-center font-inter">
                            <span className="text-xs font-bold text-neutral-500 font-inter">🏠 Charges</span>
                            <span className="text-sm font-black text-rose-500 font-inter font-inter">{currentExpenses.toLocaleString()} DA</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-sm relative group hover:shadow-xl transition-all">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-500 group-hover:scale-110 transition-transform font-inter">
                        <History size={24} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2 font-inter font-inter">Volume d'activité</div>
                    <div className="text-3xl font-black text-neutral-900 font-inter">{stats[`${revenueFilter}Count` as keyof typeof stats] || 0} <span className="text-sm font-bold text-neutral-300 font-inter">Actions</span></div>
                    <div className="mt-4 text-[10px] font-bold text-neutral-400 uppercase tracking-tight font-inter">Nombre total de prestations</div>
                </div>
            </motion.div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 font-inter">
                <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-sm font-inter">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-neutral-900">Top 5 des Pannes</h3>
                            <p className="text-xs text-neutral-500 font-medium">Répartition par type de panne sur la période.</p>
                        </div>
                        <Smartphone size={24} className="text-primary/20" />
                    </div>
                    <div className="h-[300px] w-full">
                        {faultStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={faultStats} layout="vertical" margin={{ left: 40, right: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={10} width={120} fontWeight="bold" />
                                    <Tooltip
                                        cursor={{ fill: '#FBFBFD' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                                        {faultStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-2">
                                <History size={32} strokeWidth={1} />
                                <span className="text-xs font-bold uppercase tracking-widest">Aucune donnée de panne</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-neutral-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px]" />
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8 font-inter">
                            <div>
                                <h3 className="text-xl font-bold font-inter">Marge Nette de l'Atelier</h3>
                                <p className="text-xs text-white/50 font-medium font-inter">Profit après déduction de toutes les charges.</p>
                            </div>
                            <Percent size={24} className="text-primary/40" />
                        </div>

                        <div className="flex-1 flex flex-col justify-center space-y-6 font-inter">
                            <div className="flex justify-between items-end border-b border-white/10 pb-4 font-inter">
                                <span className="text-sm font-bold text-white/60 font-inter">Bénéfice Brut (Prix - Pièces)</span>
                                <span className="text-xl font-black">{currentProfit.toLocaleString()} DA</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                <span className="text-sm font-bold text-white/60">Total des Charges (Loyer, Elec, etc.)</span>
                                <span className="text-xl font-black text-rose-400">-{currentExpenses.toLocaleString()} DA</span>
                            </div>
                            <div className="flex justify-between items-end pt-2">
                                <span className="text-sm font-black text-primary font-inter uppercase tracking-widest">Résultat Net</span>
                                <span className="text-4xl font-black text-emerald-400 font-inter uppercase tracking-widest">{currentNetProfit.toLocaleString()} DA</span>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10 text-[10px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">
                            Ce calcul prend en compte le prix client payé, le coût des pièces utilisées et les charges fixes enregistrées.
                        </div>
                    </div>
                </motion.div>
            </div>

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
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payment.type === 'sale' ? 'bg-amber-50 text-amber-500' : 'bg-neutral-50 text-neutral-400'}`}>
                                                    {payment.type === 'sale' ? <Box size={18} /> : <CreditCard size={18} />}
                                                </div>
                                                <div>
                                                    <div className="text-neutral-900 font-bold">{new Date(payment.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                                                    <div className="font-mono text-[10px] text-neutral-400 mt-0.5 font-bold uppercase tracking-widest">
                                                        {payment.type === 'repair' ? `REF: ${payment.repair?.code || '---'}` : `VENTE: ${payment.id.slice(0, 5).toUpperCase()}`}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-neutral-700 font-bold">
                                                {payment.type === 'repair' ? (payment.repair?.client?.name || 'N/A') : (payment.client_name || 'Client de passage')}
                                            </div>
                                            <div className="text-neutral-400 text-[10px] mt-0.5 font-medium line-clamp-1 max-w-[200px]">
                                                {payment.type === 'repair' ? (payment.repair?.item || 'N/A') : payment.items?.map((i: any) => `${i.quantity}x ${i.item_name}`).join(', ')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-inter">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${payment.payment_method === 'baridimob' || payment.payment_method === 'card' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {payment.payment_method === 'baridimob' || payment.payment_method === 'card' ? '📱 Carte/Baridi' : '💵 Espèces'}
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

            <AnimatePresence>
                {showExpenseModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowExpenseModal(false)}
                            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-neutral-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold">Nouvelle Charge</h3>
                                    <p className="text-xs text-neutral-500">Enregistrez une dépense d'exploitation.</p>
                                </div>
                                <button onClick={() => setShowExpenseModal(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleAddExpense} className="p-8 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Libellé</label>
                                    <input required type="text" value={expenseData.title} onChange={e => setExpenseData({ ...expenseData, title: e.target.value })} className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 font-bold" placeholder="ex: Loyer, Electricité..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Montant (DA)</label>
                                        <input required type="number" value={expenseData.amount} onChange={e => setExpenseData({ ...expenseData, amount: e.target.value })} className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 font-bold" placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Date</label>
                                        <input required type="date" value={expenseData.date} onChange={e => setExpenseData({ ...expenseData, date: e.target.value })} className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 font-bold" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Catégorie</label>
                                    <select value={expenseData.category} onChange={e => setExpenseData({ ...expenseData, category: e.target.value })} className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 font-bold">
                                        <option value="loyer">🏠 Loyer</option>
                                        <option value="stock">📦 Stock / Outillage</option>
                                        <option value="pieces">🔧 Pièces détachées</option>
                                        <option value="appareil_endommage">📱 Appareil / pièces endommagé</option>
                                        <option value="marketing">📢 Marketing</option>
                                        <option value="abonnement">💳 Abonnement / Logiciel</option>
                                        <option value="personnel">👥 Personnel / Salaires</option>
                                        <option value="autre">📝 Autre</option>
                                    </select>
                                </div>
                                <Button disabled={isSubmitting} type="submit" className="w-full py-6 mt-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl text-xs">
                                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Check size={18} className="mr-2" />} Enregistrer la dépense
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

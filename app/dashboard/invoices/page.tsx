'use client';

import { useEffect, useState } from 'react';
import { Loader2, Download, Eye, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

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

            const { data: establishmentData } = await supabase
                .from('establishments')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!establishmentData) return;

            // Récupérer d'abord toutes les réparations de l'établissement
            const { data: repairsData } = await supabase
                .from('repairs')
                .select('id')
                .eq('establishment_id', establishmentData.id);

            if (!repairsData || repairsData.length === 0) {
                setLoading(false);
                return;
            }

            const repairIds = repairsData.map(r => r.id);

            // Récupérer tous les paiements pour ces réparations
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

            if (paymentsError) {
                console.error('Payments error:', paymentsError);
                setLoading(false);
                return;
            }

            if (paymentsData) {
                setPayments(paymentsData);

                // Filtrer les paiements des réparations non annulées
                const validPayments = paymentsData.filter(p => p.repair?.status !== 'annule');

                // Dates de référence
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

                // Fonction helper pour calculer les stats d'une période
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

                // Statistiques aujourd'hui
                const todayStats = calculatePeriodStats(p => new Date(p.created_at) >= today);

                // Statistiques du mois
                const monthStats = calculatePeriodStats(p => new Date(p.created_at) >= firstDayOfMonth);

                // Statistiques période personnalisée
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
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900">Factures & Paiements</h1>
                <p className="text-neutral-500">Gérez tous vos paiements et factures</p>
            </div>

            {/* Statistiques - Mobile First */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-gradient-to-br from-primary/10 to-blue-50 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-primary/20">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                        </div>
                        <p className="text-xs md:text-sm font-medium text-neutral-600">Chiffre d'Affaires</p>
                    </div>

                    {/* Filtres de période */}
                    <div className="flex gap-1 md:gap-1.5 mb-3 md:mb-4">
                        <button
                            onClick={() => setRevenueFilter('today')}
                            className={`px-1.5 md:px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${revenueFilter === 'today'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-neutral-600 hover:bg-gray-200'
                                }`}
                        >
                            Jour
                        </button>
                        <button
                            onClick={() => setRevenueFilter('month')}
                            className={`px-1.5 md:px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${revenueFilter === 'month'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-neutral-600 hover:bg-gray-200'
                                }`}
                        >
                            Mois
                        </button>
                        <button
                            onClick={() => setRevenueFilter('custom')}
                            className={`px-1.5 md:px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${revenueFilter === 'custom'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-neutral-600 hover:bg-gray-200'
                                }`}
                        >
                            Période
                        </button>
                    </div>

                    {/* Sélecteurs de dates */}
                    {revenueFilter === 'custom' && (
                        <div className="mb-2 md:mb-3 space-y-2 p-2 bg-white/50 rounded-lg">
                            <div>
                                <label className="block text-xs text-neutral-600 mb-1">Du</label>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="w-full px-2 py-1 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-600 mb-1">Au</label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="w-full px-2 py-1 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    )}

                    {/* Montant */}
                    <p className="text-2xl md:text-3xl font-bold text-neutral-900">
                        {revenueFilter === 'today' && `${stats.todayTotal.toLocaleString('fr-DZ')} DA`}
                        {revenueFilter === 'month' && `${stats.monthTotal.toLocaleString('fr-DZ')} DA`}
                        {revenueFilter === 'custom' && (
                            customStartDate && customEndDate
                                ? `${stats.customTotal.toLocaleString('fr-DZ')} DA`
                                : '- DA'
                        )}
                    </p>

                    {/* Indicateur */}
                    <p className="text-xs text-neutral-500 mt-1">
                        {revenueFilter === 'today' && 'Aujourd\'hui'}
                        {revenueFilter === 'month' && new Date().toLocaleDateString('fr-FR', { month: 'long' })}
                        {revenueFilter === 'custom' && customStartDate && customEndDate && (
                            `${new Date(customStartDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - ${new Date(customEndDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`
                        )}
                    </p>
                </div>

                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-xl">
                            <span className="text-xl md:text-2xl">💵</span>
                        </div>
                        <p className="text-xs md:text-sm font-medium text-neutral-600">Espèces</p>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-neutral-900">
                        {revenueFilter === 'today' && `${stats.todayCash.toLocaleString('fr-DZ')} DA`}
                        {revenueFilter === 'month' && `${stats.monthCash.toLocaleString('fr-DZ')} DA`}
                        {revenueFilter === 'custom' && `${stats.customCash.toLocaleString('fr-DZ')} DA`}
                    </p>
                </div>

                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <span className="text-xl md:text-2xl">📱</span>
                        </div>
                        <p className="text-xs md:text-sm font-medium text-neutral-600">BaridiMob</p>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-neutral-900">
                        {revenueFilter === 'today' && `${stats.todayBaridimob.toLocaleString('fr-DZ')} DA`}
                        {revenueFilter === 'month' && `${stats.monthBaridimob.toLocaleString('fr-DZ')} DA`}
                        {revenueFilter === 'custom' && `${stats.customBaridimob.toLocaleString('fr-DZ')} DA`}
                    </p>
                </div>

                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-xl">
                            <span className="text-xl md:text-2xl">📦</span>
                        </div>
                        <p className="text-xs md:text-sm font-medium text-neutral-600">Coût Total</p>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-neutral-900">
                        {revenueFilter === 'today' && `${stats.todayCost.toLocaleString('fr-DZ')} DA`}
                        {revenueFilter === 'month' && `${stats.monthCost.toLocaleString('fr-DZ')} DA`}
                        {revenueFilter === 'custom' && `${stats.customCost.toLocaleString('fr-DZ')} DA`}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-green-200">
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                        <div className="p-2 bg-green-200 rounded-xl">
                            <span className="text-xl md:text-2xl">💰</span>
                        </div>
                        <p className="text-xs md:text-sm font-medium text-neutral-600">Bénéfice</p>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-green-600">
                        {revenueFilter === 'today' && `${stats.todayProfit.toLocaleString('fr-DZ')} DA`}
                        {revenueFilter === 'month' && `${stats.monthProfit.toLocaleString('fr-DZ')} DA`}
                        {revenueFilter === 'custom' && `${stats.customProfit.toLocaleString('fr-DZ')} DA`}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                        Marge: {
                            revenueFilter === 'today' && stats.todayTotal > 0 ? ((stats.todayProfit / stats.todayTotal) * 100).toFixed(1) :
                                revenueFilter === 'month' && stats.monthTotal > 0 ? ((stats.monthProfit / stats.monthTotal) * 100).toFixed(1) :
                                    revenueFilter === 'custom' && stats.customTotal > 0 ? ((stats.customProfit / stats.customTotal) * 100).toFixed(1) : 0
                        }%
                    </p>
                </div>

                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-xl">
                            <Eye className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                        </div>
                        <p className="text-xs md:text-sm font-medium text-neutral-600">Transactions</p>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-neutral-900">
                        {revenueFilter === 'today' && stats.todayCount}
                        {revenueFilter === 'month' && stats.monthCount}
                        {revenueFilter === 'custom' && stats.customCount}
                    </p>
                </div>
            </div>

            {/* Liste des paiements - Mobile First */}
            <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {payments.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-neutral-500">Aucun paiement enregistré</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs md:text-sm">
                            <thead className="bg-gray-50 text-neutral-500 font-medium">
                                <tr>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left">Date</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left">Code Réparation</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left">Client</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left">Appareil</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left">Méthode</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left">Montant</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-3 md:px-6 py-3 md:py-4 text-neutral-500 text-xs">
                                            {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4 font-mono text-xs text-neutral-600">
                                            {payment.repair?.code || 'N/A'}
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-neutral-900">
                                            {payment.repair?.client?.name || 'N/A'}
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4 text-neutral-700">
                                            <div>
                                                <p>{payment.repair?.item || 'N/A'}</p>
                                                {payment.note && (
                                                    <p className="text-xs text-neutral-500 mt-1 italic">
                                                        📝 {payment.note}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4">
                                            <span className={`px-2 md:px-3 py-1 rounded-lg text-xs font-bold ${payment.payment_method === 'baridimob'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-green-100 text-green-700'
                                                }`}>
                                                {payment.payment_method === 'baridimob' ? '📱 BaridiMob' : '💵 Espèces'}
                                            </span>
                                        </td>
                                        <td className={`px-3 md:px-6 py-3 md:py-4 font-bold ${payment.repair?.status === 'annule' ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
                                            {parseFloat(payment.amount).toLocaleString('fr-DZ')} DA
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4">
                                            {payment.repair?.status === 'annule' ? (
                                                <span className="bg-red-100 text-red-700 px-2 md:px-3 py-1 rounded-lg text-xs font-bold line-through">
                                                    ✗ Annulé
                                                </span>
                                            ) : (
                                                <span className="bg-green-100 text-green-700 px-2 md:px-3 py-1 rounded-lg text-xs font-bold">
                                                    ✓ Payé
                                                </span>
                                            )}
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

'use client';

import { useEffect, useState } from 'react';
import { Loader2, Download, Eye, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

export default function InvoicesPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        cash: 0,
        baridimob: 0,
        count: 0,
        totalCost: 0,
        profit: 0,
    });

    useEffect(() => {
        fetchPayments();
    }, []);

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

                // Calculer les statistiques
                const total = validPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
                const cash = validPayments
                    .filter(p => p.payment_method === 'cash')
                    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
                const baridimob = validPayments
                    .filter(p => p.payment_method === 'baridimob')
                    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

                // Calculer les coûts et bénéfices
                const totalCost = validPayments.reduce((sum, p) => sum + parseFloat(p.repair?.cost_price || 0), 0);
                const profit = validPayments.reduce((sum, p) => sum + parseFloat(p.repair?.profit || 0), 0);

                setStats({
                    total,
                    cash,
                    baridimob,
                    count: validPayments.length,
                    totalCost,
                    profit,
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

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                <div className="bg-gradient-to-br from-primary/10 to-blue-50 rounded-3xl p-6 border border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <DollarSign className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-neutral-600">Chiffre d'Affaires</p>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900">
                        {stats.total.toLocaleString('fr-DZ')} DA
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-xl">
                            <span className="text-2xl">💵</span>
                        </div>
                        <p className="text-sm font-medium text-neutral-600">Espèces</p>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                        {stats.cash.toLocaleString('fr-DZ')} DA
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <span className="text-2xl">📱</span>
                        </div>
                        <p className="text-sm font-medium text-neutral-600">BaridiMob</p>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                        {stats.baridimob.toLocaleString('fr-DZ')} DA
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-xl">
                            <span className="text-2xl">📦</span>
                        </div>
                        <p className="text-sm font-medium text-neutral-600">Coût Total</p>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                        {stats.totalCost.toLocaleString('fr-DZ')} DA
                    </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-200 rounded-xl">
                            <span className="text-2xl">💰</span>
                        </div>
                        <p className="text-sm font-medium text-neutral-600">Bénéfice</p>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                        {stats.profit.toLocaleString('fr-DZ')} DA
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                        Marge: {stats.total > 0 ? ((stats.profit / stats.total) * 100).toFixed(1) : 0}%
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-xl">
                            <Eye className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-sm font-medium text-neutral-600">Transactions</p>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">{stats.count}</p>
                </div>
            </div>

            {/* Liste des paiements */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {payments.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-neutral-500">Aucun paiement enregistré</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-neutral-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4 text-left">Date</th>
                                    <th className="px-6 py-4 text-left">Code Réparation</th>
                                    <th className="px-6 py-4 text-left">Client</th>
                                    <th className="px-6 py-4 text-left">Appareil</th>
                                    <th className="px-6 py-4 text-left">Méthode</th>
                                    <th className="px-6 py-4 text-left">Montant</th>
                                    <th className="px-6 py-4 text-left">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-neutral-500 text-xs">
                                            {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-neutral-600">
                                            {payment.repair?.code || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-neutral-900">
                                            {payment.repair?.client?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-700">
                                            <div>
                                                <p>{payment.repair?.item || 'N/A'}</p>
                                                {payment.note && (
                                                    <p className="text-xs text-neutral-500 mt-1 italic">
                                                        📝 {payment.note}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${payment.payment_method === 'baridimob'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-green-100 text-green-700'
                                                }`}>
                                                {payment.payment_method === 'baridimob' ? '📱 BaridiMob' : '💵 Espèces'}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 font-bold ${payment.repair?.status === 'annule' ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
                                            {parseFloat(payment.amount).toLocaleString('fr-DZ')} DA
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.repair?.status === 'annule' ? (
                                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold line-through">
                                                    ✗ Annulé
                                                </span>
                                            ) : (
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold">
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

'use client';

import { useEffect, useState } from 'react';
import { Wrench, CheckCircle2, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState({
        todayRepairs: 0,
        readyRepairs: 0,
        todayRevenue: 0,
    });
    const [recentRepairs, setRecentRepairs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [establishmentId, setEstablishmentId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Récupérer l'utilisateur connecté
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Récupérer l'établissement
                const { data: establishment } = await supabase
                    .from('establishments')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (!establishment) return;
                setEstablishmentId(establishment.id);

                // Récupérer toutes les réparations
                const { data: repairs } = await supabase
                    .from('repairs')
                    .select(`
            *,
            client:clients(name)
          `)
                    .eq('establishment_id', establishment.id)
                    .order('created_at', { ascending: false });

                if (repairs) {
                    // Calculer les stats
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
                            r.status !== 'annule'  // Exclure les réparations annulées
                        )
                        .reduce((sum, r) => sum + parseFloat(r.paid_amount || 0), 0);

                    setStats({
                        todayRepairs,
                        readyRepairs,
                        todayRevenue,
                    });

                    // Prendre les 5 dernières réparations
                    setRecentRepairs(repairs.slice(0, 5));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const statusColors: Record<string, string> = {
        nouveau: 'bg-gray-100 text-gray-700',
        diagnostic: 'bg-yellow-100 text-yellow-700',
        en_reparation: 'bg-blue-100 text-blue-700',
        pret_recup: 'bg-green-100 text-green-700',
        recupere: 'bg-neutral-100 text-neutral-600',
        annule: 'bg-red-100 text-red-700',
    };

    const statusLabels: Record<string, string> = {
        nouveau: 'Nouveau',
        diagnostic: 'Diagnostic',
        en_reparation: 'En cours',
        pret_recup: 'Prêt',
        recupere: 'Récupéré',
        annule: 'Annulé',
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Wrench className="w-8 h-8 text-primary animate-pulse" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Tableau de bord</h1>
                    <p className="text-neutral-500">Bienvenue sur votre espace de gestion.</p>
                </div>
                <Button onClick={() => router.push('/dashboard/repairs')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle Réparation
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-50 text-blue-500 p-3 rounded-xl">
                            <Wrench size={24} />
                        </div>
                    </div>
                    <p className="text-neutral-500 text-sm font-medium mb-1">Réparations aujourd&apos;hui</p>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-3">{stats.todayRepairs}</h3>
                    <button
                        onClick={() => {
                            const today = new Date().toISOString().split('T')[0];
                            router.push(`/dashboard/repairs`);
                        }}
                        className="text-primary text-sm font-medium hover:underline"
                    >
                        Afficher les détails →
                    </button>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-green-50 text-green-500 p-3 rounded-xl">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                    <p className="text-neutral-500 text-sm font-medium mb-1">Prêtes à récupérer</p>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-3">{stats.readyRepairs}</h3>
                    <button
                        onClick={() => router.push('/dashboard/repairs')}
                        className="text-primary text-sm font-medium hover:underline"
                    >
                        Afficher les détails →
                    </button>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-orange-50 text-orange-500 p-3 rounded-xl">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <p className="text-neutral-500 text-sm font-medium mb-1">Revenu du jour</p>
                    <h3 className="text-2xl font-bold text-neutral-900">
                        {stats.todayRevenue.toLocaleString('fr-DZ')} DA
                    </h3>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-lg text-neutral-900">Réparations Récentes</h3>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/repairs')}>
                        Voir tout
                    </Button>
                </div>

                {recentRepairs.length === 0 ? (
                    <div className="p-12 text-center">
                        <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-neutral-500 mb-4">Aucune réparation pour le moment</p>
                        <Button onClick={() => router.push('/dashboard/repairs')}>
                            Créer la première réparation
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-neutral-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Code</th>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Appareil</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4 text-right">Prix</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentRepairs.map((repair) => (
                                    <tr
                                        key={repair.id}
                                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                        onClick={() => router.push('/dashboard/repairs')}
                                    >
                                        <td className="px-6 py-4 font-mono text-neutral-500 text-xs">
                                            {repair.code}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-neutral-900">
                                            {repair.client?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-600">{repair.item}</td>
                                        <td className="px-6 py-4">
                                            <span className={`${statusColors[repair.status]} px-2 py-1 rounded-md text-xs font-bold`}>
                                                {statusLabels[repair.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-neutral-900">
                                            {repair.payment_status === 'paid' && repair.paid_amount
                                                ? `${parseFloat(repair.paid_amount).toLocaleString('fr-DZ')} DA`
                                                : repair.price
                                                    ? `${parseFloat(repair.price).toLocaleString('fr-DZ')} DA`
                                                    : '-'
                                            }
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

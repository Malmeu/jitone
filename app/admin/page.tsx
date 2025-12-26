'use client';

import { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

// Liste des emails admin autorisés
const ADMIN_EMAILS = [
    'admin@repairtrack.dz',
    'contact@repairtrack.dz',
    // Ajoutez vos emails admin ici
];

export default function AdminPage() {
    const router = useRouter();
    const [establishments, setEstablishments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        trial: 0,
        active: 0,
        expired: 0,
    });

    // Mot de passe admin (à stocker en variable d'environnement en production)
    const ADMIN_PASSWORD = 'Malmeu@2026'; // Changez ceci !

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const checkAdminAccess = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/login');
            return;
        }

        // Vérifier si l'utilisateur est admin
        if (ADMIN_EMAILS.includes(user.email || '')) {
            setIsAdmin(true);
            setShowPasswordPrompt(false);
            fetchEstablishments();
        } else {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminPassword === ADMIN_PASSWORD) {
            setShowPasswordPrompt(false);
            fetchEstablishments();
        } else {
            alert('Mot de passe incorrect');
        }
    };

    const fetchEstablishments = async () => {
        try {
            // Récupérer le token d'authentification
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.error('No session found');
                return;
            }

            // Appeler l'API admin
            const response = await fetch('/api/admin/establishments', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('API Error:', error);
                throw new Error(error.error || 'Erreur de récupération');
            }

            const { establishments: data } = await response.json();
            console.log('Establishments fetched:', data?.length);

            if (data) {
                setEstablishments(data);

                // Calculer les stats
                const stats = {
                    total: data.length,
                    trial: data.filter((e: any) => e.subscription_status === 'trial').length,
                    active: data.filter((e: any) => e.subscription_status === 'active').length,
                    expired: data.filter((e: any) => e.subscription_status === 'expired' || e.subscription_status === 'cancelled').length,
                };
                setStats(stats);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSubscription = async (id: string, status: string, days?: number) => {
        try {
            const updates: any = { subscription_status: status };

            if (status === 'active' && days) {
                updates.subscription_ends_at = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
            }

            if (status === 'trial') {
                updates.trial_ends_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            }

            // Récupérer le token
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Appeler l'API admin pour la mise à jour
            const response = await fetch('/api/admin/establishments', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, updates })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Update Error:', error);
                throw new Error(error.error || 'Erreur de mise à jour');
            }

            await fetchEstablishments();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'trial': return 'bg-blue-100 text-blue-700';
            case 'active': return 'bg-green-100 text-green-700';
            case 'expired': return 'bg-red-100 text-red-700';
            case 'cancelled': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'trial': return 'Essai';
            case 'active': return 'Actif';
            case 'expired': return 'Expiré';
            case 'cancelled': return 'Annulé';
            default: return status;
        }
    };

    const getDaysRemaining = (endDate: string | null) => {
        if (!endDate) return null;
        const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Écran de mot de passe pour les admins
    if (showPasswordPrompt && isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                            Accès Admin
                        </h2>
                        <p className="text-neutral-600">
                            Entrez le mot de passe administrateur
                        </p>
                    </div>
                    <form onSubmit={handlePasswordSubmit}>
                        <input
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="Mot de passe"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all mb-4"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
                        >
                            Accéder
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Écran d'accès refusé pour les non-admins
    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-red-100 p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                        Accès Refusé
                    </h2>
                    <p className="text-neutral-600 mb-6">
                        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
                    >
                        Retour au Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Administration</h1>
                <p className="text-neutral-500">Gérez les abonnements et les comptes</p>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-neutral-600">Total</p>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900">{stats.total}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-neutral-600">Essai</p>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900">{stats.trial}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-neutral-600">Actifs</p>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900">{stats.active}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-xl">
                            <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <p className="text-sm font-medium text-neutral-600">Expirés</p>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900">{stats.expired}</p>
                </div>
            </div>

            {/* Liste des établissements */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">Établissement</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">Statut</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">Expire dans</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">Créé le</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {establishments.map((establishment) => {
                                const endDate = establishment.subscription_status === 'trial'
                                    ? establishment.trial_ends_at
                                    : establishment.subscription_ends_at;
                                const daysRemaining = getDaysRemaining(endDate);

                                return (
                                    <tr key={establishment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-neutral-900">{establishment.name}</p>
                                            <p className="text-sm text-neutral-500">{establishment.phone}</p>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-700">{establishment.owner_email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(establishment.subscription_status)}`}>
                                                {getStatusLabel(establishment.subscription_status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {daysRemaining !== null ? (
                                                <span className={`text-sm ${daysRemaining <= 7 ? 'text-red-600 font-medium' : 'text-neutral-700'}`}>
                                                    {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-neutral-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            {new Date(establishment.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {establishment.subscription_status !== 'active' && (
                                                    <button
                                                        onClick={() => updateSubscription(establishment.id, 'active', 365)}
                                                        className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition-colors font-medium"
                                                    >
                                                        Activer 1 an
                                                    </button>
                                                )}
                                                {establishment.subscription_status === 'trial' && (
                                                    <button
                                                        onClick={() => updateSubscription(establishment.id, 'trial')}
                                                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                                                    >
                                                        Prolonger essai
                                                    </button>
                                                )}
                                                {establishment.subscription_status === 'active' && (
                                                    <button
                                                        onClick={() => updateSubscription(establishment.id, 'expired')}
                                                        className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors font-medium"
                                                    >
                                                        Expirer
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
        </div>
    );
}

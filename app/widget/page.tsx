'use client';

import { useState } from 'react';
import { Search, Loader2, CheckCircle2, Clock, Wrench, Package, XCircle } from 'lucide-react';

export default function WidgetPage() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [repair, setRepair] = useState<any>(null);
    const [error, setError] = useState('');

    const statusConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
        nouveau: { label: 'Nouveau', icon: Clock, color: 'text-gray-700', bgColor: 'bg-gray-100' },
        diagnostic: { label: 'Diagnostic', icon: Search, color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
        en_reparation: { label: 'En réparation', icon: Wrench, color: 'text-blue-700', bgColor: 'bg-blue-100' },
        pret_recup: { label: 'Prêt à récupérer', icon: CheckCircle2, color: 'text-green-700', bgColor: 'bg-green-100' },
        recupere: { label: 'Récupéré', icon: Package, color: 'text-neutral-600', bgColor: 'bg-neutral-100' },
        annule: { label: 'Annulé', icon: XCircle, color: 'text-red-700', bgColor: 'bg-red-100' },
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError('');
        setRepair(null);

        try {
            const response = await fetch(`/api/track/${code.trim()}`);
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Réparation non trouvée');
                return;
            }

            setRepair(data);
        } catch (err) {
            setError('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIndex = (status: string) => {
        const statuses = ['nouveau', 'diagnostic', 'en_reparation', 'pret_recup', 'recupere'];
        return statuses.indexOf(status);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                        🔍 Suivi de Réparation
                    </h1>
                    <p className="text-neutral-600">
                        Entrez votre code de réparation pour suivre l'état de votre appareil
                    </p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="Ex: REPAR-ABC123"
                            className="w-full px-6 py-4 pr-32 rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg font-mono uppercase"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !code.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-6 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Recherche...
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4" />
                                    Rechercher
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 text-center">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <p className="text-red-700 font-medium">{error}</p>
                        <p className="text-red-600 text-sm mt-2">
                            Vérifiez votre code et réessayez
                        </p>
                    </div>
                )}

                {/* Repair Info */}
                {repair && (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* Header avec logo */}
                        {repair.establishment?.logo_url && (
                            <div className="bg-gradient-to-r from-primary/10 to-blue-50 p-6 text-center border-b border-gray-100">
                                <img
                                    src={repair.establishment.logo_url}
                                    alt={repair.establishment.name}
                                    className="h-16 mx-auto object-contain"
                                />
                            </div>
                        )}

                        <div className="p-8">
                            {/* Code */}
                            <div className="text-center mb-6">
                                <p className="text-sm text-neutral-500 mb-1">Code de réparation</p>
                                <p className="text-2xl font-bold font-mono" style={{ color: repair.establishment?.color }}>
                                    {repair.code}
                                </p>
                            </div>

                            {/* Appareil */}
                            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                                <p className="text-sm text-neutral-500 mb-2">Appareil</p>
                                <p className="text-xl font-bold text-neutral-900">{repair.item}</p>
                                {repair.description && (
                                    <p className="text-neutral-600 mt-2">{repair.description}</p>
                                )}
                            </div>

                            {/* Statut Actuel */}
                            <div className="mb-6">
                                <p className="text-sm text-neutral-500 mb-3">Statut actuel</p>
                                {(() => {
                                    const config = statusConfig[repair.status];
                                    const Icon = config.icon;
                                    return (
                                        <div className={`${config.bgColor} rounded-2xl p-6 flex items-center gap-4`}>
                                            <div className={`p-3 bg-white rounded-xl ${config.color}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className={`text-lg font-bold ${config.color}`}>
                                                    {config.label}
                                                </p>
                                                <p className="text-sm text-neutral-600 mt-1">
                                                    {repair.status === 'pret_recup' && 'Votre appareil est prêt ! Vous pouvez venir le récupérer.'}
                                                    {repair.status === 'en_reparation' && 'Nous travaillons sur votre appareil.'}
                                                    {repair.status === 'diagnostic' && 'Diagnostic en cours...'}
                                                    {repair.status === 'nouveau' && 'Votre réparation a été enregistrée.'}
                                                    {repair.status === 'recupere' && 'Appareil récupéré. Merci !'}
                                                    {repair.status === 'annule' && 'Cette réparation a été annulée.'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Timeline */}
                            {repair.status !== 'annule' && (
                                <div className="mb-6">
                                    <p className="text-sm text-neutral-500 mb-4">Progression</p>
                                    <div className="space-y-3">
                                        {['nouveau', 'diagnostic', 'en_reparation', 'pret_recup'].map((status, index) => {
                                            const config = statusConfig[status];
                                            const Icon = config.icon;
                                            const currentIndex = getStatusIndex(repair.status);
                                            const isCompleted = index <= currentIndex;
                                            const isCurrent = index === currentIndex;

                                            return (
                                                <div key={status} className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? config.bgColor : 'bg-gray-100'
                                                        }`}>
                                                        <Icon className={`w-5 h-5 ${isCompleted ? config.color : 'text-gray-400'
                                                            }`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`font-medium ${isCompleted ? 'text-neutral-900' : 'text-neutral-400'
                                                            }`}>
                                                            {config.label}
                                                        </p>
                                                    </div>
                                                    {isCurrent && (
                                                        <span className="text-xs bg-primary text-white px-3 py-1 rounded-full font-medium">
                                                            En cours
                                                        </span>
                                                    )}
                                                    {isCompleted && !isCurrent && (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Contact */}
                            <div className="bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl p-6 border border-primary/10">
                                <p className="text-sm font-medium text-neutral-700 mb-3">
                                    📞 Besoin d'aide ?
                                </p>
                                <p className="text-neutral-900 font-bold mb-1">
                                    {repair.establishment?.name}
                                </p>
                                {repair.establishment?.phone && (
                                    <p className="text-neutral-600">
                                        Tél: {repair.establishment.phone}
                                    </p>
                                )}
                                {repair.establishment?.address && (
                                    <p className="text-neutral-600 text-sm mt-2">
                                        📍 {repair.establishment.address}
                                    </p>
                                )}
                            </div>

                            {/* Date */}
                            <p className="text-center text-xs text-neutral-400 mt-6">
                                Déposé le {new Date(repair.created_at).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                )}

                {/* Info */}
                {!repair && !error && (
                    <div className="text-center text-neutral-500 text-sm">
                        <p>💡 Vous trouverez votre code de réparation sur votre ticket</p>
                    </div>
                )}
            </div>
        </div>
    );
}

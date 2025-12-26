'use client';

import { useEffect, useState } from 'react';
import { XCircle, Mail, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubscriptionExpiredPage() {
    const router = useRouter();
    const [establishment, setEstablishment] = useState<any>(null);

    useEffect(() => {
        fetchEstablishment();
    }, []);

    const fetchEstablishment = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('establishments')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (data) setEstablishment(data);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Abonnement Expiré
                        </h1>
                        <p className="text-red-100">
                            Votre période d'essai ou abonnement a expiré
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="bg-red-50 rounded-2xl p-6 mb-6 border border-red-100">
                            <h2 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                                <span className="text-2xl">⏰</span>
                                Votre accès est temporairement suspendu
                            </h2>
                            <p className="text-neutral-700 mb-4">
                                {establishment?.subscription_status === 'trial'
                                    ? "Votre période d'essai de 30 jours est terminée."
                                    : "Votre abonnement a expiré."
                                }
                            </p>
                            <p className="text-neutral-600 text-sm">
                                Pour continuer à utiliser RepairTrack et accéder à toutes vos données,
                                veuillez renouveler votre abonnement.
                            </p>
                        </div>

                        {/* Informations */}
                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3">
                                <div className="text-2xl">✅</div>
                                <div>
                                    <p className="font-medium text-neutral-900">Vos données sont en sécurité</p>
                                    <p className="text-sm text-neutral-600">
                                        Toutes vos réparations, clients et factures sont conservés
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="text-2xl">🔒</div>
                                <div>
                                    <p className="font-medium text-neutral-900">Accès en lecture seule</p>
                                    <p className="text-sm text-neutral-600">
                                        Vous pouvez consulter vos données mais pas les modifier
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="text-2xl">🚀</div>
                                <div>
                                    <p className="font-medium text-neutral-900">Réactivation instantanée</p>
                                    <p className="text-sm text-neutral-600">
                                        Renouvelez pour retrouver immédiatement l'accès complet
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl p-6 border border-primary/10">
                            <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <span className="text-2xl">📞</span>
                                Contactez-nous pour renouveler
                            </h3>
                            <div className="space-y-3">
                                <a
                                    href="mailto:contact@repairtrack.dz"
                                    className="flex items-center gap-3 text-neutral-700 hover:text-primary transition-colors"
                                >
                                    <Mail className="w-5 h-5" />
                                    <span>contact@repairtrack.dz</span>
                                </a>
                                <a
                                    href="tel:+213550123456"
                                    className="flex items-center gap-3 text-neutral-700 hover:text-primary transition-colors"
                                >
                                    <Phone className="w-5 h-5" />
                                    <span>+213 550 123 456</span>
                                </a>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleLogout}
                                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-neutral-700 rounded-xl font-medium transition-colors"
                            >
                                Se déconnecter
                            </button>
                            <Link
                                href="/"
                                className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors text-center"
                            >
                                Retour à l'accueil
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Info supplémentaire */}
                <p className="text-center text-neutral-500 text-sm mt-6">
                    Établissement : <span className="font-medium">{establishment?.name}</span>
                </p>
            </div>
        </div>
    );
}

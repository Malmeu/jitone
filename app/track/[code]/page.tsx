'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Phone, CheckCircle2, Clock, Wrench, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const steps = [
    { id: 'nouveau', label: 'Reçu', icon: Clock },
    { id: 'diagnostic', label: 'Diagnostic', icon: Wrench },
    { id: 'en_reparation', label: 'En cours', icon: Wrench },
    { id: 'pret_recup', label: 'Prêt', icon: CheckCircle2 },
    { id: 'recupere', label: 'Récupéré', icon: CheckCircle2 },
];

const statusLabels: Record<string, string> = {
    nouveau: 'Réparation reçue',
    diagnostic: 'En diagnostic',
    en_reparation: 'Réparation en cours',
    pret_recup: 'Prêt à récupérer',
    recupere: 'Récupéré',
    annule: 'Annulé',
};

export default function TrackPage() {
    const params = useParams();
    const router = useRouter();
    const code = params.code as string;

    const [repair, setRepair] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRepair = async () => {
            try {
                const { data, error } = await supabase
                    .from('repairs')
                    .select(`
            *,
            client:clients(name, phone),
            establishment:establishments(name, phone)
          `)
                    .eq('code', code.toUpperCase())
                    .single();

                if (error) throw error;

                if (!data) {
                    setError('Code de réparation introuvable');
                } else {
                    setRepair(data);
                }
            } catch (err: any) {
                setError('Code de réparation introuvable');
            } finally {
                setLoading(false);
            }
        };

        if (code) {
            fetchRepair();
        }
    }, [code]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Wrench className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
                    <p className="text-neutral-500">Recherche en cours...</p>
                </div>
            </div>
        );
    }

    if (error || !repair) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-3">Code introuvable</h1>
                    <p className="text-neutral-600 mb-6">
                        Aucune réparation ne correspond à ce code. Vérifiez le code sur votre ticket.
                    </p>
                    <Link href="/track">
                        <Button>Réessayer</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const currentStepIndex = steps.findIndex(s => s.id === repair.status);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/track">
                        <Button variant="ghost" size="sm" className="-ml-2 text-neutral-500 hover:text-neutral-900">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                        </Button>
                    </Link>
                    <span className="font-mono font-medium text-neutral-600 bg-gray-100 px-3 py-1 rounded-lg text-sm">
                        #{code.toUpperCase()}
                    </span>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-lg">

                {/* Status Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-6 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wrench size={100} />
                    </div>
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner ${repair.status === 'pret_recup' ? 'bg-green-50 text-green-600' :
                            repair.status === 'annule' ? 'bg-red-50 text-red-600' :
                                'bg-blue-50 text-primary'
                        }`}>
                        <Wrench className="w-8 h-8 animate-pulse" />
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                        {statusLabels[repair.status] || repair.status}
                    </h1>
                    <p className="text-neutral-500">
                        {repair.status === 'pret_recup'
                            ? 'Votre appareil est prêt à être récupéré !'
                            : 'Votre appareil est en cours de traitement par nos techniciens.'}
                    </p>
                </motion.div>

                {/* Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-6"
                >
                    <h2 className="font-semibold text-neutral-900 mb-8">Progression</h2>
                    <div className="relative pl-2 space-y-0 before:absolute before:left-[19px] before:top-2 before:bottom-6 before:w-0.5 before:bg-gray-100">
                        {steps.map((step, idx) => {
                            const isCompleted = idx < currentStepIndex;
                            const isCurrent = idx === currentStepIndex;

                            return (
                                <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                                    <div className={`
                                 relative z-10 w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-500 shrink-0
                                 ${isCompleted ? 'bg-primary border-primary text-white' : ''}
                                 ${isCurrent ? 'bg-white border-primary text-primary scale-110 shadow-lg shadow-primary/20' : ''}
                                 ${!isCompleted && !isCurrent ? 'bg-white border-gray-100 text-gray-300' : ''}
                             `}>
                                        {isCompleted ? <CheckCircle2 size={16} /> : <step.icon size={16} />}
                                    </div>
                                    <div className="pt-2">
                                        <p className={`text-base font-bold ${isCompleted || isCurrent ? 'text-neutral-900' : 'text-gray-400'}`}>
                                            {step.label}
                                        </p>
                                        {isCurrent && repair.updated_at && (
                                            <p className="text-sm text-primary font-medium mt-0.5">
                                                Dernière mise à jour : {new Date(repair.updated_at).toLocaleString('fr-FR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Device Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-24 md:mb-6"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider mb-2">Appareil</p>
                            <p className="text-xl font-bold text-neutral-900">{repair.item}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {repair.description && (
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider mb-1">Description</p>
                                <p className="text-sm text-neutral-700 font-medium">{repair.description}</p>
                            </div>
                        )}

                        {repair.price && (
                            <div className="flex justify-between items-center py-2 border-t border-gray-100 mt-4 pt-4">
                                <span className="text-sm text-neutral-500">Coût estimé</span>
                                <span className="text-lg font-bold text-neutral-900">
                                    {parseFloat(repair.price).toLocaleString('fr-DZ')} DA
                                </span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Mobile Action Bar */}
                {repair.establishment?.phone && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-200 md:hidden z-20 pb-8">
                        <a href={`tel:${repair.establishment.phone}`}>
                            <Button className="w-full text-lg h-14 shadow-xl shadow-primary/20" size="lg">
                                <Phone className="mr-2 w-5 h-5" />
                                Appeler {repair.establishment.name}
                            </Button>
                        </a>
                    </div>
                )}

            </main>
        </div>
    );
}

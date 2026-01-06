'use client';

import { BookOpen, ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function GuideDemarragePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
            {/* Header */}
            <div className="border-b border-neutral-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-neutral-600 hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Retour à l'accueil</span>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Clock className="w-4 h-4" />
                        <span>~25 min de lecture</span>
                    </div>
                </div>
            </div>

            {/* Hero */}
            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-neutral-900">Guide de Démarrage</h1>
                        <p className="text-lg text-neutral-600 mt-1">Configurez RepairTrack en 10 minutes</p>
                    </div>
                </div>

                {/* Checklist rapide */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-12">
                    <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Checklist du premier jour
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            'Créer votre compte',
                            'Configurer l\'établissement',
                            'Uploader votre logo',
                            'Ajouter un membre d\'équipe',
                            'Créer 5-10 articles de stock',
                            'Créer une réparation test',
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-blue-900">
                                <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                                    {i + 1}
                                </div>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="prose prose-neutral max-w-none">
                    <iframe
                        src="/docs/GUIDE_DEMARRAGE.md"
                        className="w-full h-[2000px] border-0"
                        title="Guide de démarrage"
                    />
                </div>

                {/* CTA Footer */}
                <div className="mt-16 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">Prêt à démarrer ?</h3>
                    <p className="text-neutral-600 mb-6">Créez votre compte gratuit et configurez votre atelier en quelques minutes.</p>
                    <div className="flex gap-4">
                        <Link href="/register">
                            <Button size="lg" className="rounded-2xl">
                                Créer mon compte gratuit
                            </Button>
                        </Link>
                        <Link href="/docs/faq">
                            <Button size="lg" variant="outline" className="rounded-2xl">
                                Consulter la FAQ
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

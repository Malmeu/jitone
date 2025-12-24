'use client';

import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, QrCode } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob"></div>
                <div className="absolute top-40 right-20 w-[400px] h-[400px] bg-sky-200 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-20 left-20 w-[400px] h-[400px] bg-purple-200 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-4000"></div>
            </div>

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col gap-6"
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full w-fit">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                            <span className="text-sm font-medium">Nouveau en Algérie 🇩🇿</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
                            Suivi de réparation <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-400">
                                Simple & Rapide
                            </span>
                        </h1>

                        <p className="text-xl text-neutral-600 max-w-lg leading-relaxed">
                            La solution complète pour les artisans et réparateurs. Offrez à vos clients une transparence totale grâce au suivi en temps réel.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                            <Link href="/register">
                                <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                                    Commencer l&apos;essai gratuit
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link href="/track">
                                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8">
                                    Voir la démo client
                                </Button>
                            </Link>
                        </div>

                        <div className="flex gap-6 mt-8">
                            {[
                                "Notifications SMS Auto",
                                "Suivi en temps réel",
                                "Support bilingue (FR/AR)"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-success" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Visual Content - Mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        {/* Abstract Phones / Dashboard preview */}
                        <div className="relative mx-auto w-full max-w-[500px] aspect-square">
                            {/* Floating Card 1: Client View */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                                className="absolute top-0 right-10 z-20 w-[280px] bg-white rounded-3xl shadow-glass border border-white/50 p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Statut</p>
                                            <p className="text-base font-bold text-neutral-900">Réparé</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono bg-neutral-100 px-2 py-1 rounded text-neutral-600">#ABC-123</span>
                                </div>
                                <div className="bg-neutral-50 rounded-2xl p-4 mb-4">
                                    <p className="text-base font-medium text-neutral-900">iPhone 13 Pro</p>
                                    <p className="text-sm text-neutral-500">Remplacement écran</p>
                                </div>
                                <Button size="sm" className="w-full">Payer maintenant</Button>
                            </motion.div>

                            {/* Floating Card 2: Dashboard Stats */}
                            <motion.div
                                animate={{ y: [0, 15, 0] }}
                                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-10 left-0 z-10 w-[300px] glass-card rounded-3xl p-6"
                            >
                                <h3 className="text-neutral-500 text-sm font-medium mb-3">Revenus du mois</h3>
                                <div className="flex items-end gap-3 mb-6">
                                    <span className="text-4xl font-bold text-neutral-900">145k <span className="text-lg text-neutral-400 font-medium">DZD</span></span>
                                    <span className="text-green-600 text-sm font-bold bg-green-100 px-2 py-1 rounded-lg mb-1">+12%</span>
                                </div>
                                <div className="h-20 flex items-end gap-2">
                                    {[40, 60, 45, 90, 75, 55, 80].map((h, i) => (
                                        <div key={i} className="flex-1 bg-primary/20 rounded-t-md hover:bg-primary/40 transition-colors cursor-pointer" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Center Element: QR Code Scanner feel */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] border-2 border-dashed border-primary/20 rounded-[2.5rem] flex items-center justify-center">
                                <QrCode className="w-20 h-20 text-primary/20" />
                            </div>

                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

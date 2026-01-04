'use client';

import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { CheckCircle2, Wrench, Clock } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden bg-[#FAFAFA]">
            {/* Background Aesthetic */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="inline-flex items-center gap-2.5 bg-white shadow-soft border border-neutral-100 px-5 py-2.5 rounded-full mb-10 group cursor-default hover:border-primary/20 transition-all"
                    >
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 group-hover:text-primary transition-colors">
                            Fièrement conçu en Algérie 🇩🇿
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                        className="text-5xl md:text-8xl font-black tracking-tight text-neutral-900 leading-[0.95] mb-10"
                    >
                        Réinventez votre <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-[#269cc3] to-[#3ab9e2]">
                            Service Après-Vente.
                        </span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-lg md:text-2xl text-neutral-500 max-w-2xl mx-auto leading-relaxed font-medium mb-12"
                    >
                        Fixwave transforme chaque réparation en une expérience client premium. Suivi en temps réel, devis intelligents et gestion simplifiée.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row gap-5 justify-center mb-24"
                    >
                        <Link href="/register">
                            <Button size="lg" className="h-16 px-10 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-lg shadow-2xl active:scale-95 transition-all">
                                Essayer GRATUITEMENT
                                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/track/REPAR-DEMO">
                            <Button variant="ghost" size="lg" className="h-16 px-10 rounded-2xl border border-neutral-100 bg-white shadow-soft text-neutral-600 font-bold text-lg hover:bg-neutral-50 active:scale-95 transition-all">
                                <QrCode className="mr-3 w-5 h-5 text-primary" />
                                Démo Suivi Client
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Visual Mockup Centered */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                        className="relative max-w-5xl mx-auto"
                    >
                        {/* Shadow abstraction under the center frame */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-primary/20 blur-[100px] opacity-30" />

                        {/* Main UI Frame - Glassmorphism */}
                        <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-4 rounded-[3.5rem] shadow-heavy relative group">
                            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-soft border border-neutral-100 aspect-[16/9] md:aspect-[21/9] flex items-center justify-center relative">
                                <img
                                    src="/dashboard_en_direct.png"
                                    alt="Fixwave Dashboard"
                                    className="w-full h-full object-cover blur-[1px] opacity-80 group-hover:opacity-100 group-hover:blur-0 transition-all duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                                {/* Logo Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:scale-110 group-hover:opacity-0 transition-all duration-700">
                                    <img src="/logoFixwave.webp" alt="Fixwave" className="h-12 md:h-20 w-auto drop-shadow-2xl" />
                                </div>
                            </div>

                            {/* Floating Element 1 - Accepted Quote */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute -top-12 -right-6 md:-right-12 w-64 bg-emerald-500 rounded-3xl p-6 shadow-2xl text-white hidden sm:block"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">Devis Accepté</span>
                                </div>
                                <p className="text-2xl font-black mb-1">12 500 DA</p>
                                <p className="text-[10px] text-white/60 font-medium text-wrap">Réparation iPhone 13 lancée - Écran original Apple</p>
                            </motion.div>

                            {/* Floating Element 2 - Status */}
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                                className="absolute -bottom-12 -left-6 md:-left-12 w-72 bg-white rounded-3xl p-6 shadow-2xl border border-neutral-50 hidden sm:block"
                            >
                                <div className="flex justify-between items-center mb-5">
                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Suivi Client Direct</span>
                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-tighter mb-1">Appareil : iPhone 14 Pro Max</p>
                                        <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "65%" }}
                                                transition={{ duration: 2, delay: 1.5 }}
                                                className="h-full bg-amber-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                                            <Clock size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-neutral-900 leading-none">Diagnostic terminé</p>
                                            <p className="text-[9px] text-neutral-400 font-medium mt-1">En attente de pièce de rechange</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Social Proof / Trusted by */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1 }}
                        className="mt-20 pt-10 border-t border-neutral-100"
                    >
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-8">Propulse les meilleurs ateliers du pays</p>
                        <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale saturate-0 contrast-150">
                            {/* Placeholder for local partner logos or just stylish names */}
                            {["TECHLAB", "MOBIZONE", "SMART CLINIC", "EL-FENIA"].map((name) => (
                                <span key={name} className="text-xl font-black italic tracking-tighter">{name}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function ArrowRight(props: any) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
    )
}

function QrCode(props: any) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.008v.008H6.75V6.75zM6.75 16.5h.008v.008H6.75V16.5zM16.5 6.75h.008v.008H16.5V6.75zM13.5 13.5h.008v.008H13.5V13.5zM16.5 13.5h.008v.008H16.5V13.5zM19.5 13.5h.008v.008H19.5V13.5zM13.5 16.5h.008v.008H13.5V16.5zM16.5 16.5h.008v.008H16.5V16.5zM19.5 16.5h.008v.008H19.5V16.5zM13.5 19.5h.008v.008H13.5V19.5zM16.5 19.5h.008v.008H16.5V19.5zM19.5 19.5h.008v.008H19.5V19.5z" />
        </svg>
    )
}

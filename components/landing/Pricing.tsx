'use client';

import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const plans = [
    {
        name: "Essentiel",
        price: "2000",
        currency: "DA",
        period: "/ mois",
        description: "Idéal pour les techniciens indépendants qui débutent.",
        features: [
            "50 réparations / mois",
            "Suivi client temps réel",
            "Gestion clients standard",
            "Support par email",
            "Tickets de dépôt PDF"
        ],
        cta: "Lancer l'aventure",
        popular: false
    },
    {
        name: "Pro Performance",
        price: "5000",
        currency: "DA",
        period: "/ mois",
        description: "La puissance totale pour les ateliers ambitieux.",
        features: [
            "Réparations Illimitées",
            "SMS & WhatsApp automatiques",
            "Gestion de stock avancée",
            "Multi-techniciens (3 accès)",
            "Statistiques de revenus live",
            "Support prioritaire 24/7"
        ],
        cta: "Commencer Gratuitement",
        popular: true
    }
];

export function Pricing() {
    return (
        <section id="pricing" className="py-40 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 bg-neutral-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-6"
                    >
                        Investissement Rentable
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-black text-neutral-900 mb-8 tracking-tight">
                        Une tarification qui <br />
                        <span className="text-primary italic">respecte votre croissance.</span>
                    </h2>
                    <p className="text-lg md:text-xl text-neutral-500 font-medium leading-relaxed">
                        Testez gratuitement pendant 14 jours, sans engagement et sans carte bancaire.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto items-center">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.8 }}
                            className={`relative p-12 rounded-[3.5rem] border transition-all duration-700 overflow-hidden ${plan.popular
                                ? 'bg-neutral-900 text-white border-neutral-800 shadow-heavy py-16'
                                : 'bg-white text-neutral-900 border-neutral-100 hover:border-primary/20 hover:shadow-medium'
                                }`}
                        >
                            {plan.popular && (
                                <>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                                    <div className="absolute top-8 right-8 bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                        Recommandé
                                    </div>
                                </>
                            )}

                            <div className="mb-12">
                                <h3 className={`text-sm font-black uppercase tracking-[0.2em] mb-6 ${plan.popular ? 'text-primary' : 'text-neutral-400'}`}>
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                                    <span className={`text-xl font-bold ${plan.popular ? 'text-white/40' : 'text-neutral-300'}`}>
                                        {plan.currency}
                                    </span>
                                    <span className={`text-lg font-medium ${plan.popular ? 'text-white/20' : 'text-neutral-300'}`}>
                                        {plan.period}
                                    </span>
                                </div>
                                <p className={`mt-6 font-medium ${plan.popular ? 'text-white/50' : 'text-neutral-500'}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <ul className="space-y-5 mb-12">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-4">
                                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <span className={`text-sm font-medium ${plan.popular ? 'text-white/80' : 'text-neutral-600'}`}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/register" className="block">
                                <Button
                                    className={`w-full h-16 rounded-[1.5rem] font-black text-lg transition-all active:scale-95 ${plan.popular
                                        ? 'bg-primary hover:bg-primary-hover text-white border-transparent shadow-xl shadow-primary/20'
                                        : 'bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-100 shadow-soft'}`}
                                    variant={plan.popular ? 'primary' : 'outline'}
                                >
                                    {plan.cta}
                                </Button>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

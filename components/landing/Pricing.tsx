'use client';

import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
    {
        name: "Starter",
        price: "2000",
        currency: "DA",
        period: "/mois",
        description: "Pour les petits ateliers indépendants.",
        features: [
            "Jusqu'à 50 réparations / mois",
            "Gestion clients basique",
            "Tableau de bord standard",
            "Support par email"
        ],
        cta: "Commencer l'essai",
        popular: false
    },
    {
        name: "Pro",
        price: "5000",
        currency: "DA",
        period: "/mois",
        description: "Pour les boutiques en croissance.",
        features: [
            "Réparations illimitées",
            "Notifications SMS auto",
            "Multi-comptes (3 employés)",
            "Statistiques avancées",
            "Support prioritaire 7/7",
            "Impression tickets"
        ],
        cta: "Essayer gratuitement",
        popular: true
    }
];

export function Pricing() {
    return (
        <section id="pricing" className="py-24 relative overflow-hidden bg-neutral-50/50">
            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-6">
                        Tarifs simples et transparents
                    </h2>
                    <p className="text-lg text-neutral-600">
                        Commencez gratuitement pendant 14 jours. Pas de carte bancaire requise.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative p-8 rounded-[2rem] border transition-all duration-300 ${plan.popular
                                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xl scale-105 z-10'
                                    : 'bg-white text-neutral-900 border-gray-200 hover:border-gray-300 hover:shadow-xl'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg shadow-primary/30">
                                    Le plus populaire
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className={`text-xl font-medium mb-2 ${plan.popular ? 'text-gray-300' : 'text-neutral-500'}`}>{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                                    <span className={`text-xl font-medium ${plan.popular ? 'text-gray-400' : 'text-neutral-400'}`}>{plan.currency}</span>
                                    <span className="text-gray-500">{plan.period}</span>
                                </div>
                                <p className={`mt-4 ${plan.popular ? 'text-gray-400' : 'text-neutral-500'}`}>{plan.description}</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className={`p-1 rounded-full ${plan.popular ? 'bg-primary/20 text-primary' : 'bg-green-100 text-green-600'}`}>
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        <span className={plan.popular ? 'text-gray-300' : 'text-neutral-700'}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className="w-full"
                                variant={plan.popular ? 'primary' : 'outline'}
                                size="lg"
                            >
                                {plan.cta}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

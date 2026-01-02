'use client';

import { motion } from 'framer-motion';
import { Smartphone, Zap, Clock, ShieldCheck, PieChart, Users } from 'lucide-react';

const features = [
    {
        icon: Clock,
        title: "Suivi en Temps Réel",
        description: "Offrez à vos clients une visibilité totale sur l'avancement technique de leur matériel.",
        color: "bg-blue-500",
        light: "bg-blue-50"
    },
    {
        icon: Zap,
        title: "Rapidité Fixwave",
        description: "Encaissez, générez des tickets et gérez vos stocks en quelques secondes seulement.",
        color: "bg-amber-500",
        light: "bg-amber-50"
    },
    {
        icon: Smartphone,
        title: "Notifications Smart",
        description: "Envoyez des alertes automatiques par SMS et WhatsApp dès que l'appareil est prêt.",
        color: "bg-emerald-500",
        light: "bg-emerald-50"
    },
    {
        icon: ShieldCheck,
        title: "Sécurité Maximale",
        description: "Vos données et celles de vos clients sont protégées par les standards bancaires.",
        color: "bg-indigo-500",
        light: "bg-indigo-50"
    },
    {
        icon: PieChart,
        title: "Analytique Premium",
        description: "Visualisez vos revenus et vos performances avec des tableaux de bord élégants.",
        color: "bg-rose-500",
        light: "bg-rose-50"
    },
    {
        icon: Users,
        title: "Expérience Client",
        description: "Fidélisez votre clientèle avec une interface de suivi digne des plus grandes marques.",
        color: "bg-sky-500",
        light: "bg-sky-50"
    }
];

export function Features() {
    return (
        <section id="features" className="py-32 bg-[#FAFAFA] relative overflow-hidden">
            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 bg-neutral-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-6"
                    >
                        Performance & Élégance
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-black text-neutral-900 mb-8 tracking-tight">
                        L'art de gérer votre <br />
                        <span className="text-primary italic">atelier de réparation.</span>
                    </h2>
                    <p className="text-lg md:text-xl text-neutral-500 font-medium leading-relaxed">
                        Chaque aspect de Fixwave a été pensé pour transformer la complexité technique en une simplicité visuelle rafraîchissante.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.8 }}
                            className="group p-10 rounded-[2.5rem] bg-white border border-neutral-100 hover:border-primary/20 hover:shadow-heavy transition-all duration-700 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-1000" />

                            <div className={`w-16 h-16 rounded-2xl ${feature.light} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                <feature.icon className={`w-8 h-8 ${feature.color.replace('bg-', 'text-')}`} />
                            </div>

                            <h3 className="text-2xl font-black text-neutral-900 mb-4 tracking-tight group-hover:text-primary transition-colors">{feature.title}</h3>
                            <p className="text-neutral-500 font-medium leading-relaxed">{feature.description}</p>

                            <div className="mt-8 pt-8 border-t border-neutral-50 flex items-center gap-2 text-[10px] font-black text-neutral-300 uppercase tracking-widest group-hover:text-primary transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                Inclus dans la solution
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

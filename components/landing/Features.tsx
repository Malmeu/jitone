'use client';

import { motion } from 'framer-motion';
import { Smartphone, Zap, Clock, ShieldCheck, PieChart, Users } from 'lucide-react';

const features = [
    {
        icon: Clock,
        title: "Suivi en Temps Réel",
        description: "Vos clients suivent chaque étape de la réparation sans vous appeler."
    },
    {
        icon: Smartphone,
        title: "Notifications SMS",
        description: "Envoi automatique de SMS ( et WhatsApp ) à chaque changement de statut."
    },
    {
        icon: ShieldCheck,
        title: "Espace Sécurisé",
        description: "Données cryptées et sauvegardées. Accès protégé pour chaque boutique."
    },
    {
        icon: Zap,
        title: "QR Code Instantané",
        description: "Générez un code unique pour chaque réparation. Scan rapide pour le client."
    },
    {
        icon: PieChart,
        title: "Statistiques Claires",
        description: "Suivez votre chiffre d&apos;affaires, nombre de réparations et performance."
    },
    {
        icon: Users,
        title: "Gestion Clients",
        description: "Historique complet des réparations par client. Fidélisation simplifiée."
    }
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-white relative">
            <div className="container mx-auto px-6 md:px-12">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-6">
                        Tout ce dont vous avez besoin pour gérer votre atelier
                    </h2>
                    <p className="text-lg text-neutral-600">
                        Une suite d'outils puissants conçus pour simplifier votre quotidien et impressionner vos clients.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group p-8 rounded-3xl bg-neutral-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 text-primary">
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-900 mb-3">{feature.title}</h3>
                            <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

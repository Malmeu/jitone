'use client';

import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, CreditCard, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ContactPage() {
    const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'Activation Abonnement Premium',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('sending');

        try {
            const { error } = await supabase
                .from('contact_messages')
                .insert([
                    {
                        name: formData.name,
                        email: formData.email,
                        subject: formData.subject,
                        message: formData.message,
                        status: 'unread'
                    }
                ]);

            if (error) throw error;
            setFormStatus('sent');
            setFormData({ name: '', email: '', subject: 'Activation Abonnement Premium', message: '' });
        } catch (error) {
            console.error('Error sending message:', error);
            setFormStatus('error');
        }
    };

    const handleWhatsAppClick = () => {
        const phone = '213540031126';
        const message = 'Bonjour Fixwave, je vous contacte concernant...';
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <main className="min-h-screen bg-[#FBFBFD] selection:bg-primary/20 selection:text-primary overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-40 pb-20 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-[120px] animate-blob" />
                    <div className="absolute top-40 right-10 w-96 h-96 bg-primary/10 rounded-full blur-[150px] animate-blob animation-delay-2000" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block px-4 py-1.5 bg-white border border-neutral-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-8 shadow-sm"
                        >
                            Assistance & Paiements
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black text-neutral-900 mb-8 tracking-tight"
                        >
                            Besoin d'aide ou de <br />
                            <span className="text-primary italic">passer au Premium ?</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-neutral-500 font-medium max-w-2xl mx-auto leading-relaxed"
                        >
                            Notre équipe est là pour vous accompagner. Découvrez également nos modes de paiement locaux pour activer votre abonnement.
                        </motion.p>
                    </div>
                </div>
            </section>

            <section className="pb-40 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-neutral-100 shadow-xl shadow-neutral-100/50"
                        >
                            <div className="mb-10">
                                <h2 className="text-3xl font-black text-neutral-900 mb-4 tracking-tight">Envoyez-nous un message</h2>
                                <p className="text-neutral-500 font-medium italic">Réponse garantie en moins de 2 heures.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Nom complet</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ex: Mohamed Amine"
                                            className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary font-bold outline-none transition-all placeholder:text-neutral-300"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Email professionnel</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="votre@email.com"
                                            className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary font-bold outline-none transition-all placeholder:text-neutral-300"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Sujet</label>
                                    <select
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary font-bold outline-none transition-all"
                                    >
                                        <option>Activation Abonnement Premium</option>
                                        <option>Support Technique</option>
                                        <option>Demande de fonctionnalité</option>
                                        <option>Autre</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Votre message</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Comment pouvons-nous vous aider ?"
                                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary font-bold outline-none transition-all placeholder:text-neutral-300 resize-none"
                                    ></textarea>
                                </div>

                                <Button
                                    disabled={formStatus === 'sending' || formStatus === 'sent'}
                                    className="w-full py-6 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    {formStatus === 'idle' && (
                                        <>Envoyer le message <Send size={20} /></>
                                    )}
                                    {formStatus === 'sending' && (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    )}
                                    {formStatus === 'sent' && (
                                        <>Message envoyé ! <CheckCircle2 size={20} /></>
                                    )}
                                    {formStatus === 'error' && (
                                        <>Erreur lors de l'envoi. Réessayez.</>
                                    )}
                                </Button>
                            </form>
                        </motion.div>

                        {/* Payment & Contact Info */}
                        <div className="space-y-8">
                            {/* Payment Methods */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-neutral-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                                            <CreditCard size={24} />
                                        </div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">Modes de Paiement</h2>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Compte CCP / BaridiMob</span>
                                                <div className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[8px] font-black uppercase">Recommandé</div>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                                                <div>
                                                    <div className="text-[10px] font-black text-white/30 uppercase mb-1">RIP</div>
                                                    <div className="text-lg font-mono font-bold tracking-wider select-all">00799999000123456789</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-white/30 uppercase mb-1">Nom du bénéficiaire</div>
                                                    <div className="text-sm font-bold uppercase">FIXWAVE TECHNOLOGIES DZ</div>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-white/40 leading-relaxed italic">
                                                * Après le virement, envoyez une copie du reçu par le formulaire à gauche ou via WhatsApp.
                                            </p>
                                        </div>

                                        <div className="pt-8 border-t border-white/5 space-y-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Paiement Espèce</span>
                                            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <MapPin className="text-primary mt-1" size={18} />
                                                <div>
                                                    <div className="text-sm font-bold mb-1">Siège Social</div>
                                                    <div className="text-xs text-white/50 font-medium leading-relaxed">
                                                        Cité Sonatrach,  N°14,<br />
                                                        Béjaïa (Gouraya), Algérie.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Direct Contact */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="grid grid-cols-2 gap-4"
                            >
                                <button
                                    onClick={handleWhatsAppClick}
                                    className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 flex flex-col gap-4 group hover:border-primary/20 transition-all text-left"
                                >
                                    <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">WhatsApp / Call</div>
                                        <div className="text-sm font-bold text-neutral-900">+213 (0) 540 03 11 26</div>
                                    </div>
                                </button>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 flex flex-col gap-4 group hover:border-primary/20 transition-all cursor-pointer">
                                    <div className="w-10 h-10 bg-emerald-500/5 text-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Messagerie Live</div>
                                        <div className="text-sm font-bold text-neutral-900">Bientôt disponible</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

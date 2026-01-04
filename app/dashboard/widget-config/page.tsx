'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Code, Globe, Laptop, Smartphone, MousePointer2, Sparkles, Wand2, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function WidgetConfigPage() {
    const [copied, setCopied] = useState(false);
    const [establishment, setEstablishment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEstablishment();
    }, []);

    const fetchEstablishment = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('establishment_id')
                .eq('user_id', user.id)
                .single();

            if (!profile) return;

            const { data } = await supabase
                .from('establishments')
                .select('*')
                .eq('id', profile.establishment_id)
                .single();

            if (data) setEstablishment(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const widgetUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/widget`
        : 'https://votre-domaine.com/widget';

    const iframeCode = `<!-- Widget de Suivi RepairTrack -->
<iframe 
    src="${widgetUrl}" 
    width="100%" 
    height="800" 
    frameborder="0"
    style="border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);"
></iframe>`;

    const linkCode = `<a href="${widgetUrl}" 
   target="_blank"
   style="display: inline-flex; align-items: center; gap: 8px; background: #000; color: #fff; padding: 14px 28px; border-radius: 16px; text-decoration: none; font-weight: 700; font-family: -apple-system, system-ui, sans-serif;">
    <span>🔍 Suivre ma réparation</span>
</a>`;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-6xl mx-auto pb-24 px-4"
        >
            <div className="mb-12">
                <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Intégration Web</span>
                </motion.div>
                <motion.h1
                    variants={itemVariants}
                    className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-4"
                >
                    Widget de Suivi
                </motion.h1>
                <motion.p
                    variants={itemVariants}
                    className="text-lg text-neutral-500 font-medium max-w-2xl"
                >
                    Permettez à vos clients de suivre l&apos;évolution de leurs réparations directement depuis votre site internet.
                </motion.p>
            </div>

            {/* Main Feature Preview Section */}
            <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 rounded-[3rem] p-8 md:p-12 mb-12 border border-white/50 backdrop-blur-sm relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
            >
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">
                    <div>
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary mb-8 group-hover:scale-110 transition-transform duration-500">
                            <Globe className="w-7 h-7" />
                        </div>
                        <h2 className="text-3xl font-bold text-neutral-900 mb-6 leading-tight">
                            Une présence en ligne <br />
                            <span className="text-primary italic">professionnelle.</span>
                        </h2>
                        <ul className="space-y-4 mb-8">
                            {[
                                "Installation en 2 minutes",
                                "Design adaptatif mobile & desktop",
                                "Mise à jour automatique des statuts"
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-3 text-neutral-600 font-medium">
                                    <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3" strokeWidth={3} />
                                    </div>
                                    {text}
                                </li>
                            ))}
                        </ul>
                        <div className="flex flex-wrap gap-4">
                            <Button
                                onClick={() => window.open(widgetUrl, '_blank')}
                                className="h-14 px-8 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white shadow-xl transition-all active:scale-[0.98]"
                            >
                                <ExternalLink className="w-5 h-5 mr-3" />
                                Aperçu en direct
                            </Button>
                        </div>
                    </div>

                    {/* Mockup Frame */}
                    <div className="relative pt-8">
                        <div className="bg-white rounded-[2rem] p-4 shadow-2xl border border-neutral-100 relative z-10">
                            <div className="bg-neutral-50 rounded-[1.5rem] border border-neutral-100 p-8 h-[300px] flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                    <Wand2 className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-800 mb-2">Suivi Interactif</h3>
                                <p className="text-sm text-neutral-500 font-medium px-8">
                                    Vos clients entrent leur code et visualisent l&apos;état de leur appareil en temps réel.
                                </p>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-full h-full bg-primary/5 rounded-[3rem] rotate-3 -z-0" />
                    </div>
                </div>
            </motion.div>

            {/* Integration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Option 1: iFrame */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-neutral-100/50 flex flex-col h-full overflow-hidden group"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-neutral-900">Intégration Complète</h3>
                            <p className="text-sm text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Utilisation de l&apos;iFrame</p>
                        </div>
                    </div>

                    <p className="text-neutral-500 mb-8 font-medium">
                        La meilleure façon d&apos;intégrer le suivi directement dans l&apos;une des pages de votre site existant.
                    </p>

                    <div className="bg-neutral-900 rounded-[1.5rem] p-6 mb-8 relative font-mono text-sm group/code flex-1">
                        <div className="text-neutral-400 leading-relaxed overflow-x-auto max-h-[200px]">
                            {iframeCode}
                        </div>
                        <button
                            onClick={() => handleCopy(iframeCode)}
                            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 backdrop-blur-md"
                        >
                            {copied ? (
                                <Check className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <Copy className="w-5 h-5 text-white/50 hover:text-white" />
                            )}
                        </button>
                    </div>

                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <p className="text-sm text-blue-800 font-bold flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> RECOMMANDÉ
                        </p>
                        <p className="text-xs text-blue-600 font-medium mt-1">
                            Parfait pour les pages dédiées au SAV ou au support client.
                        </p>
                    </div>
                </motion.div>

                {/* Option 2: Link */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-neutral-100/50 flex flex-col h-full overflow-hidden group"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                            <MousePointer2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-neutral-900">Bouton d&apos;Action</h3>
                            <p className="text-sm text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Lien vers page externe</p>
                        </div>
                    </div>

                    <p className="text-neutral-500 mb-8 font-medium">
                        Ajoutez un bouton stylé qui ouvre le système de suivi dans un nouvel onglet.
                    </p>

                    <div className="bg-neutral-900 rounded-[1.5rem] p-6 mb-8 relative font-mono text-sm group/code flex-1">
                        <div className="text-neutral-400 leading-relaxed overflow-x-auto max-h-[200px]">
                            {linkCode}
                        </div>
                        <button
                            onClick={() => handleCopy(linkCode)}
                            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 backdrop-blur-md"
                        >
                            {copied ? (
                                <Check className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <Copy className="w-5 h-5 text-white/50 hover:text-white" />
                            )}
                        </button>
                    </div>

                    <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                        <p className="text-sm text-purple-800 font-bold flex items-center gap-2">
                            <Laptop className="w-4 h-4" /> MULTIPLATFORME
                        </p>
                        <p className="text-xs text-purple-600 font-medium mt-1">
                            Compatible avec tous les CMS (WordPress, Wix, Shopify...).
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Quick URL Section */}
            <motion.div
                variants={itemVariants}
                className="bg-neutral-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden group shadow-2xl"
            >
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/10">
                            <Terminal className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold mb-2">URL Directe</h4>
                            <p className="text-neutral-400 font-medium">Partagez ce lien par WhatsApp ou Email.</p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-lg">
                        <div className="flex items-center p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                            <code className="flex-1 px-4 text-sm font-mono truncate text-neutral-300">
                                {widgetUrl}
                            </code>
                            <button
                                onClick={() => handleCopy(widgetUrl)}
                                className="h-12 w-12 flex items-center justify-center bg-white text-neutral-900 rounded-xl hover:bg-neutral-200 transition-all active:scale-95"
                            >
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

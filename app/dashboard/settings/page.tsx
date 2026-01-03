'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Loader2, Building2, Phone, MapPin, CreditCard, Palette, Globe, Check, ShieldCheck, Mail, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
    const [establishment, setEstablishment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        logo_url: '',
        ticket_color: '#007AFF',
        ticket_message: '',
    });

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

            if (data) {
                setEstablishment(data);
                setFormData({
                    name: data.name || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    logo_url: data.logo_url || '',
                    ticket_color: data.ticket_color || '#007AFF',
                    ticket_message: data.ticket_message || '',
                });
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase
                .from('establishments')
                .update({
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    logo_url: formData.logo_url,
                    ticket_color: formData.ticket_color,
                    ticket_message: formData.ticket_message,
                })
                .eq('id', establishment.id);

            if (error) throw error;
            fetchEstablishment();
        } catch (error: any) {
            alert('Erreur: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="relative">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <div className="absolute inset-0 blur-xl opacity-20 bg-primary animate-pulse" />
                </div>
            </div>
        );
    }

    const trialDaysLeft = establishment?.trial_ends_at
        ? Math.ceil((new Date(establishment.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-6xl mx-auto pb-20 px-4"
        >
            <div className="mb-12">
                <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-3">
                    Réglages Boutique
                </motion.h1>
                <motion.p variants={itemVariants} className="text-lg text-neutral-500 font-medium">
                    Identité visuelle et configuration de votre établissement.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Settings */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Profil Général */}
                    <motion.div variants={itemVariants} className="bg-card rounded-[2.5rem] p-8 md:p-10 shadow-soft border border-neutral-100 dark:border-neutral-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">Profil Général</h3>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">Nom commercial</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-foreground font-medium"
                                        placeholder="Ex: MyPhone Repair"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">Téléphone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-foreground font-medium"
                                        placeholder="+213..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">Adresse</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={3}
                                    className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-foreground font-medium resize-none"
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={saving} className="h-14 px-8 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black shadow-lg">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Enregistrer les infos</span>}
                                </Button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Branding & Ticket */}
                    <motion.div variants={itemVariants} className="bg-card rounded-[2.5rem] p-8 md:p-10 shadow-soft border border-neutral-100 dark:border-neutral-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-pink-50 dark:bg-pink-900/20 text-pink-500 rounded-2xl flex items-center justify-center">
                                <Palette className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">Design du Ticket</h3>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Logo (URL)</label>
                                    <input
                                        type="url"
                                        value={formData.logo_url}
                                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Couleur Signature</label>
                                    <div className="flex gap-4 p-2 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-100 dark:border-neutral-800 items-center">
                                        <div className="w-12 h-12 rounded-xl relative overflow-hidden border border-white/50" style={{ backgroundColor: formData.ticket_color }}>
                                            <input
                                                type="color"
                                                value={formData.ticket_color}
                                                onChange={(e) => setFormData({ ...formData, ticket_color: e.target.value })}
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                                            />
                                        </div>
                                        <span className="font-mono text-sm font-bold text-neutral-600 dark:text-neutral-400">{formData.ticket_color}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Note de bas de ticket</label>
                                    <textarea
                                        value={formData.ticket_message}
                                        onChange={(e) => setFormData({ ...formData, ticket_message: e.target.value })}
                                        rows={2}
                                        maxLength={200}
                                        className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-foreground text-sm italic"
                                    />
                                </div>
                                <Button type="submit" disabled={saving} className="w-full h-14 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Appliquer le branding</span>}
                                </Button>
                            </form>

                            <div className="flex flex-col items-center justify-center">
                                <span className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Aperçu en direct</span>
                                <div className="w-full max-w-[280px] bg-white text-black p-6 rounded-lg shadow-2xl border border-neutral-100 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: formData.ticket_color }} />
                                    <div className="text-center mb-6">
                                        {formData.logo_url ? (
                                            <img src={formData.logo_url} className="h-10 mx-auto mb-2 object-contain" alt="Logo" />
                                        ) : (
                                            <div className="w-10 h-10 bg-neutral-100 rounded-lg mx-auto mb-2" />
                                        )}
                                        <h4 className="font-black text-[10px] uppercase">{formData.name || 'BOUTIQUE DEMO'}</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-neutral-50 p-2 rounded">
                                            <span className="text-[8px] font-black text-neutral-400 uppercase">Ticket</span>
                                            <span className="font-mono font-bold text-white px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: formData.ticket_color }}>
                                                REP-501
                                            </span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="h-2 w-full bg-neutral-50 rounded" />
                                            <div className="h-2 w-3/4 bg-neutral-50 rounded" />
                                        </div>
                                        <div className="pt-4 border-t border-dashed border-neutral-200 text-center">
                                            <div className="w-16 h-16 border-2 border-neutral-100 mx-auto mb-3 flex items-center justify-center">
                                                <div className="w-10 h-10 border-2 border-neutral-200" />
                                            </div>
                                            <p className="text-[9px] text-neutral-400 italic">
                                                {formData.ticket_message || 'Votre message apparaîtra ici.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-6">
                    <motion.div variants={itemVariants} className="bg-neutral-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <ShieldCheck className="w-6 h-6 text-blue-400" />
                            <h4 className="font-bold text-lg">Abonnement</h4>
                        </div>
                        <div className="relative z-10">
                            {establishment?.subscription_status === 'trial' ? (
                                <span className="inline-flex px-3 py-1 rounded-full text-[10px] uppercase font-black mb-4 tracking-widest bg-blue-500/20 text-blue-400">
                                    Période d'Essai
                                </span>
                            ) : (
                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] uppercase font-black mb-4 tracking-widest ${establishment?.subscription_plan === 'premium'
                                        ? "bg-gradient-to-r from-amber-500/20 to-amber-200/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                                        : "bg-emerald-500/20 text-emerald-400"
                                    }`}>
                                    {establishment?.subscription_plan === 'premium' ? '✨ PREMIUM' : 'Compte PRO'}
                                </span>
                            )}
                            <div className="text-4xl font-black mb-2">
                                {establishment?.subscription_status === 'trial' ? `${trialDaysLeft} Jours` : 'Actif'}
                            </div>
                            <Button className="w-full h-14 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold mt-6 border-none">
                                Gérer le forfait
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-card rounded-[2.5rem] p-8 shadow-soft border border-neutral-100 dark:border-neutral-800">
                        <h4 className="font-bold text-foreground mb-6 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-neutral-400" />
                            Compte Propriétaire
                        </h4>
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Email</span>
                                <span className="font-bold text-sm text-foreground truncate">{establishment?.owner_email}</span>
                            </div>
                            <div className="h-px bg-neutral-100 dark:bg-neutral-800" />
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Membre depuis</span>
                                <span className="font-bold text-sm text-foreground">
                                    {new Date(establishment?.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

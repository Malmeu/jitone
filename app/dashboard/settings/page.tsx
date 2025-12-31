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

            const { data } = await supabase
                .from('establishments')
                .select('*')
                .eq('user_id', user.id)
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

            // Success animation or toast could be added here
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
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
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
            className="max-w-5xl mx-auto pb-20 px-4"
        >
            {/* Header section with refined Apple typography */}
            <div className="mb-12">
                <motion.h1
                    variants={itemVariants}
                    className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-3"
                >
                    Établissement
                </motion.h1>
                <motion.p
                    variants={itemVariants}
                    className="text-lg text-neutral-500 font-medium"
                >
                    Configurez l&apos;identité et les préférences de votre boutique.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Settings */}
                <div className="lg:col-span-2 space-y-8">
                    {/* General Info Card - Large Rounded Corners */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-blue-100/50" />

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900">Profil Général</h3>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-neutral-700 ml-1">Nom du commerce</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all bg-neutral-50/50 font-medium"
                                        placeholder="Allo Phone Réparation"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-neutral-700 ml-1">Numéro de contact</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold border-r border-neutral-200 pr-3">
                                            +213
                                        </span>
                                        <input
                                            type="tel"
                                            value={formData.phone.replace('+213', '').trim()}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                setFormData({ ...formData, phone: value ? `+213 ${value}` : '' });
                                            }}
                                            className="w-full pl-20 pr-5 py-4 rounded-2xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all bg-neutral-50/50 font-medium"
                                            placeholder="550123456"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700 ml-1">Adresse physique</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={3}
                                    className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all bg-neutral-50/50 font-medium resize-none"
                                    placeholder="123 Rue de la République, Alger"
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="h-14 px-8 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white shadow-lg shadow-neutral-200 transition-all active:scale-[0.98]"
                                >
                                    {saving ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Mise à jour...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Check className="w-5 h-5" />
                                            <span>Enregistrer les modifications</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Ticket Customization Card */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50/50 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-pink-100/50" />

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center">
                                <Palette className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral-900">Branding des Tickets</h3>
                                <p className="text-sm text-neutral-500 font-medium">Personnalisez votre image auprès de vos clients</p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-neutral-700 ml-1">URL du Logo (.png, .jpg)</label>
                                        <input
                                            type="url"
                                            value={formData.logo_url}
                                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all bg-neutral-50/50 font-medium"
                                            placeholder="https://votre-site.com/logo.png"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-neutral-700 ml-1">Couleur d&apos;accentuation</label>
                                        <div className="flex gap-4 p-2 bg-neutral-50/50 rounded-2xl border border-neutral-100 items-center">
                                            <div
                                                className="w-12 h-12 rounded-xl relative overflow-hidden border border-white/50"
                                                style={{ backgroundColor: formData.ticket_color }}
                                            >
                                                <input
                                                    type="color"
                                                    value={formData.ticket_color}
                                                    onChange={(e) => setFormData({ ...formData, ticket_color: e.target.value })}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                                                />
                                            </div>
                                            <span className="font-mono text-sm font-bold text-neutral-600 uppercase flex-1">{formData.ticket_color}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-neutral-700 ml-1">Aperçu Visuel</label>
                                    <div className="p-6 bg-neutral-50/50 rounded-[2rem] border border-neutral-100/50 flex flex-col items-center justify-center min-h-[180px]">
                                        {formData.logo_url ? (
                                            <img
                                                src={formData.logo_url}
                                                alt="Logo preview"
                                                className="h-16 w-auto object-contain mb-4"
                                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-neutral-200 rounded-2xl mb-4 animate-pulse" />
                                        )}
                                        <div
                                            className="px-4 py-2 rounded-lg text-white font-mono font-bold text-xs"
                                            style={{ backgroundColor: formData.ticket_color }}
                                        >
                                            REP-4829
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700 ml-1">Note pied de ticket (Max 200 car.)</label>
                                <textarea
                                    value={formData.ticket_message}
                                    onChange={(e) => setFormData({ ...formData, ticket_message: e.target.value })}
                                    rows={2}
                                    maxLength={200}
                                    className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all bg-neutral-50/50 font-medium resize-none italic"
                                    placeholder="Merci de votre confiance ! A bientôt."
                                />
                                <div className="flex justify-end pr-2">
                                    <span className="text-[10px] font-bold text-neutral-400">{formData.ticket_message.length}/200</span>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="h-14 px-8 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white shadow-lg shadow-neutral-200 transition-all active:scale-[0.98]"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Valider le visuel</span>}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>

                {/* Right Column: Status and Side Info */}
                <div className="space-y-6">
                    {/* Subscription Status - Premium Dark look */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-neutral-900 rounded-[2.2rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-blue-200/20"
                    >
                        {/* Decorative glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/30 transition-colors" />

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-blue-400" />
                            </div>
                            <h4 className="font-bold text-lg">Statut Abonnement</h4>
                        </div>

                        <div className="space-y-6 relative">
                            <div>
                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] uppercase font-black mb-2 tracking-widest ${establishment?.subscription_status === 'trial' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    {establishment?.subscription_status === 'trial' ? 'Période d\'essai' : 'Compte Pro'}
                                </span>
                                <h5 className="text-3xl font-black">
                                    {establishment?.subscription_status === 'trial' ? `${trialDaysLeft} Jours` : 'Actif'}
                                </h5>
                                <p className="text-sm text-neutral-400 font-medium mt-1">
                                    {establishment?.subscription_status === 'trial' ? 'Restants avant expiration.' : 'Abonnement renouvelé.'}
                                </p>
                            </div>

                            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all border-none">
                                {establishment?.subscription_status === 'trial' ? 'Passer au Plan Pro' : 'Gérer l\'abonnement'}
                            </Button>
                        </div>
                    </motion.div>

                    {/* Account Details */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-100/50"
                    >
                        <h4 className="font-bold text-neutral-900 mb-6 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-neutral-400" />
                            Compte Propriétaire
                        </h4>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">Email de connexion</span>
                                <div className="flex items-center gap-2 text-neutral-700">
                                    <Mail className="w-4 h-4 opacity-50" />
                                    <span className="font-bold truncate text-sm">{establishment?.owner_email}</span>
                                </div>
                            </div>

                            <div className="h-px bg-neutral-100 w-full" />

                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">Membre depuis</span>
                                <div className="flex items-center gap-2 text-neutral-700">
                                    <Calendar className="w-4 h-4 opacity-50" />
                                    <span className="font-bold text-sm">
                                        {new Date(establishment?.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Link Card - Purple theme */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-purple-50/50 hover:bg-purple-100/50 transition-colors cursor-pointer rounded-[2rem] p-6 border border-purple-100/50 flex items-center gap-4 group"
                        onClick={() => window.open('/widget', '_blank')}
                    >
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div>
                            <h5 className="font-bold text-purple-900">Suivi Public</h5>
                            <p className="text-[11px] font-bold text-purple-600/60 uppercase tracking-tight">Ouvrir la page de suivi →</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Loader2, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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

            alert('Paramètres enregistrés avec succès !');
            fetchEstablishment();
        } catch (error: any) {
            alert('Erreur: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>;
    }

    const trialDaysLeft = establishment?.trial_ends_at
        ? Math.ceil((new Date(establishment.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900">Paramètres</h1>
                <p className="text-neutral-500">Gérez les informations de votre établissement</p>
            </div>

            {/* Subscription Status */}
            <div className="bg-gradient-to-br from-primary/5 to-blue-50 rounded-3xl p-6 mb-6 border border-primary/10">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-bold text-neutral-900 mb-2">Abonnement</h3>
                        <p className="text-sm text-neutral-600 mb-4">
                            {establishment?.subscription_status === 'trial'
                                ? `Essai gratuit - ${trialDaysLeft} jours restants`
                                : 'Abonnement actif'}
                        </p>
                        {establishment?.subscription_status === 'trial' && trialDaysLeft > 0 && (
                            <Button size="sm">Passer à Pro</Button>
                        )}
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm">
                        <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Statut</p>
                        <p className="text-lg font-bold text-primary capitalize">{establishment?.subscription_status}</p>
                    </div>
                </div>
            </div>

            {/* Settings Form */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <h3 className="font-bold text-lg text-neutral-900 mb-6">Informations de l&apos;établissement</h3>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                            <Building2 className="w-4 h-4" />
                            Nom de l&apos;établissement
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50"
                            placeholder="Allo Phone Réparation"
                            required
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                            <Phone className="w-4 h-4" />
                            Téléphone
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">
                                +213
                            </span>
                            <input
                                type="tel"
                                value={formData.phone.replace('+213', '').trim()}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setFormData({ ...formData, phone: value ? `+213 ${value}` : '' });
                                }}
                                className="w-full pl-16 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50"
                                placeholder="550123456"
                                maxLength={9}
                            />
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                            Format: 9 chiffres sans le 0 (ex: 550123456)
                        </p>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                            <MapPin className="w-4 h-4" />
                            Adresse
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50"
                            placeholder="123 Rue de la République, Alger"
                        />
                    </div>

                    <div className="pt-4">
                        <Button type="submit" disabled={saving} className="w-full md:w-auto">
                            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</> : 'Enregistrer les modifications'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Ticket Customization */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mt-6">
                <h3 className="font-bold text-lg text-neutral-900 mb-2">Personnalisation des tickets</h3>
                <p className="text-sm text-neutral-500 mb-6">Personnalisez l&apos;apparence de vos tickets imprimables</p>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Logo (URL)
                        </label>
                        <input
                            type="url"
                            value={formData.logo_url}
                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50"
                            placeholder="https://exemple.com/logo.png"
                        />
                        <p className="text-xs text-neutral-400 mt-1">
                            Entrez l&apos;URL de votre logo (recommandé : 200x200px, format PNG/JPG)
                        </p>
                        {formData.logo_url && (
                            <div className="mt-3 flex justify-center p-4 bg-gray-50 rounded-xl">
                                <img
                                    src={formData.logo_url}
                                    alt="Aperçu du logo"
                                    className="h-16 w-auto object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Couleur du code de suivi
                        </label>
                        <div className="flex gap-3 items-center">
                            <input
                                type="color"
                                value={formData.ticket_color}
                                onChange={(e) => setFormData({ ...formData, ticket_color: e.target.value })}
                                className="h-12 w-20 rounded-xl border border-gray-200 cursor-pointer"
                            />
                            <div
                                className="flex-1 px-4 py-3 rounded-xl text-white font-mono font-bold text-center"
                                style={{ backgroundColor: formData.ticket_color }}
                            >
                                REPAR-ABC123
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Message personnalisé
                        </label>
                        <textarea
                            value={formData.ticket_message}
                            onChange={(e) => setFormData({ ...formData, ticket_message: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50"
                            placeholder="Merci de votre confiance ! Nous prenons soin de votre appareil."
                            maxLength={200}
                        />
                        <p className="text-xs text-neutral-400 mt-1">
                            Ce message apparaîtra sur tous vos tickets ({formData.ticket_message.length}/200)
                        </p>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" disabled={saving} className="w-full md:w-auto">
                            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</> : 'Enregistrer les modifications'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mt-6">
                <h3 className="font-bold text-lg text-neutral-900 mb-6">Informations du compte</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-600">Email:</span>
                        <span className="font-medium text-neutral-900">{establishment?.owner_email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Building2 className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-600">Créé le:</span>
                        <span className="font-medium text-neutral-900">
                            {new Date(establishment?.created_at).toLocaleDateString('fr-FR')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

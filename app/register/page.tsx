'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Wrench, Check } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        establishmentName: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // 1. Créer le compte utilisateur
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        establishment_name: formData.establishmentName,
                    },
                },
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Créer l'établissement dans la base de données
                const trialEndsAt = new Date();
                trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 jours d'essai

                const { error: establishmentError } = await supabase
                    .from('establishments')
                    .insert([
                        {
                            user_id: authData.user.id,
                            name: formData.establishmentName,
                            owner_email: formData.email,
                            subscription_status: 'trial',
                            trial_ends_at: trialEndsAt.toISOString(),
                        },
                    ]);

                if (establishmentError) throw establishmentError;

                setSuccess(true);

                // Rediriger après 2 secondes
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

            <Link href="/" className="mb-8 flex items-center gap-2 group">
                <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Wrench className="w-6 h-6 text-primary" />
                </div>
                <span className="font-bold text-2xl tracking-tight text-neutral-900">
                    Repair<span className="text-primary">Track</span>
                </span>
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-10 border border-gray-100"
            >
                <div className="text-center mb-8">
                    <div className="bg-green-100 text-green-700 w-fit mx-auto px-3 py-1 rounded-full text-xs font-bold mb-3 uppercase tracking-wider">Essai Gratuit 14 jours</div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Créez votre atelier</h1>
                    <p className="text-neutral-500 text-sm">Commencez à gérer vos réparations comme un pro.</p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                        ✓ Compte créé avec succès ! Redirection...
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Prénom</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white"
                                placeholder="Karim"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Nom</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white"
                                placeholder="Benzema"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Nom de l&apos;établissement</label>
                        <input
                            type="text"
                            name="establishmentName"
                            value={formData.establishmentName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white"
                            placeholder="Allo Phone Réparation"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white"
                            placeholder="contact@atelier.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Mot de passe</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="py-2">
                        <div className="flex gap-2 items-start">
                            <div className="bg-blue-50 text-blue-600 rounded-full p-0.5 mt-0.5"><Check size={12} strokeWidth={3} /></div>
                            <p className="text-xs text-neutral-500">Pas de carte bancaire requise pour commencer.</p>
                        </div>
                    </div>

                    <Button
                        className="w-full h-12 text-base shadow-lg shadow-primary/20"
                        type="submit"
                        disabled={loading || success}
                    >
                        {loading ? 'Création...' : success ? '✓ Compte créé' : 'Commencer maintenant'}
                    </Button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-neutral-400">ou</span></div>
                </div>

                <div className="text-center text-sm text-neutral-500">
                    Déjà un compte ? <Link href="/login" className="text-primary font-bold hover:underline">Se connecter</Link>
                </div>
            </motion.div>
        </div>
    );
}

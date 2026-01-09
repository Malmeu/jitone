'use client';

import { useEffect, useState } from 'react';
import { Wrench, Home, Briefcase, Users, FileText, Settings, LogOut, Code, Menu, X, Shield, Calendar, Smartphone, Package, Sun, Moon, ShoppingCart, Truck, Activity } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { SimplifiedModeProvider, useSimplifiedMode } from './SimplifiedModeContext';

const menu = [
    { icon: Home, label: 'Accueil', href: '/dashboard', roles: ['owner', 'manager', 'technician'] },
    { icon: Briefcase, label: 'Réparations', href: '/dashboard/repairs', roles: ['owner', 'manager', 'technician'] },
    { icon: ShoppingCart, label: 'Ventes', href: '/dashboard/sales', roles: ['owner', 'manager', 'technician'] },
    { icon: Users, label: 'Clients', href: '/dashboard/clients', roles: ['owner', 'manager', 'technician'] },
    { icon: Users, label: 'Équipe', href: '/dashboard/team', roles: ['owner', 'manager'] },
    { icon: Package, label: 'Stock', href: '/dashboard/inventory', roles: ['owner', 'manager', 'technician'] },
    { icon: Truck, label: 'Fournisseurs', href: '/dashboard/suppliers', roles: ['owner', 'manager'] },
    { icon: Calendar, label: 'Calendrier', href: '/dashboard/calendar', roles: ['owner', 'manager', 'technician'] },
    { icon: FileText, label: 'Devis', href: '/dashboard/quotes', roles: ['owner', 'manager'] },
    { icon: FileText, label: 'Factures', href: '/dashboard/invoices', roles: ['owner', 'manager'] },
    { icon: Smartphone, label: 'iCloud Check', href: '/dashboard/icloud-check', roles: ['owner', 'manager', 'technician'] },
    { icon: Code, label: 'Widget', href: '/dashboard/widget-config', roles: ['owner', 'manager'] },
    { icon: Settings, label: 'Paramètres', href: '/dashboard/settings', roles: ['owner', 'manager'] },
];

const ADMIN_EMAILS = [
    'admin@repairtrack.dz',
    'contact@repairtrack.dz',
];

function DashboardContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userPlan, setUserPlan] = useState<string | null>(null);
    const [requiresSetup, setRequiresSetup] = useState(false);
    const [setupLoading, setSetupLoading] = useState(false);
    const [setupName, setSetupName] = useState('');
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const { isSimplified, toggleSimplified } = useSimplifiedMode();
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            if (ADMIN_EMAILS.includes(user.email || '')) {
                setIsAdmin(true);
                setLoading(false);
                return;
            }

            setUserId(user.id);
            setUserEmail(user.email || null);

            // Récupérer tous les profils associés à cet utilisateur
            let { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('role, establishment_id, user_id')
                .eq('user_id', user.id);

            // Prioriser le profil de technicien s'il en a plusieurs (cas du technicien qui a créé son propre shop par erreur)
            let activeProfile = profiles?.find(p => p.role === 'technician') || profiles?.[0];

            // Si pas de profil lié, tenter de le lier par email
            if (!activeProfile) {
                const { data: profilesByEmail } = await supabase
                    .from('profiles')
                    .select('id, role, establishment_id, user_id')
                    .eq('email', user.email)
                    .is('user_id', null);

                const profileToLink = profilesByEmail?.[0];

                if (profileToLink) {
                    // Lier automatiquement le compte
                    const { data: updated } = await supabase
                        .from('profiles')
                        .update({ user_id: user.id })
                        .eq('id', profileToLink.id)
                        .select()
                        .single();
                    activeProfile = updated;
                }
            }

            if (activeProfile) {
                setUserRole(activeProfile.role);
                setRequiresSetup(false);
            } else {
                setRequiresSetup(true);
            }

            const establishmentId = activeProfile?.establishment_id;

            if (establishmentId) {
                const { data: establishment } = await supabase
                    .from('establishments')
                    .select('subscription_status, trial_ends_at, subscription_ends_at, subscription_plan')
                    .eq('id', establishmentId)
                    .single();

                if (establishment) {
                    const now = new Date();
                    const isExpired =
                        establishment.subscription_status === 'expired' ||
                        establishment.subscription_status === 'cancelled' ||
                        (establishment.subscription_status === 'trial' && new Date(establishment.trial_ends_at) < now) ||
                        (establishment.subscription_status === 'active' && establishment.subscription_ends_at && new Date(establishment.subscription_ends_at) < now);

                    if (isExpired) {
                        router.push('/subscription-expired');
                        return;
                    }

                    setUserPlan(establishment.subscription_plan);
                }
            }

            setLoading(false);
        };

        checkUser();

        const interval = setInterval(checkUser, 30000);
        return () => clearInterval(interval);
    }, [router]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const handleSetupEstablishment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!setupName.trim() || !userId || !userEmail) return;

        setSetupLoading(true);
        try {
            const trialEndsAt = new Date();
            trialEndsAt.setDate(trialEndsAt.getDate() + 14);

            const { error } = await supabase
                .from('establishments')
                .insert([{
                    user_id: userId,
                    name: setupName.trim(),
                    owner_email: userEmail,
                    subscription_status: 'trial',
                    trial_ends_at: trialEndsAt.toISOString(),
                }]);

            if (error) throw error;

            // Recharger pour détecter le nouveau profil créé par le trigger
            window.location.reload();
        } catch (error: any) {
            alert(error.message || "Erreur lors de la création");
        } finally {
            setSetupLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Wrench className="w-12 h-12 text-primary mx-auto mb-4" />
                    </motion.div>
                    <p className="text-neutral-400 font-medium">Récupération de vos données...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/10 selection:text-primary">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-neutral-100 z-30 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/logoFixwave.webp" alt="Fixwave" className="h-9 w-auto" />
                </Link>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2.5 bg-neutral-50 hover:bg-neutral-100 rounded-2xl transition-all active:scale-95"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6 text-neutral-900" />
                        ) : (
                            <Menu className="w-6 h-6 text-neutral-900" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebars/Menus */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-40"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="md:hidden fixed inset-y-0 left-0 w-72 bg-card z-50 flex flex-col shadow-2xl"
                        >
                            <div className="p-8 flex items-center justify-between">
                                <Link href="/" className="flex items-center gap-2">
                                    <img src="/logoFixwave.webp" alt="Fixwave" className="h-7 w-auto" />
                                </Link>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                                {menu.filter(item => {
                                    if (userRole && !item.roles.includes(userRole)) return false;
                                    if (isSimplified) {
                                        return ['Accueil', 'Réparations', 'Ventes', 'Stock'].includes(item.label);
                                    }
                                    return true;
                                }).map((item) => {
                                    const isActive = pathname === item.href;
                                    const isPremium = ['Équipe', 'Factures', 'Devis', 'Widget'].includes(item.label);

                                    return (
                                        <Link key={item.href} href={item.href} className={`
                                            flex items-center gap-3.5 px-5 py-4 rounded-2xl transition-all duration-300 relative
                                            ${isActive ? 'bg-neutral-900 text-white shadow-xl shadow-neutral-200 font-bold' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-foreground'}
                                        `}>
                                            <item.icon size={22} className={isActive ? 'text-white' : 'text-neutral-400'} />
                                            <span className="text-sm">{item.label}</span>
                                            {!isSimplified && isPremium && userPlan !== 'premium' && (
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary/10 text-primary text-[8px] font-black px-1.5 py-0.5 rounded-full">PRO</span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3 mt-auto bg-[rgba(30,127,160,0.03)] backdrop-blur-xl">
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-3.5 px-5 py-4 w-full bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl transition-all text-sm font-bold"
                                    >
                                        <Shield size={22} />
                                        Admin Panel
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3.5 px-5 py-4 w-full text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all text-sm font-bold"
                                >
                                    <LogOut size={22} />
                                    Déconnexion
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside className="w-72 bg-card border-r border-neutral-100 dark:border-neutral-800 hidden md:flex flex-col fixed inset-y-0 z-20">
                <div className="p-10 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <img src="/logoFixwave.webp" alt="Fixwave" className="h-10 w-auto group-hover:scale-110 transition-transform duration-500" />
                    </Link>
                </div>

                <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto">
                    {menu.filter(item => {
                        if (userRole && !item.roles.includes(userRole)) return false;
                        if (isSimplified) {
                            return ['Accueil', 'Réparations', 'Ventes', 'Stock'].includes(item.label);
                        }
                        return true;
                    }).map((item) => {
                        const isActive = pathname === item.href;
                        const isPremium = ['Équipe', 'Factures', 'Devis', 'Widget', 'Stock'].includes(item.label);

                        return (
                            <Link key={item.href} href={item.href} className={`
                                flex items-center gap-3.5 px-5 py-4 rounded-2xl transition-all duration-300 relative group
                                ${isActive ? 'bg-neutral-900 text-white shadow-xl shadow-neutral-200 font-bold' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-foreground'}
                            `}>
                                <item.icon size={22} className={isActive ? 'text-white' : 'text-neutral-400'} />
                                <span className="text-sm">{item.label}</span>
                                {!isSimplified && isPremium && userPlan !== 'premium' && (
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary/10 text-primary text-[8px] font-black px-1.5 py-0.5 rounded-full scale-0 group-hover:scale-100 transition-transform">PRO</span>
                                )}
                                {isActive && (
                                    <motion.div layoutId="nav-active" className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto p-8 border-t border-neutral-100 dark:border-neutral-800 bg-[rgba(30,127,160,0.03)] backdrop-blur-xl space-y-3">
                    {/* Toggle Mode Simplifié */}
                    <button
                        onClick={toggleSimplified}
                        className={`flex items-center justify-between w-full px-5 py-4 rounded-2xl transition-all border duration-500 group ${isSimplified ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-neutral-50 border-neutral-100 text-neutral-600'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isSimplified ? 'bg-emerald-500 text-white animate-pulse' : 'bg-neutral-200 text-neutral-500'}`}>
                                <Activity size={16} />
                            </div>
                            <div className="flex flex-col items-start leading-tight">
                                <span className="text-[11px] font-black uppercase tracking-tight">Focus Mode</span>
                                <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">{isSimplified ? 'Activé' : 'Désactivé'}</span>
                            </div>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isSimplified ? 'bg-emerald-500' : 'bg-neutral-200'}`}>
                            <motion.div
                                animate={{ x: isSimplified ? 20 : 2 }}
                                className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
                            />
                        </div>
                    </button>

                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-3.5 px-5 py-4 w-full bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-50 rounded-2xl transition-all text-[13px] font-black uppercase tracking-widest"
                        >
                            <Shield size={20} />
                            Admin Space
                        </Link>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3.5 px-5 py-4 w-full text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all text-sm font-bold group"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto md:ml-72 bg-background">
                <div className="max-w-[1600px] mx-auto p-6 md:p-12 md:pt-16 pt-24">
                    {children}
                </div>
            </main>

            {/* Force Setup Overlay */}
            <AnimatePresence>
                {requiresSetup && !isAdmin && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[100] bg-neutral-900/95 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-8 md:p-12 max-w-xl w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />

                            <div className="relative">
                                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8">
                                    <Smartphone className="w-10 h-10 text-primary" />
                                </div>

                                <h2 className="text-3xl font-black text-neutral-900 mb-4 tracking-tight">Finalisez votre profil 🚀</h2>
                                <p className="text-neutral-500 font-medium leading-relaxed mb-10">
                                    Il ne manque qu'une étape pour activer votre période d'essai de <span className="text-emerald-500 font-bold">14 jours gratuits</span>.
                                    Donnez un nom à votre atelier pour commencer.
                                </p>

                                <form onSubmit={handleSetupEstablishment} className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Nom de votre boutique / atelier</label>
                                        <input
                                            type="text"
                                            value={setupName}
                                            onChange={(e) => setSetupName(e.target.value)}
                                            required
                                            placeholder="Ex: Allo Phone Réparation"
                                            className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary font-bold text-lg"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={setupLoading || !setupName.trim()}
                                        className="w-full h-16 rounded-2xl bg-neutral-900 text-white font-bold text-lg hover:bg-neutral-800 transition-all shadow-xl"
                                    >
                                        {setupLoading ? 'Activation en cours...' : 'Activer mes 14 jours gratuits'}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full text-center text-sm font-bold text-neutral-400 hover:text-red-500 transition-colors"
                                    >
                                        Se déconnecter
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SimplifiedModeProvider>
            <DashboardContent>{children}</DashboardContent>
        </SimplifiedModeProvider>
    );
}

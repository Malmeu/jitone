'use client';

import { useEffect, useState } from 'react';
import { Wrench, Home, Briefcase, Users, FileText, Settings, LogOut, Code, Menu, X, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const menu = [
    { icon: Home, label: 'Accueil', href: '/dashboard' },
    { icon: Briefcase, label: 'Réparations', href: '/dashboard/repairs' },
    { icon: Users, label: 'Clients', href: '/dashboard/clients' },
    { icon: FileText, label: 'Factures', href: '/dashboard/invoices' },
    { icon: Code, label: 'Widget', href: '/dashboard/widget-config' },
    { icon: Settings, label: 'Paramètres', href: '/dashboard/settings' },
];

const ADMIN_EMAILS = [
    'admin@repairtrack.dz',
    'contact@repairtrack.dz',
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Vérifier si l'utilisateur est connecté et son statut d'abonnement
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            // Vérifier si c'est un admin
            if (ADMIN_EMAILS.includes(user.email || '')) {
                setIsAdmin(true);
                setLoading(false);
                return;
            }

            // Vérifier le statut d'abonnement pour les non-admins
            const { data: establishment } = await supabase
                .from('establishments')
                .select('subscription_status, trial_ends_at, subscription_ends_at')
                .eq('user_id', user.id)
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
            }

            setLoading(false);
        };

        checkUser();

        // Vérifier périodiquement le statut (toutes les 30 secondes)
        const interval = setInterval(checkUser, 30000);

        return () => clearInterval(interval);

        // Écouter les changements d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                router.push('/login');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    // Fermer le menu mobile lors du changement de route
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Wrench className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
                    <p className="text-neutral-500">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-30 px-4 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-primary/5 p-2 rounded-xl">
                        <Wrench className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-neutral-900">
                        Repair<span className="text-primary">Track</span>
                    </span>
                </Link>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    {mobileMenuOpen ? (
                        <X className="w-6 h-6 text-neutral-900" />
                    ) : (
                        <Menu className="w-6 h-6 text-neutral-900" />
                    )}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 mt-[57px]"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`
                md:hidden fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 z-50 transform transition-transform duration-300 ease-in-out mt-[57px]
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <nav className="flex-1 px-4 py-4 space-y-1">
                    {menu.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                ${isActive ? 'bg-primary/5 text-primary font-medium' : 'text-neutral-500 hover:bg-gray-50 hover:text-neutral-900'}
                            `}>
                                <item.icon size={20} className={isActive ? 'text-primary' : 'text-neutral-400'} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2">
                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-3 w-full bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors text-sm font-medium"
                        >
                            <Shield size={20} />
                            Admin Panel
                        </Link>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
                    >
                        <LogOut size={20} />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col fixed inset-y-0 z-20">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-primary/5 p-2 rounded-xl">
                            <Wrench className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-neutral-900">
                            Repair<span className="text-primary">Track</span>
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {menu.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                ${isActive ? 'bg-primary/5 text-primary font-medium' : 'text-neutral-500 hover:bg-gray-50 hover:text-neutral-900'}
                            `}>
                                <item.icon size={20} className={isActive ? 'text-primary' : 'text-neutral-400'} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2">
                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-3 w-full bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors text-sm font-medium"
                        >
                            <Shield size={20} />
                            Admin Panel
                        </Link>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
                    >
                        <LogOut size={20} />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto md:ml-64 p-4 md:p-8 pt-20 md:pt-8">
                {children}
            </main>
        </div>
    );
}

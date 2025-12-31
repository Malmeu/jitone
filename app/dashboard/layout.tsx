'use client';

import { useEffect, useState } from 'react';
import { Wrench, Home, Briefcase, Users, FileText, Settings, LogOut, Code, Menu, X, Shield, Calendar, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const menu = [
    { icon: Home, label: 'Accueil', href: '/dashboard' },
    { icon: Briefcase, label: 'Réparations', href: '/dashboard/repairs' },
    { icon: Users, label: 'Clients', href: '/dashboard/clients' },
    { icon: Calendar, label: 'Calendrier', href: '/dashboard/calendar' },
    { icon: FileText, label: 'Devis', href: '/dashboard/quotes' },
    { icon: FileText, label: 'Factures', href: '/dashboard/invoices' },
    { icon: Smartphone, label: 'iCloud Check', href: '/dashboard/icloud-check' },
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
        <div className="flex h-screen bg-[#FBFBFD] text-neutral-900 font-sans selection:bg-primary/10 selection:text-primary">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-neutral-100 z-30 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-2xl">
                        <Wrench className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">
                        Repair<span className="text-primary">Track</span>
                    </span>
                </Link>
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

            {/* Mobile Sidebars/Menus */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="md:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col shadow-2xl"
                        >
                            <div className="p-8 flex items-center justify-between">
                                <Link href="/" className="flex items-center gap-2">
                                    <div className="bg-primary/10 p-2 rounded-2xl">
                                        <Wrench className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="font-bold text-xl tracking-tight">RepairTrack</span>
                                </Link>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl bg-neutral-50">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                                {menu.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link key={item.href} href={item.href} className={`
                                            flex items-center gap-3.5 px-5 py-4 rounded-2xl transition-all duration-300
                                            ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'}
                                        `}>
                                            <item.icon size={22} className={isActive ? 'text-white' : 'text-neutral-400'} />
                                            <span className="text-sm">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-6 border-t border-neutral-100 space-y-3">
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-3.5 px-5 py-4 w-full bg-red-50 text-red-600 rounded-2xl transition-all text-sm font-bold"
                                    >
                                        <Shield size={22} />
                                        Admin Panel
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3.5 px-5 py-4 w-full text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all text-sm font-bold"
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
            <aside className="w-72 bg-white border-r border-neutral-100 hidden md:flex flex-col fixed inset-y-0 z-20">
                <div className="p-10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="bg-primary/10 p-2.5 rounded-[1.25rem] group-hover:scale-110 transition-transform duration-500">
                            <Wrench className="w-6 h-6 text-primary" />
                        </div>
                        <span className="font-black text-xl tracking-tight text-neutral-900">
                            Repair<span className="text-primary italic">Track</span>
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto">
                    {menu.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} className={`
                                flex items-center gap-3.5 px-5 py-4 rounded-2xl transition-all duration-300 relative group
                                ${isActive
                                    ? 'bg-neutral-900 text-white shadow-xl shadow-neutral-200 font-bold'
                                    : 'text-neutral-500 hover:bg-[#FBFBFD] hover:text-neutral-900'}
                            `}>
                                <item.icon size={20} className={isActive ? 'text-primary' : 'text-neutral-400 group-hover:text-neutral-600 transition-colors'} />
                                <span className="text-[15px]">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute left-1.5 w-1 h-6 bg-primary rounded-full"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-8 border-t border-neutral-100 space-y-3">
                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-3.5 px-5 py-4 w-full bg-red-50/50 text-red-600 hover:bg-red-50 rounded-2xl transition-all text-[13px] font-black uppercase tracking-widest"
                        >
                            <Shield size={20} />
                            Admin Space
                        </Link>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3.5 px-5 py-4 w-full text-neutral-400 hover:text-red-500 hover:bg-red-50/50 rounded-2xl transition-all text-sm font-bold group"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto md:ml-72 bg-[#FBFBFD]">
                <div className="max-w-[1600px] mx-auto p-6 md:p-12 md:pt-16 pt-24">
                    {children}
                </div>
            </main>
        </div>
    );
}

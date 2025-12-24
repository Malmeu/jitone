'use client';

import { useEffect, useState } from 'react';
import { Wrench, Home, Briefcase, Users, FileText, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const menu = [
    { icon: Home, label: 'Accueil', href: '/dashboard' },
    { icon: Briefcase, label: 'Réparations', href: '/dashboard/repairs' },
    { icon: Users, label: 'Clients', href: '/dashboard/clients' },
    { icon: FileText, label: 'Factures', href: '/dashboard/invoices' },
    { icon: Settings, label: 'Paramètres', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Vérifier si l'utilisateur est connecté
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
            } else {
                setLoading(false);
            }
        };

        checkUser();

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
            {/* Sidebar */}
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

                <div className="p-4 border-t border-gray-100">
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
            <main className="flex-1 overflow-y-auto md:ml-64 p-8">
                {children}
            </main>
        </div>
    );
}

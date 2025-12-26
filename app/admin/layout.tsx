'use client';

import { useEffect, useState } from 'react';
import { Wrench, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
        } else {
            setLoading(false);
        }
    };

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
        <div className="min-h-screen bg-gray-50">
            {/* Header Admin */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="bg-red-50 p-2 rounded-xl">
                            <Wrench className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-neutral-900">
                            Admin <span className="text-red-600">Panel</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="text-sm text-neutral-600 hover:text-primary transition-colors"
                        >
                            → Dashboard Établissement
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
                        >
                            <LogOut size={18} />
                            Déconnexion
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}

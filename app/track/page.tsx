'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Search, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function TrackSearchPage() {
    const router = useRouter();
    const [code, setCode] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim()) {
            router.push(`/track/${code.trim().toUpperCase()}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-neutral-900 mb-3">
                        Suivre ma réparation
                    </h1>
                    <p className="text-neutral-600">
                        Entrez le code de suivi reçu par SMS ou email
                    </p>
                </div>

                <form onSubmit={handleSearch} className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Code de suivi
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="REPAR-ABC123"
                            className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white text-center text-lg font-mono font-bold tracking-wider uppercase"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full h-14 text-lg" size="lg">
                        Rechercher
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-neutral-400">
                            Le code se trouve sur votre ticket de dépôt
                        </p>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <a href="/" className="text-sm text-primary font-medium hover:underline">
                        ← Retour à l&apos;accueil
                    </a>
                </div>
            </motion.div>
        </div>
    );
}

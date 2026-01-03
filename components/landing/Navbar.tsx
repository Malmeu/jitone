'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Menu, X, Wrench, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled ? 'py-4' : 'py-6'
            )}
        >
            <div
                className={cn(
                    'mx-auto max-w-7xl px-6 md:px-12 transition-all duration-300',
                )}
            >
                <div className={cn(
                    "flex items-center justify-between rounded-2xl px-6 py-3 transition-all duration-300",
                    isScrolled ? "bg-white/70 backdrop-blur-xl shadow-glass border border-white/40" : "bg-transparent"
                )}>
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
                        <img src="/logoFixwave.webp" alt="Fixwave" className="h-9 w-auto" />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Fonctionnalités</Link>
                        <Link href="#pricing" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Tarifs</Link>
                        <Link href="/contact" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Contact</Link>
                        <Link href="#testimonials" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Témoignages</Link>
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="hidden lg:flex" onClick={() => window.location.href = '/track'}>
                            <Search className="w-4 h-4 mr-2" /> Suivre une réparation
                        </Button>
                        <div className="h-6 w-px bg-gray-200 hidden lg:block"></div>
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Connexion</Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm">Essai Gratuit</Button>
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-neutral-600"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute top-24 left-6 right-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex flex-col gap-4 md:hidden origin-top"
                    >
                        <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-neutral-800 py-2">Fonctionnalités</Link>
                        <Link href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-neutral-800 py-2">Tarifs</Link>
                        <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-neutral-800 py-2">Contact & Paiement</Link>
                        <hr className="border-gray-100" />
                        <Link href="/track" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                            <Button variant="outline" className="w-full justify-start"> <Search className="w-4 h-4 mr-2" /> Suivre ma réparation</Button>
                        </Link>
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                            <Button variant="secondary" className="w-full justify-start">Connexion</Button>
                        </Link>
                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                            <Button className="w-full justify-start">Commencer l&apos;essai</Button>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

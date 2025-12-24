import { Wrench } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12 pb-8">
            <div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <Wrench className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-neutral-900">
                            Repair<span className="text-primary">Track</span>
                        </span>
                    </div>
                    <div className="flex gap-6 text-sm text-neutral-500">
                        <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Mentions Légales</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Confidentialité</Link>
                    </div>
                </div>
                <div className="text-center md:text-left text-xs text-neutral-400">
                    © 2024 RepairTrack DZ. Tous droits réservés. Fait avec passion en Algérie.
                </div>
            </div>
        </footer>
    );
}

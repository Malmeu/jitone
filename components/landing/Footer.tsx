import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-white border-t border-neutral-100 py-20 pb-12">
            <div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-12">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logoFixwave.webp" alt="Fixwave" className="h-6 w-auto opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <div className="flex gap-10 text-xs font-black uppercase tracking-[0.2em] text-neutral-400">
                        <Link href="/contact" className="hover:text-primary transition-colors">Contact & Paiement</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Conditions</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Confidentialité</Link>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-neutral-50 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300">
                    <div>© 2026 FIXWAVE TECHNOLOGIES.</div>
                    <div className="flex items-center gap-2 text-neutral-400">
                        CONÇU AVEC PASSION EN ALGÉRIE 🇩🇿
                    </div>
                </div>
            </div>
        </footer>
    );
}

import { HelpCircle, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { MarkdownViewer } from '@/components/ui/MarkdownViewer';
import fs from 'fs';
import path from 'path';

export default function FAQPage() {
    // Lire le fichier markdown côté serveur
    const filePath = path.join(process.cwd(), 'docs', 'FAQ.md');
    const markdownContent = fs.readFileSync(filePath, 'utf8');

    const categories = [
        { name: 'Compte & Abonnement', count: 4, color: 'blue' },
        { name: 'Gestion Réparations', count: 8, color: 'emerald' },
        { name: 'Point de Vente', count: 4, color: 'amber' },
        { name: 'Stock & Inventaire', count: 5, color: 'purple' },
        { name: 'Équipe & Permissions', count: 5, color: 'pink' },
        { name: 'Facturation & Paiements', count: 4, color: 'indigo' },
        { name: 'Technique & Sécurité', count: 10, color: 'red' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
            {/* Header */}
            <div className="border-b border-neutral-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <Link href="/" className="flex items-center gap-2 text-neutral-600 hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Retour à l'accueil</span>
                    </Link>
                </div>
            </div>

            {/* Hero */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <HelpCircle className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h1 className="text-5xl font-bold text-neutral-900 mb-4">Questions Fréquentes</h1>
                    <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                        Trouvez rapidement des réponses à vos questions sur RepairTrack
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {categories.map((cat) => (
                        <div
                            key={cat.name}
                            className="bg-white border border-neutral-200 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer group"
                        >
                            <h3 className="font-bold text-neutral-900 mb-2">{cat.name}</h3>
                            <p className="text-sm text-neutral-600">{cat.count} questions</p>
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
                    <MarkdownViewer content={markdownContent} />
                </div>

                {/* CTA */}
                <div className="mt-16 text-center p-12 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">Vous ne trouvez pas votre réponse ?</h3>
                    <p className="text-neutral-600 mb-6">Notre équipe support est là pour vous aider</p>
                    <div className="flex gap-4 justify-center">
                        <a href="mailto:support@repairtrack.dz" className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-colors">
                            Contacter le support
                        </a>
                        <Link href="/docs/base-connaissances" className="px-6 py-3 bg-white border-2 border-emerald-200 text-emerald-700 rounded-2xl font-semibold hover:bg-emerald-50 transition-colors">
                            Base de connaissances
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { Library, ArrowLeft, BookOpen, Wrench, ShoppingCart, Package, Users, DollarSign, Settings, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { MarkdownViewer } from '@/components/ui/MarkdownViewer';
import fs from 'fs';
import path from 'path';

export default function BaseConnaissancesPage() {
    // Lire le fichier markdown côté serveur
    const filePath = path.join(process.cwd(), 'docs', 'BASE_CONNAISSANCES.md');
    const markdownContent = fs.readFileSync(filePath, 'utf8');

    const modules = [
        { name: 'Démarrage', icon: BookOpen, color: 'blue', sections: 3 },
        { name: 'Réparations', icon: Wrench, color: 'emerald', sections: 5 },
        { name: 'Point de Vente', icon: ShoppingCart, color: 'amber', sections: 3 },
        { name: 'Stock', icon: Package, color: 'purple', sections: 4 },
        { name: 'Équipe', icon: Users, color: 'pink', sections: 3 },
        { name: 'Facturation', icon: DollarSign, color: 'indigo', sections: 3 },
        { name: 'Paramètres', icon: Settings, color: 'red', sections: 3 },
        { name: 'Support', icon: HelpCircle, color: 'teal', sections: 1 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
            {/* Header */}
            <div className="border-b border-neutral-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Link href="/" className="flex items-center gap-2 text-neutral-600 hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Retour à l'accueil</span>
                    </Link>
                </div>
            </div>

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Library className="w-10 h-10 text-amber-600" />
                    </div>
                    <h1 className="text-5xl font-bold text-neutral-900 mb-4">Base de Connaissances</h1>
                    <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                        Documentation complète pour maîtriser toutes les fonctionnalités de RepairTrack
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-4 text-sm text-neutral-500">
                        <span>📚 8 modules</span>
                        <span>•</span>
                        <span>📄 25 sections</span>
                        <span>•</span>
                        <span>⏱️ ~90 min de lecture</span>
                    </div>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {modules.map((module) => {
                        const Icon = module.icon;
                        return (
                            <div
                                key={module.name}
                                className="bg-white border border-neutral-100 rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer group hover:border-primary/20"
                            >
                                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Icon className="w-6 h-6 text-neutral-700" />
                                </div>
                                <h3 className="font-bold text-neutral-900 mb-1">{module.name}</h3>
                                <p className="text-sm text-neutral-500">{module.sections} sections</p>
                            </div>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-neutral-100 bg-neutral-50">
                        <h2 className="text-2xl font-bold text-neutral-900">Documentation complète</h2>
                        <p className="text-neutral-600 mt-2">Guides détaillés avec exemples concrets et captures d'écran</p>
                    </div>
                    <div className="p-8">
                        <MarkdownViewer content={markdownContent} />
                    </div>
                </div>

                {/* Navigation Footer */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/docs/guide-demarrage" className="p-6 bg-blue-50 border border-blue-100 rounded-2xl hover:shadow-lg transition-all group">
                        <BookOpen className="w-8 h-8 text-blue-600 mb-3" />
                        <h3 className="font-bold text-blue-900 mb-1">Guide de démarrage</h3>
                        <p className="text-sm text-blue-600">Commencez en 10 minutes</p>
                    </Link>

                    <Link href="/docs/faq" className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl hover:shadow-lg transition-all group">
                        <HelpCircle className="w-8 h-8 text-emerald-600 mb-3" />
                        <h3 className="font-bold text-emerald-900 mb-1">FAQ</h3>
                        <p className="text-sm text-emerald-600">50+ questions répondues</p>
                    </Link>

                    <a href="mailto:support@repairtrack.dz" className="p-6 bg-amber-50 border border-amber-100 rounded-2xl hover:shadow-lg transition-all group">
                        <HelpCircle className="w-8 h-8 text-amber-600 mb-3" />
                        <h3 className="font-bold text-amber-900 mb-1">Support</h3>
                        <p className="text-sm text-amber-600">Contactez notre équipe</p>
                    </a>
                </div>
            </div>
        </div>
    );
}

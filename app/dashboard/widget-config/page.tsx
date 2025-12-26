'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Code, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export default function WidgetConfigPage() {
    const [copied, setCopied] = useState(false);
    const [establishment, setEstablishment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEstablishment();
    }, []);

    const fetchEstablishment = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('establishments')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (data) setEstablishment(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const widgetUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/widget`
        : 'https://votre-domaine.com/widget';

    const iframeCode = `<!-- Widget de Suivi RepairTrack -->
<iframe 
    src="${widgetUrl}" 
    width="100%" 
    height="800" 
    frameborder="0"
    style="border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
></iframe>`;

    const linkCode = `<!-- Lien vers le Suivi -->
<a href="${widgetUrl}" 
   target="_blank"
   style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
    🔍 Suivre ma réparation
</a>`;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Widget de Suivi</h1>
                <p className="text-neutral-500">
                    Intégrez le suivi des réparations sur votre site web
                </p>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-br from-primary/5 to-blue-50 rounded-3xl p-8 mb-8 border border-primary/10">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 mb-2">
                            Aperçu du Widget
                        </h2>
                        <p className="text-neutral-600">
                            Vos clients peuvent suivre leurs réparations directement depuis votre site
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Code className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-neutral-600 font-medium mb-4">
                                Widget de Suivi de Réparation
                            </p>
                            <Button
                                onClick={() => window.open(widgetUrl, '_blank')}
                                variant="outline"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Voir en direct
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Options d'intégration */}
            <div className="space-y-6">
                {/* Option 1: iFrame */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                            <span className="text-2xl">📦</span>
                            Option 1 : Intégration iFrame (Recommandé)
                        </h3>
                        <p className="text-sm text-neutral-600 mt-1">
                            Intégrez le widget directement dans votre page
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="bg-neutral-900 rounded-xl p-4 mb-4 relative">
                            <pre className="text-green-400 text-sm overflow-x-auto">
                                <code>{iframeCode}</code>
                            </pre>
                            <button
                                onClick={() => handleCopy(iframeCode)}
                                className="absolute top-4 right-4 p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                    <Copy className="w-4 h-4 text-neutral-400" />
                                )}
                            </button>
                        </div>
                        <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                            <div className="text-2xl">💡</div>
                            <div className="text-sm text-neutral-700">
                                <p className="font-medium mb-1">Avantages :</p>
                                <ul className="list-disc list-inside space-y-1 text-neutral-600">
                                    <li>Intégration complète dans votre page</li>
                                    <li>Design cohérent avec votre site</li>
                                    <li>Mises à jour automatiques</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Option 2: Lien Direct */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                            <span className="text-2xl">🔗</span>
                            Option 2 : Lien Direct
                        </h3>
                        <p className="text-sm text-neutral-600 mt-1">
                            Ajoutez un bouton qui ouvre le widget dans une nouvelle fenêtre
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="bg-neutral-900 rounded-xl p-4 mb-4 relative">
                            <pre className="text-green-400 text-sm overflow-x-auto">
                                <code>{linkCode}</code>
                            </pre>
                            <button
                                onClick={() => handleCopy(linkCode)}
                                className="absolute top-4 right-4 p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                    <Copy className="w-4 h-4 text-neutral-400" />
                                )}
                            </button>
                        </div>
                        <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
                            <div className="text-2xl">✨</div>
                            <div className="text-sm text-neutral-700">
                                <p className="font-medium mb-1">Avantages :</p>
                                <ul className="list-disc list-inside space-y-1 text-neutral-600">
                                    <li>Simple à intégrer</li>
                                    <li>Fonctionne partout (email, réseaux sociaux, etc.)</li>
                                    <li>Personnalisable facilement</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Option 3: URL Simple */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                            <span className="text-2xl">🌐</span>
                            Option 3 : URL Simple
                        </h3>
                        <p className="text-sm text-neutral-600 mt-1">
                            Partagez directement le lien
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                            <code className="flex-1 text-sm text-neutral-700 font-mono">
                                {widgetUrl}
                            </code>
                            <button
                                onClick={() => handleCopy(widgetUrl)}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                {copied ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                ) : (
                                    <Copy className="w-5 h-5 text-neutral-600" />
                                )}
                            </button>
                        </div>
                        <p className="text-sm text-neutral-600 mt-4">
                            Utilisez cette URL dans vos emails, SMS, ou sur vos réseaux sociaux
                        </p>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200">
                <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📖</span>
                    Instructions d'utilisation
                </h3>
                <ol className="space-y-3 text-neutral-700">
                    <li className="flex gap-3">
                        <span className="font-bold text-primary">1.</span>
                        <span>Choisissez une option d'intégration ci-dessus</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="font-bold text-primary">2.</span>
                        <span>Copiez le code fourni</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="font-bold text-primary">3.</span>
                        <span>Collez-le dans le code HTML de votre site web</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="font-bold text-primary">4.</span>
                        <span>Vos clients peuvent maintenant suivre leurs réparations !</span>
                    </li>
                </ol>
            </div>
        </div>
    );
}

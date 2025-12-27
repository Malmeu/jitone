'use client';

import { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';

const THEMES = [
    { name: 'light', label: '☀️ Clair', color: '#ffffff' },
    { name: 'dark', label: '🌙 Sombre', color: '#1f2937' },
    { name: 'cupcake', label: '🧁 Cupcake', color: '#fecaca' },
    { name: 'bumblebee', label: '🐝 Abeille', color: '#fef08a' },
    { name: 'emerald', label: '💚 Émeraude', color: '#10b981' },
    { name: 'corporate', label: '💼 Corporate', color: '#3b82f6' },
    { name: 'synthwave', label: '🌆 Synthwave', color: '#e779c1' },
    { name: 'retro', label: '📻 Rétro', color: '#ef9995' },
    { name: 'cyberpunk', label: '🤖 Cyberpunk', color: '#ffee00' },
    { name: 'valentine', label: '💝 Valentine', color: '#e96d7b' },
    { name: 'halloween', label: '🎃 Halloween', color: '#f28c18' },
    { name: 'garden', label: '🌸 Jardin', color: '#5c7f67' },
    { name: 'forest', label: '🌲 Forêt', color: '#1eb854' },
    { name: 'aqua', label: '🌊 Aqua', color: '#09ecf3' },
    { name: 'lofi', label: '🎵 Lo-Fi', color: '#0d0d0d' },
    { name: 'pastel', label: '🎨 Pastel', color: '#d1c1d7' },
    { name: 'fantasy', label: '🦄 Fantasy', color: '#6e0b75' },
    { name: 'wireframe', label: '📐 Wireframe', color: '#b8b8b8' },
    { name: 'black', label: '⚫ Noir', color: '#000000' },
    { name: 'luxury', label: '👑 Luxe', color: '#ffffff' },
    { name: 'dracula', label: '🧛 Dracula', color: '#ff79c6' },
    { name: 'cmyk', label: '🖨️ CMYK', color: '#45aeee' },
    { name: 'autumn', label: '🍂 Automne', color: '#8c0327' },
    { name: 'business', label: '📊 Business', color: '#1c4e80' },
    { name: 'acid', label: '🧪 Acid', color: '#ff00f4' },
    { name: 'lemonade', label: '🍋 Limonade', color: '#519903' },
    { name: 'night', label: '🌃 Nuit', color: '#0f172a' },
    { name: 'coffee', label: '☕ Café', color: '#db924b' },
    { name: 'winter', label: '❄️ Hiver', color: '#047aed' },
];

export default function ThemeSelector() {
    const [currentTheme, setCurrentTheme] = useState('light');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Charger le thème sauvegardé
        const savedTheme = localStorage.getItem('theme') || 'light';
        setCurrentTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const changeTheme = (theme: string) => {
        setCurrentTheme(theme);
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        setIsOpen(false);
    };

    const currentThemeData = THEMES.find(t => t.name === currentTheme);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center gap-2 px-4 py-3 w-full rounded-xl border-2 border-base-300 hover:border-primary hover:bg-base-200 transition-all"
                title="Changer de thème"
            >
                <Palette className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium flex-1 text-left">
                    {currentThemeData?.label || 'Thème'}
                </span>
            </button>

            {isOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu déroulant */}
                    <div className="absolute left-0 bottom-full mb-2 w-72 bg-base-100 rounded-2xl shadow-2xl border border-base-300 z-50 max-h-96 overflow-y-auto">
                        <div className="p-4 border-b border-base-300">
                            <h3 className="font-bold text-base-content">Choisir un thème</h3>
                            <p className="text-sm text-base-content/60 mt-1">
                                {THEMES.length} thèmes disponibles
                            </p>
                        </div>

                        <div className="p-2">
                            {THEMES.map((theme) => (
                                <button
                                    key={theme.name}
                                    onClick={() => changeTheme(theme.name)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-base-200 ${currentTheme === theme.name ? 'bg-primary/10 border-2 border-primary' : ''
                                        }`}
                                >
                                    <div
                                        className="w-8 h-8 rounded-lg border-2 border-base-300"
                                        style={{ backgroundColor: theme.color }}
                                    />
                                    <span className="flex-1 text-left font-medium text-base-content">
                                        {theme.label}
                                    </span>
                                    {currentTheme === theme.name && (
                                        <span className="text-primary text-xl">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

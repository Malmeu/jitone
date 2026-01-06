import type { Metadata } from 'next';

export const metadata: Metadata = {
    metadataBase: new URL('https://repairtrack.dz'),
    title: {
        default: 'RepairTrack - Logiciel de Gestion SAV & Réparations',
        template: '%s | RepairTrack',
    },
    description: 'Solution complète de gestion pour ateliers de réparation : suivi des réparations, gestion de stock, point de vente, devis et factures. Optimisez votre SAV dès aujourd\'hui.',
    keywords: [
        'logiciel SAV',
        'gestion réparations',
        'atelier réparation',
        'point de vente',
        'gestion stock',
        'devis factures',
        'réparation téléphone',
        'réparation smartphone',
        'gestion atelier',
        'logiciel réparateur',
        'Algérie',
        'DZ',
    ],
    authors: [{ name: 'RepairTrack Team' }],
    creator: 'RepairTrack',
    publisher: 'RepairTrack',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: 'website',
        locale: 'fr_DZ',
        url: 'https://repairtrack.dz',
        title: 'RepairTrack - Logiciel de Gestion SAV & Réparations',
        description: 'Solution complète de gestion pour ateliers de réparation : suivi des réparations, gestion de stock, point de vente, devis et factures.',
        siteName: 'RepairTrack',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'RepairTrack - Logiciel de Gestion SAV',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'RepairTrack - Logiciel de Gestion SAV & Réparations',
        description: 'Solution complète de gestion pour ateliers de réparation',
        images: ['/og-image.png'],
        creator: '@repairtrack',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    alternates: {
        canonical: 'https://repairtrack.dz',
    },
    verification: {
        google: 'YU5Qt51CIHgLd4Jxz0pfyyvg2G9U-BWPwqM_Za0_U1I',
        // yandex: 'your-yandex-verification-code',
        // bing: 'your-bing-verification-code',
    },
};

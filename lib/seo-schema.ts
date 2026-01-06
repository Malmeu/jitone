export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'RepairTrack',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'DZD',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '150',
        },
        description: 'Logiciel de gestion complet pour ateliers de réparation : suivi SAV, point de vente, gestion de stock, devis et factures.',
        screenshot: 'https://repairtrack.dz/screenshot.png',
        author: {
            '@type': 'Organization',
            name: 'RepairTrack',
            url: 'https://repairtrack.dz',
            logo: 'https://repairtrack.dz/logo.png',
            contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+213-XXX-XXX-XXX',
                contactType: 'Customer Service',
                availableLanguage: ['French', 'Arabic'],
            },
            address: {
                '@type': 'PostalAddress',
                addressCountry: 'DZ',
                addressLocality: 'Alger',
            },
        },
    };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

export function generateLocalBusinessSchema(establishment: {
    name: string;
    address?: string;
    phone?: string;
    logo_url?: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: establishment.name,
        image: establishment.logo_url,
        telephone: establishment.phone,
        address: {
            '@type': 'PostalAddress',
            streetAddress: establishment.address,
            addressCountry: 'DZ',
        },
        priceRange: '$$',
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Sunday'],
                opens: '09:00',
                closes: '18:00',
            },
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Saturday',
                opens: '09:00',
                closes: '13:00',
            },
        ],
    };
}

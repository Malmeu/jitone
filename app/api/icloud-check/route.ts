import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { imei } = await request.json();

        if (!imei) {
            return NextResponse.json(
                { error: 'IMEI ou numéro de série requis' },
                { status: 400 }
            );
        }

        // Configuration de l'API iFreeiCloud
        const API_URL = 'https://api.ifreeicloud.co.uk';
        const PHP_API_KEY = '4EO-YTO-X2I-4OF-IPM-7UP-PU1-9IT';

        // Paramètres de la requête (selon l'exemple PHP)
        const myCheck = {
            service: 0, // Service ID numérique (0 pour iCloud Check)
            imei: imei,
            key: PHP_API_KEY,
        };

        // Appel à l'API en POST avec form data
        const formData = new URLSearchParams();
        formData.append('service', myCheck.service.toString());
        formData.append('imei', myCheck.imei);
        formData.append('key', myCheck.key);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();

        // Vérifier si l'API a retourné une erreur
        if (data.success !== true) {
            return NextResponse.json(
                { error: data.error || 'Erreur inconnue de l\'API' },
                { status: 400 }
            );
        }

        // Retourner l'objet de réponse
        return NextResponse.json({
            success: true,
            response: data.response,
            ...data.object, // Inclure toutes les propriétés de l'objet
        });
    } catch (error: any) {
        console.error('iCloud Check API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la vérification iCloud' },
            { status: 500 }
        );
    }
}

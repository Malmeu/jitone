import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// API publique pour le suivi des réparations
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        if (!code) {
            return NextResponse.json(
                { error: 'Code de réparation requis' },
                { status: 400 }
            );
        }

        // Créer un client Supabase avec la clé publique
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Récupérer la réparation avec les infos publiques uniquement
        const { data: repair, error } = await supabase
            .from('repairs')
            .select(`
                code,
                item,
                description,
                status,
                created_at,
                establishment:establishments(
                    name,
                    phone,
                    address,
                    logo_url,
                    ticket_color
                )
            `)
            .eq('code', code.toUpperCase())
            .single();

        if (error || !repair) {
            return NextResponse.json(
                { error: 'Réparation non trouvée' },
                { status: 404 }
            );
        }

        // Retourner uniquement les données publiques
        const establishment = Array.isArray(repair.establishment)
            ? repair.establishment[0]
            : repair.establishment;

        return NextResponse.json({
            code: repair.code,
            item: repair.item,
            description: repair.description,
            status: repair.status,
            created_at: repair.created_at,
            establishment: {
                name: establishment?.name,
                phone: establishment?.phone,
                address: establishment?.address,
                logo_url: establishment?.logo_url,
                color: establishment?.ticket_color || '#3b82f6',
            }
        });

    } catch (error) {
        console.error('Track API error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

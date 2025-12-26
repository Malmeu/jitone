import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Ignorer les routes publiques et admin
    const publicRoutes = ['/', '/login', '/register', '/track', '/widget', '/api', '/admin'];
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Vérifier le statut d'abonnement pour les routes dashboard
    if (pathname.startsWith('/dashboard')) {
        try {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            // Récupérer l'utilisateur depuis les cookies
            const token = request.cookies.get('sb-access-token')?.value;
            if (!token) {
                return NextResponse.redirect(new URL('/login', request.url));
            }

            // Récupérer l'établissement de l'utilisateur
            const { data: { user } } = await supabase.auth.getUser(token);

            if (!user) {
                return NextResponse.redirect(new URL('/login', request.url));
            }

            const { data: establishment } = await supabase
                .from('establishments')
                .select('subscription_status, trial_ends_at, subscription_ends_at')
                .eq('user_id', user.id)
                .single();

            if (establishment) {
                const now = new Date();
                const isExpired =
                    establishment.subscription_status === 'expired' ||
                    establishment.subscription_status === 'cancelled' ||
                    (establishment.subscription_status === 'trial' && new Date(establishment.trial_ends_at) < now) ||
                    (establishment.subscription_status === 'active' && establishment.subscription_ends_at && new Date(establishment.subscription_ends_at) < now);

                if (isExpired) {
                    // Rediriger vers une page d'expiration
                    return NextResponse.redirect(new URL('/subscription-expired', request.url));
                }
            }
        } catch (error) {
            console.error('Middleware error:', error);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};

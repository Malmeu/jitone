import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAILS = [
    'admin@repairtrack.dz',
    'contact@repairtrack.dz',
];

export async function GET(request: Request) {
    try {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        const authHeader = request.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user || !ADMIN_EMAILS.includes(user.email || '')) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        // Fetch profiles with establishment names
        const { data: profiles, error: profError } = await supabaseAdmin
            .from('profiles')
            .select('*, establishments(name)')
            .order('created_at', { ascending: false });

        if (profError) throw profError;

        // Fetch all auth users (to identify those without profiles)
        const { data: { users }, error: authListError } = await supabaseAdmin.auth.admin.listUsers();

        return NextResponse.json({
            profiles,
            authUsersCount: users?.length || 0,
            authUsers: users?.map(u => ({ id: u.id, email: u.email, created_at: u.created_at, last_sign_in_at: u.last_sign_in_at }))
        });

    } catch (error: any) {
        console.error('Admin Users API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

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
            serviceRoleKey!,
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
        const { data: { users: authUsers }, error: authListError } = await supabaseAdmin.auth.admin.listUsers();

        if (authListError) throw authListError;

        return NextResponse.json({
            profiles,
            authUsersCount: authUsers?.length || 0,
            authUsers: authUsers?.map(u => ({
                id: u.id,
                email: u.email,
                created_at: u.created_at,
                last_sign_in_at: u.last_sign_in_at,
                email_confirmed_at: u.email_confirmed_at,
                banned_until: (u as any).banned_until // Support for older/newer SDK versions
            }))
        });

    } catch (error: any) {
        console.error('Admin Users GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const authHeader = request.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user: adminUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !adminUser || !ADMIN_EMAILS.includes(adminUser.email || '')) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const { userId, action, data } = await request.json();

        if (action === 'update_role') {
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({ role: data.role })
                .eq('id', userId);
            if (error) throw error;
        }

        if (action === 'ban') {
            const { error } = await supabaseAdmin.auth.admin.updateUserById(
                userId,
                { ban_duration: data.banned ? '87600h' : 'none' } // 10 years or none
            );
            if (error) throw error;
        }

        if (action === 'reset_password') {
            const { error } = await supabaseAdmin.auth.admin.generateLink({
                type: 'recovery',
                email: data.email,
            });
            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Admin Users PATCH error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const authHeader = request.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user: adminUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !adminUser || !ADMIN_EMAILS.includes(adminUser.email || '')) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const { userId } = await request.json();

        // Profiles are usually linked via FK with Cascade, but let's be safe
        await supabaseAdmin.from('profiles').delete().eq('id', userId);
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Admin Users DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

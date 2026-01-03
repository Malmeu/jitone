import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAILS = [
    'admin@repairtrack.dz',
    'contact@repairtrack.dz',
];

export async function GET(request: Request) {
    try {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
            .from('subscription_configs')
            .select('*')
            .order('plan_id', { ascending: false }); // premium first usually

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const authHeader = request.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);

        if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const body = await request.json();
        const { plan_id, updates } = body;

        const { data, error } = await supabase
            .from('subscription_configs')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('plan_id', plan_id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

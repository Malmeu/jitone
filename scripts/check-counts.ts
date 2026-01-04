
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkCounts() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { count: estCount } = await supabase.from('establishments').select('*', { count: 'exact', head: true });
    const { count: profCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    console.log('Establishments count:', estCount);
    console.log('Profiles count:', profCount);
    console.log('Auth Users count:', users?.length || 0);

    const { data: ests } = await supabase.from('establishments').select('id, name, owner_email');
    console.log('Establishments:', ests);
    console.log('Auth Users:', users?.map(u => ({ id: u.id, email: u.email })));
}

checkCounts();

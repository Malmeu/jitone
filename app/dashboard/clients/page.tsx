'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ClientsPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: establishment } = await supabase
                .from('establishments')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!establishment) return;

            const { data } = await supabase
                .from('clients')
                .select(`
          *,
          repairs:repairs(count)
        `)
                .eq('establishment_id', establishment.id)
                .order('name');

            if (data) setClients(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Clients</h1>
                    <p className="text-neutral-500">Gérez votre base de clients</p>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {filteredClients.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-neutral-500">Aucun client trouvé</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-neutral-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4 text-left">Nom</th>
                                    <th className="px-6 py-4 text-left">Téléphone</th>
                                    <th className="px-6 py-4 text-left">Email</th>
                                    <th className="px-6 py-4 text-left">Réparations</th>
                                    <th className="px-6 py-4 text-left">Inscrit le</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-neutral-900">{client.name}</td>
                                        <td className="px-6 py-4 text-neutral-600">{client.phone || '-'}</td>
                                        <td className="px-6 py-4 text-neutral-600">{client.email || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold">
                                                {client.repairs?.[0]?.count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-500 text-xs">
                                            {new Date(client.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

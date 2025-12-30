'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Loader2, Edit, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientsPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [establishmentId, setEstablishmentId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
    });

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
            setEstablishmentId(establishment.id);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!establishmentId) return;

        setSubmitting(true);
        try {
            if (editingClient) {
                // Mise à jour
                const { error } = await supabase
                    .from('clients')
                    .update({
                        name: formData.name,
                        phone: formData.phone || null,
                        email: formData.email || null,
                    })
                    .eq('id', editingClient.id);

                if (error) throw error;
                alert('✓ Client modifié avec succès !');
            } else {
                // Création
                const { error } = await supabase
                    .from('clients')
                    .insert([{
                        establishment_id: establishmentId,
                        name: formData.name,
                        phone: formData.phone || null,
                        email: formData.email || null,
                    }]);

                if (error) throw error;
                alert('✓ Client créé avec succès !');
            }

            setShowModal(false);
            setEditingClient(null);
            setFormData({ name: '', phone: '', email: '' });
            await fetchClients();
        } catch (error: any) {
            console.error('Error:', error);
            alert('Erreur: ' + (error.message || 'Erreur inconnue'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (client: any) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            phone: client.phone || '',
            email: client.email || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (clientId: string, clientName: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le client "${clientName}" ?\n\nCette action est irréversible.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', clientId);

            if (error) throw error;

            alert('✓ Client supprimé avec succès !');
            await fetchClients();
        } catch (error: any) {
            console.error('Delete error:', error);
            alert('Erreur lors de la suppression : ' + (error.message || 'Erreur inconnue'));
        }
    };

    const handleNewClient = () => {
        setEditingClient(null);
        setFormData({ name: '', phone: '', email: '' });
        setShowModal(true);
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
                <Button onClick={handleNewClient}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau Client
                </Button>
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
                                    <th className="px-6 py-4 text-left">Actions</th>
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
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(client)}
                                                    className="px-3 py-1.5 rounded-lg border border-primary text-primary text-xs font-medium hover:bg-primary/10 transition-colors flex items-center gap-1"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(client.id, client.name)}
                                                    className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors flex items-center gap-1"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-neutral-900">
                                    {editingClient ? 'Modifier le client' : 'Nouveau client'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Nom *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="Nom du client"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Téléphone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="+213 550123456"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="client@example.com"
                                    />
                                </div>



                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                                        Annuler
                                    </Button>
                                    <Button type="submit" disabled={submitting} className="flex-1">
                                        {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</> : editingClient ? 'Modifier' : 'Créer'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

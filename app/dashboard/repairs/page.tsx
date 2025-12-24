'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Search, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { RepairTicket } from '@/components/ui/RepairTicket';

export default function RepairsPage() {
    const [repairs, setRepairs] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [establishmentId, setEstablishmentId] = useState<string | null>(null);
    const [establishment, setEstablishment] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showTicket, setShowTicket] = useState(false);
    const [ticketData, setTicketData] = useState<any>(null);

    const [formData, setFormData] = useState({
        clientId: '',
        clientName: '',
        clientPhone: '',
        item: '',
        description: '',
        status: 'nouveau',
        price: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: establishmentData } = await supabase
                .from('establishments')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (!establishmentData) return;
            setEstablishmentId(establishmentData.id);
            setEstablishment(establishmentData);

            // Récupérer les réparations
            const { data: repairsData } = await supabase
                .from('repairs')
                .select(`
          *,
          client:clients(name, phone)
        `)
                .eq('establishment_id', establishmentData.id)
                .order('created_at', { ascending: false });

            if (repairsData) setRepairs(repairsData);

            // Récupérer les clients
            const { data: clientsData } = await supabase
                .from('clients')
                .select('*')
                .eq('establishment_id', establishmentData.id)
                .order('name');

            if (clientsData) setClients(clientsData);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = 'REPAR-';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!establishmentId) {
            console.error('No establishment ID found');
            alert('Erreur: Établissement non trouvé');
            return;
        }

        setSubmitting(true);
        console.log('Starting repair creation...', { establishmentId, formData });

        try {
            let clientId = formData.clientId;

            // Si nouveau client
            if (!clientId && formData.clientName) {
                console.log('Creating new client...');
                const { data: newClient, error: clientError } = await supabase
                    .from('clients')
                    .insert([{
                        establishment_id: establishmentId,
                        name: formData.clientName,
                        phone: formData.clientPhone,
                    }])
                    .select()
                    .single();

                if (clientError) {
                    console.error('Client creation error:', clientError);
                    throw clientError;
                }
                console.log('Client created:', newClient);
                clientId = newClient.id;
            }

            if (!clientId) {
                throw new Error('Aucun client sélectionné ou créé');
            }

            // Créer la réparation
            const repairData = {
                establishment_id: establishmentId,
                client_id: clientId,
                code: generateCode(),
                item: formData.item,
                description: formData.description,
                status: formData.status,
                price: formData.price ? parseFloat(formData.price) : null,
            };

            console.log('Creating repair with data:', repairData);

            const { data: repairResult, error: repairError } = await supabase
                .from('repairs')
                .insert([repairData])
                .select();

            if (repairError) {
                console.error('Repair creation error:', repairError);
                throw repairError;
            }

            console.log('Repair created successfully:', repairResult);

            // Préparer les données du ticket
            const newRepair = repairResult[0];
            const clientData = clients.find(c => c.id === clientId) || {
                name: formData.clientName,
                phone: formData.clientPhone,
            };

            setTicketData({
                ...newRepair,
                client: clientData,
            });

            // Réinitialiser et recharger
            setFormData({
                clientId: '',
                clientName: '',
                clientPhone: '',
                item: '',
                description: '',
                status: 'nouveau',
                price: '',
            });
            setShowModal(false);
            await fetchData();

            // Afficher le ticket
            setShowTicket(true);
        } catch (error: any) {
            console.error('Full error:', error);
            alert('Erreur: ' + (error.message || 'Erreur inconnue'));
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRepairs = repairs.filter(r =>
        r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusColors: Record<string, string> = {
        nouveau: 'bg-gray-100 text-gray-700',
        diagnostic: 'bg-yellow-100 text-yellow-700',
        en_reparation: 'bg-blue-100 text-blue-700',
        pret_recup: 'bg-green-100 text-green-700',
        recupere: 'bg-neutral-100 text-neutral-600',
        annule: 'bg-red-100 text-red-700',
    };

    const statusLabels: Record<string, string> = {
        nouveau: 'Nouveau',
        diagnostic: 'Diagnostic',
        en_reparation: 'En cours',
        pret_recup: 'Prêt',
        recupere: 'Récupéré',
        annule: 'Annulé',
    };

    const updateStatus = async (repairId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('repairs')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', repairId);

            if (error) throw error;

            // Recharger les données
            await fetchData();
        } catch (error: any) {
            console.error('Error updating status:', error);
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Réparations</h1>
                    <p className="text-neutral-500">Gérez toutes vos réparations</p>
                </div>
                <Button onClick={() => setShowModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle Réparation
                </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par code, appareil ou client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {filteredRepairs.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-neutral-500">Aucune réparation trouvée</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-neutral-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4 text-left">Code</th>
                                    <th className="px-6 py-4 text-left">Client</th>
                                    <th className="px-6 py-4 text-left">Appareil</th>
                                    <th className="px-6 py-4 text-left">Statut</th>
                                    <th className="px-6 py-4 text-left">Prix</th>
                                    <th className="px-6 py-4 text-left">Date</th>
                                    <th className="px-6 py-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRepairs.map((repair) => (
                                    <tr key={repair.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-neutral-600">
                                            {repair.code}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-neutral-900">
                                            {repair.client?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-700">{repair.item}</td>
                                        <td className="px-6 py-4">
                                            <span className={`${statusColors[repair.status]} px-3 py-1 rounded-lg text-xs font-bold`}>
                                                {statusLabels[repair.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-neutral-900">
                                            {repair.price ? `${parseFloat(repair.price).toLocaleString('fr-DZ')} DA` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-500 text-xs">
                                            {new Date(repair.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <select
                                                    value={repair.status}
                                                    onChange={(e) => updateStatus(repair.id, e.target.value)}
                                                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white hover:bg-gray-50"
                                                >
                                                    <option value="nouveau">Nouveau</option>
                                                    <option value="diagnostic">Diagnostic</option>
                                                    <option value="en_reparation">En cours</option>
                                                    <option value="pret_recup">Prêt</option>
                                                    <option value="recupere">Récupéré</option>
                                                    <option value="annule">Annulé</option>
                                                </select>
                                                <button
                                                    onClick={() => {
                                                        setTicketData(repair);
                                                        setShowTicket(true);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-1"
                                                    title="Réimprimer le ticket"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                    </svg>
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
                            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                                <h2 className="text-xl font-bold text-neutral-900">Nouvelle Réparation</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Client */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Client</label>
                                    <select
                                        value={formData.clientId}
                                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50"
                                    >
                                        <option value="">Nouveau client</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {!formData.clientId && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">Nom du client *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.clientName}
                                                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50"
                                                placeholder="Mohamed Benzema"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">Téléphone</label>
                                            <input
                                                type="tel"
                                                value={formData.clientPhone}
                                                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50"
                                                placeholder="+213 555 123 456"
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Appareil *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.item}
                                        onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50"
                                        placeholder="iPhone 13 Pro"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50"
                                        placeholder="Écran cassé, batterie faible..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">Statut</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50"
                                        >
                                            <option value="nouveau">Nouveau</option>
                                            <option value="diagnostic">Diagnostic</option>
                                            <option value="en_reparation">En cours</option>
                                            <option value="pret_recup">Prêt</option>
                                            <option value="recupere">Récupéré</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">Prix (DA)</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50"
                                            placeholder="5000"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                                        Annuler
                                    </Button>
                                    <Button type="submit" disabled={submitting} className="flex-1">
                                        {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Création...</> : 'Créer la réparation'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Ticket d'impression */}
            {showTicket && ticketData && establishment && (
                <RepairTicket
                    repair={ticketData}
                    establishment={establishment}
                    onClose={() => setShowTicket(false)}
                />
            )}
        </div>
    );
}

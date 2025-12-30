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
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [submitting, setSubmitting] = useState(false);
    const [showTicket, setShowTicket] = useState(false);
    const [ticketData, setTicketData] = useState<any>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedRepair, setSelectedRepair] = useState<any>(null);
    const [editingRepair, setEditingRepair] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentNote, setPaymentNote] = useState('');

    const [formData, setFormData] = useState({
        clientId: '',
        clientName: '',
        clientPhone: '',
        item: '',
        description: '',
        status: 'nouveau',
        price: '',
        cost_price: '',
        is_unlock: false,
        imei_sn: '',
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
        console.log(editingRepair ? 'Updating repair...' : 'Starting repair creation...', { establishmentId, formData });

        try {
            let clientId = formData.clientId;

            // Si nouveau client (seulement en création)
            if (!editingRepair && !clientId && formData.clientName) {
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

            // Calculer le profit (pour information, mais ne pas l'enregistrer car c'est une colonne générée)
            const price = formData.price ? parseFloat(formData.price) : 0;
            const costPrice = formData.cost_price ? parseFloat(formData.cost_price) : 0;

            if (editingRepair) {
                // Mise à jour de la réparation
                const updateData = {
                    client_id: clientId,
                    item: formData.item,
                    description: formData.description,
                    status: formData.status,
                    price: formData.price ? parseFloat(formData.price) : null,
                    cost_price: costPrice,
                    is_unlock: formData.is_unlock,
                    imei_sn: formData.is_unlock ? formData.imei_sn : null,
                    updated_at: new Date().toISOString(),
                };

                console.log('Updating repair with data:', updateData);

                const { error: repairError } = await supabase
                    .from('repairs')
                    .update(updateData)
                    .eq('id', editingRepair.id);

                if (repairError) {
                    console.error('Repair update error:', repairError);
                    throw repairError;
                }

                console.log('Repair updated successfully');
                alert('✓ Réparation modifiée avec succès !');
            } else {
                // Créer la réparation
                const repairData = {
                    establishment_id: establishmentId,
                    client_id: clientId,
                    code: generateCode(),
                    item: formData.item,
                    description: formData.description,
                    status: formData.status,
                    price: formData.price ? parseFloat(formData.price) : null,
                    cost_price: costPrice,
                    is_unlock: formData.is_unlock,
                    imei_sn: formData.is_unlock ? formData.imei_sn : null,
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

                // Afficher le ticket
                setShowTicket(true);
            }

            // Réinitialiser et recharger
            setFormData({
                clientId: '',
                clientName: '',
                clientPhone: '',
                item: '',
                description: '',
                status: 'nouveau',
                price: '',
                cost_price: '',
                is_unlock: false,
                imei_sn: '',
            });
            setShowModal(false);
            setEditingRepair(null);
            await fetchData();
        } catch (error: any) {
            console.error('Full error:', error);
            alert('Erreur: ' + (error.message || 'Erreur inconnue'));
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRepairs = repairs.filter(r => {
        // Filtre de recherche
        const matchesSearch =
            r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.client?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.imei_sn?.toLowerCase().includes(searchTerm.toLowerCase());

        // Filtre de statut
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

        // Filtre de paiement
        const matchesPayment =
            paymentFilter === 'all' ||
            (paymentFilter === 'paid' && r.payment_status === 'paid') ||
            (paymentFilter === 'unpaid' && r.payment_status !== 'paid');

        return matchesSearch && matchesStatus && matchesPayment;
    });

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

    const handlePayment = async () => {
        if (!selectedRepair) return;

        setSubmitting(true);
        try {
            // Mettre à jour la réparation
            const { error: repairError } = await supabase
                .from('repairs')
                .update({
                    payment_status: 'paid',
                    payment_method: paymentMethod,
                    paid_amount: paymentAmount,
                    paid_at: new Date().toISOString(),
                    paid: true, // Pour compatibilité avec l'ancienne colonne
                })
                .eq('id', selectedRepair.id);

            if (repairError) throw repairError;

            // Créer un enregistrement de paiement
            const { error: paymentError } = await supabase
                .from('payments')
                .insert([{
                    repair_id: selectedRepair.id,
                    establishment_id: establishmentId,
                    amount: paymentAmount,
                    payment_method: paymentMethod,
                    status: 'completed',
                    note: paymentNote || null,
                }]);

            if (paymentError) throw paymentError;

            alert('✓ Paiement enregistré avec succès !');
            setShowPaymentModal(false);
            setSelectedRepair(null);
            setPaymentNote('');
            await fetchData();
        } catch (error: any) {
            console.error('Payment error:', error);
            alert('Erreur lors de l\'enregistrement du paiement');
        } finally {
            setSubmitting(false);
        }
    };

    const deleteRepair = async (repairId: string, repairCode: string) => {
        try {
            // D'abord, vérifier s'il y a des paiements associés
            const { data: paymentsData, error: checkError } = await supabase
                .from('payments')
                .select('id')
                .eq('repair_id', repairId);

            if (checkError) {
                console.error('Error checking payments:', checkError);
                throw new Error('Erreur lors de la vérification des paiements');
            }

            const hasPayments = paymentsData && paymentsData.length > 0;

            // Message de confirmation adapté
            const confirmMessage = hasPayments
                ? `Êtes-vous sûr de vouloir supprimer la réparation ${repairCode} ?\n\n⚠️ Cette réparation a ${paymentsData.length} paiement(s) associé(s) qui seront également supprimés.\n\nCette action est irréversible.`
                : `Êtes-vous sûr de vouloir supprimer la réparation ${repairCode} ?\n\nCette action est irréversible.`;

            if (!confirm(confirmMessage)) {
                return;
            }

            // Si des paiements existent, les supprimer d'abord
            if (hasPayments) {
                console.log(`Suppression de ${paymentsData.length} paiement(s)...`);

                const { error: paymentsError } = await supabase
                    .from('payments')
                    .delete()
                    .eq('repair_id', repairId);

                if (paymentsError) {
                    console.error('Error deleting payments:', paymentsError);
                    throw new Error(`Impossible de supprimer les paiements associés: ${paymentsError.message}`);
                }

                console.log('Paiements supprimés avec succès');

                // Petit délai pour s'assurer que la suppression est bien propagée
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Maintenant, supprimer la réparation
            console.log('Suppression de la réparation...');
            const { error: repairError } = await supabase
                .from('repairs')
                .delete()
                .eq('id', repairId);

            if (repairError) {
                console.error('Error deleting repair:', repairError);
                throw new Error(`Impossible de supprimer la réparation: ${repairError.message}`);
            }

            const successMessage = hasPayments
                ? `✓ Réparation et ${paymentsData.length} paiement(s) supprimés avec succès !`
                : '✓ Réparation supprimée avec succès !';

            alert(successMessage);
            await fetchData();
        } catch (error: any) {
            console.error('Delete error:', error);
            alert('❌ Erreur lors de la suppression :\n\n' + (error.message || 'Erreur inconnue'));
        }
    };

    const handleEdit = (repair: any) => {
        setEditingRepair(repair);
        setFormData({
            clientId: repair.client_id,
            clientName: repair.client?.name || '',
            clientPhone: repair.client?.phone || '',
            item: repair.item,
            description: repair.description || '',
            status: repair.status,
            price: repair.price?.toString() || '',
            cost_price: repair.cost_price?.toString() || '',
            is_unlock: repair.is_unlock || false,
            imei_sn: repair.imei_sn || '',
        });
        setShowModal(true);
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

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                {/* Barre de recherche */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par code, appareil, client, téléphone ou IMEI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                    />
                </div>

                {/* Filtres */}
                <div className="flex gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm"
                    >
                        <option value="all">📋 Tous les statuts</option>
                        <option value="nouveau">🆕 Nouveau</option>
                        <option value="diagnostic">🔍 Diagnostic</option>
                        <option value="en_reparation">🔧 En cours</option>
                        <option value="pret_recup">✅ Prêt</option>
                        <option value="recupere">📦 Récupéré</option>
                        <option value="annule">❌ Annulé</option>
                    </select>

                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm"
                    >
                        <option value="all">💳 Tous les paiements</option>
                        <option value="paid">✓ Payé</option>
                        <option value="unpaid">⏳ Non payé</option>
                    </select>

                    {/* Compteur de résultats */}
                    <div className="flex items-center px-4 py-2 bg-gray-50 rounded-xl text-sm text-neutral-600">
                        <span className="font-medium">{filteredRepairs.length}</span>
                        <span className="ml-1">résultat{filteredRepairs.length > 1 ? 's' : ''}</span>
                    </div>
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
                                    <th className="px-6 py-4 text-left">Paiement</th>
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
                                        <td className="px-6 py-4 text-neutral-700">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    {repair.item}
                                                    {repair.is_unlock && (
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                                            🔓 Déblocage
                                                        </span>
                                                    )}
                                                </div>
                                                {repair.is_unlock && repair.imei_sn && (
                                                    <p className="text-xs text-neutral-500 font-mono mt-1">
                                                        IMEI: {repair.imei_sn}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`${statusColors[repair.status]} px-3 py-1 rounded-lg text-xs font-bold`}>
                                                {statusLabels[repair.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-neutral-900">
                                            {repair.payment_status === 'paid' && repair.paid_amount
                                                ? `${parseFloat(repair.paid_amount).toLocaleString('fr-DZ')} DA`
                                                : repair.price
                                                    ? `${parseFloat(repair.price).toLocaleString('fr-DZ')} DA`
                                                    : '-'
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            {repair.payment_status === 'paid' ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold">
                                                        ✓ Payé
                                                    </span>
                                                    <span className="text-xs text-neutral-500">
                                                        {repair.payment_method === 'baridimob' ? 'BaridiMob' : 'Cash'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setSelectedRepair(repair);
                                                        setPaymentAmount(parseFloat(repair.price) || 0);
                                                        setPaymentNote('');
                                                        setShowPaymentModal(true);
                                                    }}
                                                    className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                                                    disabled={!repair.price}
                                                >
                                                    💰 Payé
                                                </button>
                                            )}
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
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(repair);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg border border-primary text-primary text-xs font-medium hover:bg-primary/10 transition-colors flex items-center gap-1"
                                                    title="Modifier la réparation"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteRepair(repair.id, repair.code);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors flex items-center gap-1"
                                                    title="Supprimer la réparation"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                                <h2 className="text-xl font-bold text-neutral-900">{editingRepair ? 'Modifier la réparation' : 'Nouvelle Réparation'}</h2>
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
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">
                                                    +213
                                                </span>
                                                <input
                                                    type="tel"
                                                    value={formData.clientPhone.replace('+213', '').trim()}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                                        setFormData({ ...formData, clientPhone: value ? `+213 ${value}` : '' });
                                                    }}
                                                    className="w-full pl-16 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50"
                                                    placeholder="550123456"
                                                    maxLength={9}
                                                />
                                            </div>
                                            <p className="text-xs text-neutral-400 mt-1">
                                                Format: 9 chiffres sans le 0 (ex: 550123456)
                                            </p>
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

                                    {/* Prix et Coût sur la même ligne */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Prix de vente (DA)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50"
                                                placeholder="5000"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Prix de revient (DA)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.cost_price}
                                                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50"
                                                placeholder="3000"
                                            />
                                            <p className="text-xs text-neutral-500 mt-1">
                                                Coût des pièces, déblocage, etc.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Affichage du bénéfice */}
                                    {formData.price && formData.cost_price && (
                                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-neutral-700">
                                                    💰 Bénéfice estimé :
                                                </span>
                                                <span className={`text-lg font-bold ${(parseFloat(formData.price) - parseFloat(formData.cost_price)) >= 0
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                    }`}>
                                                    {(parseFloat(formData.price) - parseFloat(formData.cost_price)).toLocaleString('fr-DZ')} DA
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Checkbox Déblocage */}
                                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <input
                                            type="checkbox"
                                            id="is_unlock"
                                            checked={formData.is_unlock}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                is_unlock: e.target.checked,
                                                imei_sn: e.target.checked ? formData.imei_sn : ''
                                            })}
                                            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary/20"
                                        />
                                        <label htmlFor="is_unlock" className="text-sm font-medium text-neutral-700 cursor-pointer">
                                            🔓 Déblocage (IMEI/SN requis)
                                        </label>
                                    </div>

                                    {/* Champ IMEI/SN conditionnel */}
                                    {formData.is_unlock && (
                                        <div className="animate-in slide-in-from-top-2 duration-200">
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                IMEI / Numéro de série *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.imei_sn}
                                                onChange={(e) => setFormData({ ...formData, imei_sn: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 font-mono"
                                                placeholder="123456789012345"
                                                required={formData.is_unlock}
                                            />
                                            <p className="text-xs text-neutral-500 mt-1">
                                                Tapez *#06# sur le téléphone pour obtenir l'IMEI
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                                        Annuler
                                    </Button>
                                    <Button type="submit" disabled={submitting} className="flex-1">
                                        {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {editingRepair ? 'Modification...' : 'Création...'}</> : editingRepair ? 'Modifier' : 'Créer la réparation'}
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

            {/* Modal de Paiement */}
            <AnimatePresence>
                {showPaymentModal && selectedRepair && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
                        >
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-neutral-900 mb-2">Enregistrer le paiement</h2>
                                <p className="text-sm text-neutral-500">
                                    Réparation : {selectedRepair.code}
                                </p>
                            </div>

                            <div className="space-y-4 mb-6">
                                {/* Montant personnalisable */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Montant à encaisser
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                                            className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg font-bold"
                                            step="0.01"
                                            min="0"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">
                                            DA
                                        </span>
                                    </div>
                                    {selectedRepair.price && parseFloat(selectedRepair.price) !== paymentAmount && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            Prix initial : {parseFloat(selectedRepair.price).toLocaleString('fr-DZ')} DA
                                            {paymentAmount > parseFloat(selectedRepair.price)
                                                ? ` (+${(paymentAmount - parseFloat(selectedRepair.price)).toLocaleString('fr-DZ')} DA)`
                                                : ` (${(paymentAmount - parseFloat(selectedRepair.price)).toLocaleString('fr-DZ')} DA)`
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* Note optionnelle */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Note (optionnel)
                                    </label>
                                    <textarea
                                        value={paymentNote}
                                        onChange={(e) => setPaymentNote(e.target.value)}
                                        placeholder="Ex: Pièce supplémentaire, frais de déplacement..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        rows={2}
                                        maxLength={200}
                                    />
                                    <p className="text-xs text-neutral-400 mt-1">
                                        {paymentNote.length}/200 caractères
                                    </p>
                                </div>

                                {/* Méthode de paiement */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                                        Méthode de paiement
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setPaymentMethod('cash')}
                                            className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'cash'
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="text-3xl mb-2">💵</div>
                                            <p className="font-medium text-sm">Espèces</p>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('baridimob')}
                                            className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'baridimob'
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="text-3xl mb-2">📱</div>
                                            <p className="font-medium text-sm">BaridiMob</p>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setSelectedRepair(null);
                                    }}
                                    className="flex-1"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handlePayment}
                                    disabled={submitting}
                                    className="flex-1"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        '✓ Confirmer le paiement'
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

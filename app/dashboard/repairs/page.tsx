'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Search, X, Loader2, Smartphone, User, DollarSign, Calendar, Filter, MoreHorizontal, Printer, Edit3, Trash2, CheckCircle2, AlertCircle, Info, Clock, Check, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { RepairTicket } from '@/components/ui/RepairTicket';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { RepairLabel } from '@/components/ui/RepairLabel';

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
    const [showLabel, setShowLabel] = useState(false);
    const [ticketData, setTicketData] = useState<any>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedRepair, setSelectedRepair] = useState<any>(null);
    const [editingRepair, setEditingRepair] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentNote, setPaymentNote] = useState('');
    const [inventory, setInventory] = useState<any[]>([]);
    const [selectedParts, setSelectedParts] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        clientId: '',
        clientName: '',
        clientPhone: '',
        item: '',
        description: '',
        additional_info: '',
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

            const { data: repairsData } = await supabase
                .from('repairs')
                .select(`
          *,
          client:clients(name, phone)
        `)
                .eq('establishment_id', establishmentData.id)
                .order('created_at', { ascending: false });

            if (repairsData) setRepairs(repairsData);

            const { data: clientsData } = await supabase
                .from('clients')
                .select('*')
                .eq('establishment_id', establishmentData.id)
                .order('name');

            if (clientsData) setClients(clientsData);

            const { data: inventoryData } = await supabase
                .from('inventory')
                .select('*')
                .eq('establishment_id', establishmentData.id)
                .order('name');
            if (inventoryData) setInventory(inventoryData);
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
        if (!establishmentId) return;

        setSubmitting(true);
        try {
            let clientId = formData.clientId;

            if (!editingRepair && !clientId && formData.clientName) {
                const { data: newClient, error: clientError } = await supabase
                    .from('clients')
                    .insert([{
                        establishment_id: establishmentId,
                        name: formData.clientName,
                        phone: formData.clientPhone,
                    }])
                    .select()
                    .single();

                if (clientError) throw clientError;
                clientId = newClient.id;
            }

            if (!clientId) throw new Error('Aucun client sélectionné ou créé');

            const costPrice = formData.cost_price ? parseFloat(formData.cost_price) : 0;

            if (editingRepair) {
                const updateData = {
                    client_id: clientId,
                    item: formData.item,
                    description: formData.description,
                    additional_info: formData.additional_info || null,
                    status: formData.status,
                    price: formData.price ? parseFloat(formData.price) : null,
                    cost_price: costPrice,
                    is_unlock: formData.is_unlock,
                    imei_sn: formData.is_unlock ? formData.imei_sn : null,
                    updated_at: new Date().toISOString(),
                };

                const { error: repairError } = await supabase
                    .from('repairs')
                    .update(updateData)
                    .eq('id', editingRepair.id);

                if (repairError) throw repairError;

                // Update parts (simplified: delete old ones and re-insert)
                await supabase.from('repair_parts').delete().eq('repair_id', editingRepair.id);
                if (selectedParts.length > 0) {
                    const partsToInsert = selectedParts.map(p => ({
                        repair_id: editingRepair.id,
                        inventory_id: p.id,
                        quantity: p.quantity || 1,
                        unit_cost: p.cost_price,
                        unit_price: p.selling_price
                    }));
                    await supabase.from('repair_parts').insert(partsToInsert);
                }
            } else {
                const repairData = {
                    establishment_id: establishmentId,
                    client_id: clientId,
                    code: generateCode(),
                    item: formData.item,
                    description: formData.description,
                    additional_info: formData.additional_info || null,
                    status: formData.status,
                    price: formData.price ? parseFloat(formData.price) : null,
                    cost_price: costPrice,
                    is_unlock: formData.is_unlock,
                    imei_sn: formData.is_unlock ? formData.imei_sn : null,
                };

                const { data: repairResult, error: repairError } = await supabase
                    .from('repairs')
                    .insert([repairData])
                    .select();

                if (repairError) throw repairError;

                const newRepair = repairResult[0];

                if (selectedParts.length > 0) {
                    const partsToInsert = selectedParts.map(p => ({
                        repair_id: newRepair.id,
                        inventory_id: p.id,
                        quantity: p.quantity || 1,
                        unit_cost: p.cost_price,
                        unit_price: p.selling_price
                    }));
                    await supabase.from('repair_parts').insert(partsToInsert);
                }

                const clientData = clients.find(c => c.id === clientId) || {
                    name: formData.clientName,
                    phone: formData.clientPhone,
                };

                setTicketData({
                    ...newRepair,
                    client: clientData,
                });
                setShowTicket(true);
            }

            setFormData({
                clientId: '',
                clientName: '',
                clientPhone: '',
                item: '',
                description: '',
                additional_info: '',
                status: 'nouveau',
                price: '',
                cost_price: '',
                is_unlock: false,
                imei_sn: '',
            });
            setShowModal(false);
            setEditingRepair(null);
            setSelectedParts([]);
            await fetchData();
        } catch (error: any) {
            console.error('Error:', error);
            alert('Erreur: ' + (error.message || 'Erreur inconnue'));
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRepairs = repairs.filter(r => {
        const matchesSearch =
            r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.client?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.imei_sn?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchesPayment =
            paymentFilter === 'all' ||
            (paymentFilter === 'paid' && r.payment_status === 'paid') ||
            (paymentFilter === 'unpaid' && r.payment_status !== 'paid');

        return matchesSearch && matchesStatus && matchesPayment;
    });

    const statusColors: Record<string, string> = {
        nouveau: 'bg-blue-50 text-blue-600',
        diagnostic: 'bg-amber-50 text-amber-600',
        en_reparation: 'bg-indigo-50 text-indigo-600',
        pret_recup: 'bg-emerald-50 text-emerald-600',
        recupere: 'bg-neutral-50 text-neutral-400',
        annule: 'bg-red-50 text-red-600',
    };

    const statusLabels: Record<string, string> = {
        nouveau: 'Nouveau',
        diagnostic: 'Diagnostic',
        en_reparation: 'Réparation',
        pret_recup: 'Terminé',
        recupere: 'Livré',
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
            await fetchData();
        } catch (error: any) {
            console.error('Error updating status:', error);
        }
    };

    const handlePayment = async () => {
        if (!selectedRepair) return;
        setSubmitting(true);
        try {
            const { error: repairError } = await supabase
                .from('repairs')
                .update({
                    payment_status: 'paid',
                    payment_method: paymentMethod,
                    paid_amount: paymentAmount,
                    paid_at: new Date().toISOString(),
                    paid: true,
                })
                .eq('id', selectedRepair.id);

            if (repairError) throw repairError;

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

            setShowPaymentModal(false);
            setSelectedRepair(null);
            setPaymentNote('');
            await fetchData();
        } catch (error: any) {
            console.error('Payment error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const deleteRepair = async (repairId: string, repairCode: string) => {
        if (!confirm(`Supprimer définitivement ${repairCode} ?`)) return;
        try {
            const { error } = await supabase.from('repairs').delete().eq('id', repairId);
            if (error) throw error;
            await fetchData();
        } catch (error: any) {
            console.error('Delete error:', error);
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
            additional_info: repair.additional_info || '',
            status: repair.status,
            price: repair.price?.toString() || '',
            cost_price: repair.cost_price?.toString() || '',
            is_unlock: repair.is_unlock || false,
            imei_sn: repair.imei_sn || '',
        });
        setShowModal(true);

        // Fetch parts for this repair
        const fetchParts = async () => {
            const { data } = await supabase
                .from('repair_parts')
                .select('*, inventory(*)')
                .eq('repair_id', repair.id);
            if (data) {
                setSelectedParts(data.map(p => ({
                    ...p.inventory,
                    quantity: p.quantity,
                    cost_price: p.unit_cost,
                    selling_price: p.unit_price
                })));
            }
        };
        fetchParts();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1600px] mx-auto pb-24 px-4 md:px-8"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">SAV & Maintenance</span>
                    </motion.div>
                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-2"
                    >
                        Réparations
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-lg text-neutral-500 font-medium"
                    >
                        Gérez le cycle de vie complet de vos interventions techniques.
                    </motion.p>
                </div>
                <motion.div variants={itemVariants}>
                    <Button
                        onClick={() => {
                            setEditingRepair(null);
                            setFormData({
                                clientId: '', clientName: '', clientPhone: '', item: '', description: '',
                                additional_info: '', status: 'nouveau', price: '', cost_price: '',
                                is_unlock: false, imei_sn: '',
                            });
                            setShowModal(true);
                        }}
                        className="h-14 px-8 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-xl transition-all active:scale-[0.98] font-bold"
                    >
                        <Plus className="w-5 h-5 mr-3" />
                        Nouvelle Réparation
                    </Button>
                </motion.div>
            </div>

            {/* Filters Bar */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
                <div className="lg:col-span-5 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher par code, client, IMEI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-card shadow-sm font-medium text-foreground placeholder-neutral-400"
                    />
                </div>
                <div className="lg:col-span-3">
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 appearance-none bg-card shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 font-medium text-neutral-600 dark:text-neutral-400"
                        >
                            <option value="all">Tous les statuts</option>
                            {Object.entries(statusLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 appearance-none bg-card shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 font-medium text-neutral-600 dark:text-neutral-400"
                    >
                        <option value="all">Tout Paiement</option>
                        <option value="paid">Payé ✅</option>
                        <option value="unpaid">En attente ⏳</option>
                    </select>
                </div>
                <div className="lg:col-span-2 flex items-center justify-center bg-card rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm px-4">
                    <span className="text-xl font-black text-foreground">{filteredRepairs.length}</span>
                    <span className="ml-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">Dossiers</span>
                </div>
            </motion.div>

            {/* Repairs Table */}
            <motion.div variants={itemVariants} className="bg-card rounded-[2.5rem] shadow-soft border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#FBFBFD] dark:bg-neutral-900/50 text-neutral-400 text-[11px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-6">Équipement</th>
                                <th className="px-8 py-6">Propriétaire</th>
                                <th className="px-8 py-6">Statut & Suivi</th>
                                <th className="px-8 py-6">Finance</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                            {filteredRepairs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <Info className="w-12 h-12 text-neutral-100 dark:text-neutral-800 mx-auto mb-4" />
                                        <p className="text-neutral-400 font-bold">Aucune réparation ne correspond à vos critères.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRepairs.map((repair) => (
                                    <tr key={repair.id} className="group hover:bg-[#FBFBFD]/50 dark:hover:bg-neutral-900/50 transition-all border-l-4 border-l-transparent hover:border-l-primary/30">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl flex items-center justify-center text-neutral-400 group-hover:scale-110 transition-transform">
                                                    <Smartphone size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground text-base">{repair.item}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="font-mono text-[10px] text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded leading-none">#{repair.code}</span>
                                                        {repair.is_unlock && <span className="text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded uppercase tracking-tighter leading-none">Unlock</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-neutral-700 dark:text-neutral-300">{repair.client?.name || 'Client anonyme'}</div>
                                            <div className="text-neutral-400 text-xs mt-1 font-medium">{repair.client?.phone || 'Pas de contact'}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <span className={`${statusColors[repair.status]} dark:bg-opacity-20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight w-fit`}>
                                                    {statusLabels[repair.status]}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-bold">
                                                    <Calendar size={12} /> {new Date(repair.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="font-black text-foreground text-base">
                                                    {(repair.price || 0).toLocaleString()} <span className="text-[10px] text-neutral-400">DA</span>
                                                </div>
                                                {repair.payment_status === 'paid' ? (
                                                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                                        <Check size={10} strokeWidth={3} /> Payé
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRepair(repair);
                                                            setPaymentAmount(parseFloat(repair.price) || 0);
                                                            setShowPaymentModal(true);
                                                        }}
                                                        className="text-[10px] font-bold text-primary hover:underline w-fit"
                                                    >
                                                        Régler maintenant 💰
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setTicketData(repair); setShowLabel(true); }} className="p-2.5 bg-card text-neutral-600 dark:text-neutral-400 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-sm transition-all" title="Étiquette"><Tag size={18} /></button>
                                                <button onClick={() => { setTicketData(repair); setShowTicket(true); }} className="p-2.5 bg-card text-neutral-600 dark:text-neutral-400 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-sm transition-all" title="Ticket"><Printer size={18} /></button>
                                                <button onClick={() => handleEdit(repair)} className="p-2.5 bg-card text-blue-500 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-sm transition-all" title="Modifier"><Edit3 size={18} /></button>
                                                <button onClick={() => deleteRepair(repair.id, repair.code)} className="p-2.5 bg-card text-red-500 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm transition-all" title="Supprimer"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative bg-card rounded-[3rem] shadow-heavy max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-neutral-100 dark:border-neutral-800"
                        >
                            <div className="p-8 md:p-10 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">{editingRepair ? 'Modifier l\'intervention' : 'Nouvelle intervention'}</h2>
                                    <p className="text-sm text-neutral-400 font-medium">Saisissez les détails techniques et clients.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-800 transition-all active:scale-90"><X className="w-6 h-6 text-neutral-400" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 md:p-10 overflow-y-auto flex-1 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-primary">
                                                <User size={18} />
                                                <label className="text-sm font-black uppercase tracking-widest">Client & Contact</label>
                                            </div>
                                            <select
                                                value={formData.clientId}
                                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                                className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-neutral-50/50 dark:bg-neutral-900/50 font-medium text-foreground"
                                            >
                                                <option value="">+ Nouveau client</option>
                                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>

                                        {!formData.clientId && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2">
                                                <input
                                                    type="text" required
                                                    value={formData.clientName}
                                                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                                    className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-neutral-50/50 dark:bg-neutral-900/50 shadow-sm font-medium text-foreground"
                                                    placeholder="Nom complet"
                                                />
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">+213</span>
                                                    <input
                                                        type="tel"
                                                        value={formData.clientPhone.replace('+213', '').trim()}
                                                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value ? `+213 ${e.target.value}` : '' })}
                                                        className="w-full pl-16 pr-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-neutral-50/50 dark:bg-neutral-900/50 shadow-sm font-medium text-foreground"
                                                        placeholder="555 000 000"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="space-y-3 pt-4">
                                            <div className="flex items-center gap-2 text-indigo-500">
                                                <Smartphone size={18} />
                                                <label className="text-sm font-black uppercase tracking-widest">Équipement</label>
                                            </div>
                                            <input
                                                type="text" required
                                                value={formData.item}
                                                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                                                className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-neutral-50/50 dark:bg-neutral-900/50 shadow-sm font-medium text-foreground"
                                                placeholder="ex: iPhone 14 Pro Max, Galaxy S23..."
                                            />
                                            <div className="flex items-center gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/30">
                                                <input
                                                    type="checkbox" id="is_unlock"
                                                    checked={formData.is_unlock}
                                                    onChange={(e) => setFormData({ ...formData, is_unlock: e.target.checked })}
                                                    className="w-5 h-5 rounded-lg border-blue-200 text-blue-500 focus:ring-blue-500"
                                                />
                                                <label htmlFor="is_unlock" className="text-sm font-bold text-blue-700 dark:text-blue-400 cursor-pointer">S'agit-il d'un déblocage iCloud / Google ?</label>
                                            </div>
                                            {formData.is_unlock && (
                                                <motion.input
                                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                                    type="text"
                                                    value={formData.imei_sn}
                                                    onChange={(e) => setFormData({ ...formData, imei_sn: e.target.value })}
                                                    className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-neutral-50/50 dark:bg-neutral-900/50 shadow-sm font-medium font-mono text-sm text-foreground"
                                                    placeholder="Numéro IMEI ou SN"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-amber-500">
                                                <Info size={18} />
                                                <label className="text-sm font-black uppercase tracking-widest">Diagnostic & Travaux</label>
                                            </div>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-neutral-50/50 dark:bg-neutral-900/50 shadow-sm font-medium resize-none text-foreground px-4 py-3"
                                                rows={4} placeholder="Détails du problème et travaux à effectuer..."
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-primary font-bold">
                                                <Smartphone size={18} />
                                                <label className="text-sm font-black uppercase tracking-widest">Pièces de l'Inventaire</label>
                                            </div>
                                            <div className="flex gap-2">
                                                <select
                                                    className="flex-1 px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 shadow-sm font-medium text-foreground"
                                                    onChange={(e) => {
                                                        const item = inventory.find(i => i.id === e.target.value);
                                                        if (item && !selectedParts.find(p => p.id === item.id)) {
                                                            const newParts = [...selectedParts, { ...item, quantity: 1 }];
                                                            setSelectedParts(newParts);
                                                            const totalCost = newParts.reduce((acc, p) => acc + (p.cost_price * p.quantity), 0);
                                                            setFormData(f => ({ ...f, cost_price: totalCost.toString() }));
                                                        }
                                                        e.target.value = "";
                                                    }}
                                                >
                                                    <option value="">Ajouter une pièce...</option>
                                                    {inventory.filter(i => i.current_stock > 0).map(item => (
                                                        <option key={item.id} value={item.id}>
                                                            {item.name} ({item.current_stock} dispo)
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {selectedParts.length > 0 && (
                                                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-4 space-y-3">
                                                    {selectedParts.map((part, idx) => (
                                                        <div key={idx} className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center text-primary border border-neutral-100 dark:border-neutral-800 shadow-sm">
                                                                    <IconRenderer name={part.icon || 'Box'} size={14} />
                                                                </div>
                                                                <span className="font-bold text-neutral-700 dark:text-neutral-300">{part.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="font-mono text-[10px] bg-card px-2 py-1 rounded-lg border border-neutral-100 dark:border-neutral-800 text-foreground">{part.cost_price} DA</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newParts = selectedParts.filter((_, i) => i !== idx);
                                                                        setSelectedParts(newParts);
                                                                        const totalCost = newParts.reduce((acc, p) => acc + (p.cost_price * p.quantity), 0);
                                                                        setFormData(f => ({ ...f, cost_price: totalCost.toString() }));
                                                                    }}
                                                                    className="text-rose-500 hover:text-rose-600"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Prix Client (DA)</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                                    <input
                                                        type="number"
                                                        value={formData.price}
                                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-neutral-50/50 dark:bg-neutral-900/50 shadow-sm font-black text-foreground"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Coût Pièces (DA)</label>
                                                <div className="relative">
                                                    <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                                    <input
                                                        type="number"
                                                        value={formData.cost_price}
                                                        onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-neutral-50/50 dark:bg-neutral-900/50 shadow-sm font-black text-rose-500"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-indigo-500">
                                                <Clock size={18} />
                                                <label className="text-sm font-black uppercase tracking-widest">Étape Actuelle</label>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.entries(statusLabels).map(([key, label]) => (
                                                    <button
                                                        key={key} type="button"
                                                        onClick={() => setFormData({ ...formData, status: key })}
                                                        className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${formData.status === key ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-black shadow-lg' : 'bg-card border-neutral-100 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex gap-4">
                                    <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="h-14 flex-1 rounded-2xl text-neutral-400 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                        Annuler
                                    </Button>
                                    <Button type="submit" disabled={submitting} className="h-14 flex-[2] rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black font-black hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-xl active:scale-[0.98] transition-all">
                                        {submitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (editingRepair ? 'Enregistrer les modifications' : 'Créer le dossier SAV')}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 font-inter"
                        >
                            <h3 className="text-2xl font-bold text-neutral-900 mb-2 font-inter">Encaisser le paiement</h3>
                            <p className="text-sm text-neutral-500 font-medium mb-8 font-inter">Dossier #{selectedRepair?.code} - {selectedRepair?.item}</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block px-1">Montant à régler (DA)</label>
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
                                        className="w-full px-6 py-5 rounded-3xl border-2 border-neutral-100 focus:border-primary focus:outline-none text-2xl font-black text-center transition-all bg-neutral-50 font-inter"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {['cash', 'baridimob'].map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`py-4 rounded-2xl border-2 font-bold transition-all font-inter ${paymentMethod === method ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-100 text-neutral-400 hover:bg-neutral-50'}`}
                                        >
                                            {method === 'cash' ? '💵 Cash' : '📱 BaridiMob'}
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    value={paymentNote}
                                    onChange={(e) => setPaymentNote(e.target.value)}
                                    placeholder="Note interne (facultatif)..."
                                    className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:outline-none bg-neutral-50 font-medium text-sm px-4 py-3 font-inter"
                                />

                                <Button
                                    onClick={handlePayment}
                                    disabled={submitting}
                                    className="w-full h-14 rounded-2xl bg-neutral-900 text-white font-black hover:bg-neutral-800 transition-all shadow-xl active:scale-95 font-inter"
                                >
                                    {submitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-white" /> : 'Confirmer l\'encaissement'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {showTicket && ticketData && establishment && (
                <RepairTicket
                    repair={ticketData}
                    establishment={establishment}
                    onClose={() => setShowTicket(false)}
                />
            )}

            {showLabel && ticketData && (
                <RepairLabel
                    repair={ticketData}
                    onClose={() => setShowLabel(false)}
                />
            )}
        </motion.div >
    );
}

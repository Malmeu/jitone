'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Loader2, Edit3, Trash2, X, User, Phone, Mail, Calendar, Info, Users, Smartphone, History } from 'lucide-react';
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
                const { error } = await supabase
                    .from('clients')
                    .update({
                        name: formData.name,
                        phone: formData.phone || null,
                        email: formData.email || null,
                    })
                    .eq('id', editingClient.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('clients')
                    .insert([{
                        establishment_id: establishmentId,
                        name: formData.name,
                        phone: formData.phone || null,
                        email: formData.email || null,
                    }]);

                if (error) throw error;
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
        if (!confirm(`Supprimer le client "${clientName}" ?`)) return;
        try {
            const { error } = await supabase.from('clients').delete().eq('id', clientId);
            if (error) throw error;
            await fetchClients();
        } catch (error: any) {
            console.error('Delete error:', error);
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
            className="max-w-[1600px] mx-auto pb-24 px-4 md:px-8 font-inter"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Base CRM</span>
                    </motion.div>
                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-2 font-inter"
                    >
                        Répertoire Clients
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-lg text-neutral-500 font-medium font-inter"
                    >
                        Gérez vos relations et l'historique de vos interventions par client.
                    </motion.p>
                </div>
                <motion.div variants={itemVariants}>
                    <Button
                        onClick={() => {
                            setEditingClient(null);
                            setFormData({ name: '', phone: '', email: '' });
                            setShowModal(true);
                        }}
                        className="h-14 px-8 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white shadow-xl transition-all active:scale-[0.98] font-bold font-inter"
                    >
                        <Plus className="w-5 h-5 mr-3" />
                        Ajouter un Client
                    </Button>
                </motion.div>
            </div>

            {/* Search Bar */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
                <div className="lg:col-span-8 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, téléphone, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-white shadow-sm font-medium font-inter"
                    />
                </div>
                <div className="lg:col-span-4 flex items-center justify-between bg-white rounded-2xl border border-neutral-100 shadow-sm px-8 py-4">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-neutral-900 leading-none">{clients.length}</span>
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Total base</span>
                    </div>
                    <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400">
                        <Users size={20} />
                    </div>
                </div>
            </motion.div>

            {/* Table */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-100 overflow-hidden font-inter">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#FBFBFD] text-neutral-400 text-[11px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-6">Propriétaire</th>
                                <th className="px-8 py-6">Contact</th>
                                <th className="px-8 py-6">Interventions</th>
                                <th className="px-8 py-6">Date de création</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 font-inter">
                            {filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center font-inter">
                                        <Info className="w-12 h-12 text-neutral-100 mx-auto mb-4" />
                                        <p className="text-neutral-400 font-bold">Aucun client trouvé.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="group hover:bg-[#FBFBFD]/50 transition-all border-l-4 border-l-transparent hover:border-l-primary/30">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400 group-hover:scale-110 transition-transform">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-neutral-900 text-base">{client.name}</div>
                                                    <div className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mt-0.5">Utilisateur</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-neutral-600 font-bold">
                                                    <Phone size={14} className="text-neutral-300" />
                                                    {client.phone || '-'}
                                                </div>
                                                {client.email && (
                                                    <div className="flex items-center gap-2 text-neutral-400 text-xs">
                                                        <Mail size={14} className="text-neutral-200" />
                                                        {client.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl">
                                                <History size={14} className="text-blue-400" />
                                                <span className="text-xs font-black text-blue-600">{client.repairs?.[0]?.count || 0}</span>
                                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tight">Réparations</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium">
                                                <Calendar size={14} className="text-neutral-200" />
                                                {new Date(client.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(client)} className="p-2.5 bg-white text-blue-500 rounded-xl border border-neutral-100 hover:bg-blue-50 shadow-sm transition-all" title="Modifier"><Edit3 size={18} /></button>
                                                <button onClick={() => handleDelete(client.id, client.name)} className="p-2.5 bg-white text-red-500 rounded-xl border border-neutral-100 hover:bg-red-50 shadow-sm transition-all" title="Supprimer"><Trash2 size={18} /></button>
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
                            className="relative bg-white rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,0.18)] max-w-md w-full overflow-hidden flex flex-col font-inter"
                        >
                            <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-[#FBFBFD]/50">
                                <div>
                                    <h2 className="text-xl font-bold text-neutral-900">{editingClient ? 'Modifier le client' : 'Créer un nouveau client'}</h2>
                                    <p className="text-xs text-neutral-400 font-medium">Prenez soin de remplir les contacts correctly.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center bg-white hover:bg-neutral-100 rounded-xl border border-neutral-100 transition-all active:scale-90"><X className="w-5 h-5 text-neutral-400" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Prénom & Nom *</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                        <input
                                            type="text" required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-11 pr-4 py-4 rounded-2xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-white font-medium"
                                            placeholder="ex: Ahmed Mansouri"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Téléphone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-11 pr-4 py-4 rounded-2xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-white font-medium"
                                            placeholder="ex: 0555 12 34 56"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-11 pr-4 py-4 rounded-2xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-white font-medium"
                                            placeholder="ex: client@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1 rounded-2xl h-14 font-extrabold text-neutral-400 font-inter">Annuler</Button>
                                    <Button type="submit" disabled={submitting} className="flex-[2] rounded-2xl h-14 bg-neutral-900 text-white font-black hover:bg-neutral-800 shadow-xl transition-all font-inter">
                                        {submitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-white" /> : (editingClient ? 'Enregistrer' : 'Créer sa fiche')}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

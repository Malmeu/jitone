'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Search, X, Loader2, Smartphone, User, DollarSign, Calendar, Filter, MoreHorizontal, Printer, Edit3, Trash2, CheckCircle2, AlertCircle, Info, Clock, Check, Tag, Box, Package } from 'lucide-react';
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
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [activeStatusMenu, setActiveStatusMenu] = useState<string | null>(null);
    const [faultTypes, setFaultTypes] = useState<any[]>([]);
    const [showFaultTypesModal, setShowFaultTypesModal] = useState(false);
    const [faultTypeForm, setFaultTypeForm] = useState({ name: '', description: '', icon: 'AlertCircle', color: 'neutral' });

    // États pour les tabs et interventions
    const [repairType, setRepairType] = useState<'simple' | 'intervention'>('simple');
    const [interventionDevices, setInterventionDevices] = useState<any[]>([
        { id: 1, model: '', imei: '', faults: [], notes: '' }
    ]);

    // États pour la gestion des pièces par panne
    const [showPartsModal, setShowPartsModal] = useState(false);
    const [currentFaultForParts, setCurrentFaultForParts] = useState<{ deviceId: number, faultId: string } | null>(null);
    const [faultParts, setFaultParts] = useState<Record<string, any[]>>({});  // { "deviceId-faultId": [parts] }

    const [formData, setFormData] = useState({
        clientId: '',
        clientName: '',
        clientPhone: '',
        item: '',
        description: '',
        additional_info: '',
        fault_type_id: '',
        status: 'nouveau',
        price: '',
        cost_price: '',
        is_unlock: false,
        imei_sn: '',
        assigned_to: '',
        payment_status: 'unpaid',
        paid_amount: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch current user profile to get establishment_id and role
            const { data: profile } = await supabase
                .from('profiles')
                .select('*, establishment:establishments(*)')
                .eq('user_id', user.id)
                .single();

            if (!profile) return;
            setUserProfile(profile);
            setEstablishmentId(profile.establishment_id);
            setEstablishment(profile.establishment);

            let query = supabase
                .from('repairs')
                .select(`
                  *,
                  client:clients(name, phone),
                  technician:profiles!repairs_assigned_to_fkey(name)
                `)
                .eq('establishment_id', profile.establishment_id);

            if (profile.role === 'technician') {
                query = query.eq('assigned_to', profile.id);
            }

            const { data: repairsData } = await query.order('created_at', { ascending: false });

            if (repairsData) setRepairs(repairsData);

            const { data: clientsData } = await supabase
                .from('clients')
                .select('*')
                .eq('establishment_id', profile.establishment_id)
                .order('name');

            if (clientsData) setClients(clientsData);

            const { data: teamData } = await supabase
                .from('profiles')
                .select('*')
                .eq('establishment_id', profile.establishment_id)
                .eq('status', 'active');
            if (teamData) setTeamMembers(teamData);

            const { data: inventoryData } = await supabase
                .from('inventory')
                .select('*')
                .eq('establishment_id', profile.establishment_id)
                .order('name');
            if (inventoryData) setInventory(inventoryData);

            const { data: faultTypesData } = await supabase
                .from('fault_types')
                .select('*')
                .eq('establishment_id', profile.establishment_id)
                .eq('is_active', true)
                .order('name');
            if (faultTypesData) setFaultTypes(faultTypesData);
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

    // Fonctions pour gérer les appareils d'intervention
    const addDevice = () => {
        const newId = Math.max(...interventionDevices.map(d => d.id), 0) + 1;
        setInterventionDevices([...interventionDevices, {
            id: newId,
            model: '',
            imei: '',
            faults: [],
            notes: ''
        }]);
    };

    const removeDevice = (deviceId: number) => {
        if (interventionDevices.length === 1) {
            alert('Vous devez avoir au moins un appareil');
            return;
        }
        setInterventionDevices(interventionDevices.filter(d => d.id !== deviceId));
    };

    const updateDevice = (deviceId: number, field: string, value: any) => {
        setInterventionDevices(interventionDevices.map(d =>
            d.id === deviceId ? { ...d, [field]: value } : d
        ));
    };

    const toggleFault = (deviceId: number, faultId: string) => {
        setInterventionDevices(interventionDevices.map(d => {
            if (d.id !== deviceId) return d;

            const faults = d.faults || [];
            const faultIndex = faults.findIndex((f: any) => f.id === faultId);

            if (faultIndex > -1) {
                // Retirer la panne
                return { ...d, faults: faults.filter((f: any) => f.id !== faultId) };
            } else {
                // Ajouter la panne
                const faultType = faultTypes.find(ft => ft.id === faultId);
                return { ...d, faults: [...faults, { id: faultId, price: 0, name: faultType?.name }] };
            }
        }));
    };

    const updateFaultPrice = (deviceId: number, faultId: string, price: number) => {
        setInterventionDevices(interventionDevices.map(d => {
            if (d.id !== deviceId) return d;
            return {
                ...d,
                faults: d.faults.map((f: any) =>
                    f.id === faultId ? { ...f, price } : f
                )
            };
        }));
    };

    // Calculer le total d'une intervention
    const calculateInterventionTotal = () => {
        return interventionDevices.reduce((total, device) => {
            const deviceTotal = (device.faults || []).reduce((sum: number, fault: any) => sum + (fault.price || 0), 0);
            return total + deviceTotal;
        }, 0);
    };

    // Fonctions pour gérer les pièces par panne
    const openPartsModal = (deviceId: number, faultId: string) => {
        setCurrentFaultForParts({ deviceId, faultId });
        setShowPartsModal(true);
    };

    const addPartToFault = (part: any, quantity: number) => {
        if (!currentFaultForParts) return;

        const key = `${currentFaultForParts.deviceId}-${currentFaultForParts.faultId}`;
        const existingParts = faultParts[key] || [];

        // Vérifier si la pièce existe déjà
        const existingIndex = existingParts.findIndex(p => p.id === part.id);
        const oldQuantity = existingIndex >= 0 ? existingParts[existingIndex].quantity : 0;
        const diff = (quantity - oldQuantity) * (part.selling_price || 0);

        if (existingIndex >= 0) {
            // Mettre à jour la quantité
            const updated = [...existingParts];
            updated[existingIndex] = { ...part, quantity };
            setFaultParts({ ...faultParts, [key]: updated });
        } else {
            // Ajouter la pièce
            setFaultParts({ ...faultParts, [key]: [...existingParts, { ...part, quantity }] });
        }

        // Mettre à jour automatiquement le prix de la panne
        if (diff !== 0) {
            const device = interventionDevices.find(d => d.id === currentFaultForParts.deviceId);
            const fault = device?.faults?.find((f: any) => f.id === currentFaultForParts.faultId);
            if (fault) {
                updateFaultPrice(currentFaultForParts.deviceId, currentFaultForParts.faultId, (fault.price || 0) + diff);
            }
        }
    };

    const removePartFromFault = (deviceId: number, faultId: string, partId: string) => {
        const key = `${deviceId}-${faultId}`;
        const existingParts = faultParts[key] || [];
        const partToRemove = existingParts.find(p => p.id === partId);

        if (partToRemove) {
            const refundAmount = (partToRemove.quantity || 0) * (partToRemove.selling_price || 0);

            // Mettre à jour les pièces
            setFaultParts({ ...faultParts, [key]: existingParts.filter(p => p.id !== partId) });

            // Mettre à jour le prix de la panne
            const device = interventionDevices.find(d => d.id === deviceId);
            const fault = device?.faults?.find((f: any) => f.id === faultId);
            if (fault) {
                updateFaultPrice(deviceId, faultId, Math.max(0, (fault.price || 0) - refundAmount));
            }
        }
    };

    const getFaultParts = (deviceId: number, faultId: string) => {
        const key = `${deviceId}-${faultId}`;
        return faultParts[key] || [];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!establishmentId) return;

        // Gérer les interventions multi-appareils
        if (repairType === 'intervention') {
            try {
                console.log('📱 Début sauvegarde intervention');
                console.log('Appareils:', interventionDevices);
                console.log('Mode édition:', !!editingRepair);

                // 1. Créer ou récupérer le client
                let clientId = formData.clientId;
                if (!clientId) {
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

                // 2. Créer ou mettre à jour la réparation principale
                const devicesSummary = interventionDevices
                    .filter(d => d.model)
                    .map(d => d.model)
                    .join(' + ');

                let repair;
                if (editingRepair) {
                    // Mode édition : mettre à jour
                    const { data: updatedRepair, error: repairError } = await supabase
                        .from('repairs')
                        .update({
                            client_id: clientId,
                            item: devicesSummary || 'Intervention multi-appareils',
                            description: formData.description || `Intervention sur ${interventionDevices.length} appareil(s)`,
                            status: formData.status,
                            assigned_to: formData.assigned_to || null,
                        })
                        .eq('id', editingRepair.id)
                        .select()
                        .single();

                    if (repairError) throw repairError;
                    repair = updatedRepair;

                    // Supprimer les anciens appareils et pannes
                    await supabase.from('intervention_devices').delete().eq('repair_id', repair.id);
                } else {
                    // Mode création
                    const { data: newRepair, error: repairError } = await supabase
                        .from('repairs')
                        .insert([{
                            establishment_id: establishmentId,
                            client_id: clientId,
                            code: generateCode(),
                            type: 'intervention',
                            item: devicesSummary || 'Intervention multi-appareils',
                            description: formData.description || `Intervention sur ${interventionDevices.length} appareil(s)`,
                            status: 'nouveau',
                            payment_status: 'unpaid',
                            assigned_to: userProfile?.role === 'technician' ? userProfile.id : null,
                        }])
                        .select()
                        .single();

                    if (repairError) throw repairError;
                    repair = newRepair;
                }

                // 3. Créer les appareils, leurs pannes et leurs pièces
                for (const device of interventionDevices) {
                    if (!device.model || !device.faults || device.faults.length === 0) continue;

                    const { data: deviceData, error: deviceError } = await supabase
                        .from('intervention_devices')
                        .insert([{
                            repair_id: repair.id,
                            device_model: device.model,
                            imei_sn: device.imei || null,
                            notes: device.notes || null,
                            device_order: interventionDevices.indexOf(device) + 1,
                        }])
                        .select()
                        .single();

                    if (deviceError) throw deviceError;

                    // 4. Créer les pannes une par une pour récupérer leurs IDs
                    for (const fault of device.faults) {
                        const { data: faultData, error: faultError } = await supabase
                            .from('device_faults')
                            .insert({
                                device_id: deviceData.id,
                                fault_type_id: fault.id,
                                price: fault.price || 0,
                                status: 'pending',
                            })
                            .select()
                            .single();

                        if (faultError) throw faultError;

                        // 4.1 Sauvegarder les pièces pour cette panne
                        const parts = getFaultParts(device.id, fault.id);
                        if (parts && parts.length > 0) {
                            const partsToInsert = parts.map(p => ({
                                fault_id: faultData.id,
                                inventory_id: p.id,
                                quantity: p.quantity,
                                unit_price: p.selling_price
                            }));

                            const { error: partsError } = await supabase
                                .from('fault_parts')
                                .insert(partsToInsert);

                            if (partsError) throw partsError;
                        }
                    }
                }

                // 5. Calculer et mettre à jour le prix total et le coût de l'intervention
                let totalPrice = 0;
                let totalCost = 0;

                for (const device of interventionDevices) {
                    // Prix de vente (pannes)
                    const deviceTotal = (device.faults || []).reduce((sum: number, fault: any) => sum + (fault.price || 0), 0);
                    totalPrice += deviceTotal;

                    // Coût (pièces détachées)
                    for (const fault of device.faults) {
                        const parts = getFaultParts(device.id, fault.id);
                        if (parts && parts.length > 0) {
                            totalCost += parts.reduce((sum: number, p: any) => sum + ((p.cost_price || 0) * p.quantity), 0);
                        }
                    }
                }

                console.log('💰 Résumé financier:', { totalPrice, totalCost });

                // Mettre à jour le prix et le statut de paiement dans la réparation
                const { error: updateError } = await supabase
                    .from('repairs')
                    .update({
                        price: totalPrice,
                        cost_price: totalCost,
                        payment_status: formData.payment_status,
                        paid_amount: formData.payment_status === 'partial' ? parseFloat(formData.paid_amount) : (formData.payment_status === 'paid' ? totalPrice : 0),
                    })
                    .eq('id', repair.id);

                if (updateError) throw updateError;

                // 6. Créer le paiement si payé ou partiel
                if (formData.payment_status === 'paid' || formData.payment_status === 'partial') {
                    const paymentAmount = formData.payment_status === 'paid' ? totalPrice : parseFloat(formData.paid_amount);

                    const { error: paymentError } = await supabase
                        .from('payments')
                        .insert({
                            establishment_id: establishmentId,
                            repair_id: repair.id,
                            amount: paymentAmount,
                            payment_method: 'cash',
                        });

                    if (paymentError) throw paymentError;
                }

                alert('✅ Intervention créée avec succès !');
                setShowModal(false);
                setInterventionDevices([{ id: 1, model: '', imei: '', faults: [], notes: '' }]);
                fetchData();
            } catch (error: any) {
                console.error('Erreur:', error);
                alert('❌ Erreur: ' + error.message);
            } finally {
                setSubmitting(false);
            }
            return;
        }

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
                const updateData: any = {
                    client_id: clientId,
                    item: formData.item,
                    description: formData.description,
                    additional_info: formData.additional_info || null,
                    fault_type_id: formData.fault_type_id || null,
                    status: formData.status,
                    price: formData.price ? parseFloat(formData.price) : null,
                    cost_price: costPrice,
                    is_unlock: formData.is_unlock,
                    imei_sn: formData.is_unlock ? formData.imei_sn : null,
                    assigned_to: formData.assigned_to || null,
                    payment_status: formData.payment_status,
                    paid_amount: formData.payment_status === 'partial' ? parseFloat(formData.paid_amount) : (formData.payment_status === 'paid' ? parseFloat(formData.price) : 0),
                    updated_at: new Date().toISOString(),
                };

                // Add performance timestamps if status changed
                if (formData.status !== editingRepair.status) {
                    if (formData.status === 'diagnostic') updateData.diagnostic_at = new Date().toISOString();
                    if (formData.status === 'en_reparation') updateData.started_at = new Date().toISOString();
                    if (formData.status === 'pret_recup') updateData.completed_at = new Date().toISOString();
                }

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
                const repairData: any = {
                    establishment_id: establishmentId,
                    client_id: clientId,
                    code: generateCode(),
                    item: formData.item,
                    description: formData.description,
                    additional_info: formData.additional_info || null,
                    fault_type_id: formData.fault_type_id || null,
                    status: formData.status,
                    price: formData.price ? parseFloat(formData.price) : null,
                    cost_price: costPrice,
                    is_unlock: formData.is_unlock,
                    imei_sn: formData.is_unlock ? formData.imei_sn : null,
                    assigned_to: formData.assigned_to || null,
                    payment_status: formData.payment_status,
                    paid_amount: formData.payment_status === 'partial' ? parseFloat(formData.paid_amount) : (formData.payment_status === 'paid' ? parseFloat(formData.price) : 0),
                };

                if (formData.status === 'diagnostic') repairData.diagnostic_at = new Date().toISOString();
                if (formData.status === 'en_reparation') repairData.started_at = new Date().toISOString();
                if (formData.status === 'pret_recup') repairData.completed_at = new Date().toISOString();

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
                fault_type_id: '',
                status: 'nouveau',
                price: '',
                cost_price: '',
                is_unlock: false,
                imei_sn: '',
                assigned_to: '',
                payment_status: 'unpaid',
                paid_amount: '',
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

    const updateStatus = async (repair: any, newStatus: string) => {
        try {
            const updateData: any = {
                status: newStatus,
                updated_at: new Date().toISOString(),
            };

            if (newStatus === 'diagnostic') updateData.diagnostic_at = new Date().toISOString();
            if (newStatus === 'en_reparation') updateData.started_at = new Date().toISOString();
            if (newStatus === 'pret_recup') updateData.completed_at = new Date().toISOString();

            const { error } = await supabase
                .from('repairs')
                .update(updateData)
                .eq('id', repair.id);

            if (error) throw error;

            // Notification WhatsApp si prêt
            if (newStatus === 'pret_recup' && repair.client?.phone) {
                const clientName = repair.client.name;
                // Nettoyer le numéro (enlever espaces, tirets, etc. et s'assurer qu'il y a le code pays 213 pour l'Algérie)
                let phone = repair.client.phone.replace(/[^0-9]/g, '');
                if (phone.startsWith('0')) phone = '213' + phone.substring(1);
                if (!phone.startsWith('213')) phone = '213' + phone;

                const message = `Bonjour ${clientName}, votre ${repair.item} est prêt à être récupéré chez ${establishment?.name || 'notre atelier'}. Le montant total est de ${repair.price} DA. À bientôt !`;
                const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

                window.open(whatsappUrl, '_blank');
            }

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

    const handleEdit = async (repair: any) => {
        setEditingRepair(repair);

        // Définir le type de réparation
        if (repair.type === 'intervention') {
            setRepairType('intervention');

            // Charger les appareils de l'intervention avec leurs pannes et pièces
            const { data: devices } = await supabase
                .from('intervention_devices')
                .select(`
                    *,
                    faults:device_faults(
                        *,
                        fault_type:fault_types(*),
                        parts:fault_parts(
                            *,
                            inventory:inventory(*)
                        )
                    )
                `)
                .eq('repair_id', repair.id)
                .order('device_order');

            if (devices && devices.length > 0) {
                const newFaultParts: Record<string, any[]> = {};
                const loadedDevices = devices.map((device: any, index: number) => {
                    const deviceId = index + 1;

                    const deviceFaults = (device.faults || []).map((fault: any) => {
                        const faultId = fault.fault_type_id;
                        const key = `${deviceId}-${faultId}`;

                        // Charger les pièces dans le state global faultParts
                        if (fault.parts && fault.parts.length > 0) {
                            newFaultParts[key] = fault.parts.map((p: any) => ({
                                ...p.inventory,
                                quantity: p.quantity,
                                selling_price: p.unit_price
                            }));
                        }

                        return {
                            id: faultId,
                            name: fault.fault_type?.name || '',
                            price: fault.price || 0
                        };
                    });

                    return {
                        id: deviceId,
                        model: device.device_model,
                        imei: device.imei_sn || '',
                        notes: device.notes || '',
                        faults: deviceFaults
                    };
                });

                setFaultParts(newFaultParts);
                setInterventionDevices(loadedDevices);
            }
        } else {
            setRepairType('simple');
        }

        setFormData({
            clientId: repair.client_id,
            clientName: repair.client?.name || '',
            clientPhone: repair.client?.phone || '',
            item: repair.item,
            description: repair.description || '',
            additional_info: repair.additional_info || '',
            fault_type_id: repair.fault_type_id || '',
            status: repair.status,
            price: repair.price?.toString() || '',
            cost_price: repair.cost_price?.toString() || '',
            is_unlock: repair.is_unlock || false,
            imei_sn: repair.imei_sn || '',
            assigned_to: repair.assigned_to || '',
            payment_status: repair.payment_status || 'unpaid',
            paid_amount: repair.paid_amount?.toString() || '',
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

    const handleAddFaultType = async () => {
        if (!establishmentId || !faultTypeForm.name.trim()) return;

        try {
            const { error } = await supabase
                .from('fault_types')
                .insert([{
                    establishment_id: establishmentId,
                    name: faultTypeForm.name,
                    description: faultTypeForm.description,
                    icon: faultTypeForm.icon,
                    color: faultTypeForm.color
                }]);

            if (error) throw error;

            setFaultTypeForm({ name: '', description: '', icon: 'AlertCircle', color: 'neutral' });
            await fetchData();
        } catch (error: any) {
            console.error('Error adding fault type:', error);
            alert('Erreur lors de l\'ajout de la panne');
        }
    };

    const handleDeleteFaultType = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce type de panne ?')) return;

        try {
            const { error } = await supabase
                .from('fault_types')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchData();
        } catch (error: any) {
            console.error('Error deleting fault type:', error);
            alert('Erreur lors de la suppression');
        }
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
                                additional_info: '', fault_type_id: '', status: 'nouveau', price: '', cost_price: '',
                                is_unlock: false, imei_sn: '',
                                assigned_to: userProfile?.role === 'technician' ? userProfile.id : '',
                                payment_status: 'unpaid', paid_amount: '',
                            });
                            setShowModal(true);
                        }}
                        className="h-14 px-8 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-xl transition-all active:scale-[0.98] font-bold"
                    >
                        <Plus className="w-5 h-5 mr-3" />
                        {repairType === 'simple' ? 'Nouvelle Réparation' : 'Nouvelle Intervention'}
                    </Button>
                </motion.div>
            </div>

            {/* Tabs - Réparation Simple / Intervention */}
            <motion.div variants={itemVariants} className="flex gap-1 bg-neutral-100 dark:bg-neutral-900/50 p-1 rounded-2xl w-fit mb-8 border border-neutral-100 dark:border-neutral-800">
                <button
                    onClick={() => {
                        setRepairType('simple');
                        setInterventionDevices([{ id: 1, model: '', imei: '', faults: [], notes: '' }]);
                    }}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${repairType === 'simple'
                        ? 'bg-white dark:bg-neutral-800 text-primary shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                >
                    📱 Réparation Simple
                </button>
                <button
                    onClick={() => {
                        setRepairType('intervention');
                        setFormData({
                            clientId: '', clientName: '', clientPhone: '', item: '', description: '',
                            additional_info: '', fault_type_id: '', status: 'nouveau', price: '', cost_price: '',
                            is_unlock: false, imei_sn: '',
                            assigned_to: userProfile?.role === 'technician' ? userProfile.id : '',
                            payment_status: 'unpaid', paid_amount: '',
                        });
                    }}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${repairType === 'intervention'
                        ? 'bg-white dark:bg-neutral-800 text-primary shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                >
                    🔧 Intervention
                    <span className="ml-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Multi-appareils</span>
                </button>
            </motion.div>

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
                                <th className="px-8 py-6">Intervenant</th>
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
                                        <td className="px-8 py-6 relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveStatusMenu(activeStatusMenu === repair.id ? null : repair.id);
                                                }}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border-2 border-transparent ${statusColors[repair.status]} ${activeStatusMenu === repair.id ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-neutral-900 border-primary shadow-lg' : ''}`}
                                            >
                                                {statusLabels[repair.status]}
                                            </button>

                                            <AnimatePresence>
                                                {activeStatusMenu === repair.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-40 cursor-default"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveStatusMenu(null);
                                                            }}
                                                        />
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            className="absolute left-8 top-full z-50 mt-2 p-2 bg-card border border-neutral-100 dark:border-neutral-800 rounded-3xl shadow-heavy min-w-[200px]"
                                                        >
                                                            <div className="grid grid-cols-1 gap-1">
                                                                {Object.entries(statusLabels).map(([key, label]) => (
                                                                    <button
                                                                        key={key}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            updateStatus(repair, key);
                                                                            setActiveStatusMenu(null);
                                                                        }}
                                                                        className={`w-full text-left px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-between ${repair.status === key ? 'bg-primary text-white shadow-lg' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-500'}`}
                                                                    >
                                                                        {label}
                                                                        {repair.status === key && <Check className="w-3 h-3" />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>

                                            {repair.fault_type_id && (
                                                <div className="text-[10px] text-neutral-400 font-bold mt-1 uppercase tracking-tighter italic">
                                                    {faultTypes.find((f: any) => f.id === repair.fault_type_id)?.name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-black text-neutral-500 border border-neutral-200 dark:border-neutral-700">
                                                    {repair.technician?.name?.charAt(0) || <User size={14} />}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                                        {repair.technician?.name || 'Non assigné'}
                                                    </div>
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedRepair(repair);
                                                            setPaymentAmount(parseFloat(repair.price) || 0);
                                                            setShowPaymentModal(true);
                                                        }}
                                                        className="text-[10px] font-bold text-primary hover:underline w-fit"
                                                        disabled={userProfile?.role === 'technician'}
                                                    >
                                                        {userProfile?.role === 'technician' ? 'En attente ⏳' : 'Régler maintenant 💰'}
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
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {editingRepair
                                            ? (repairType === 'simple' ? 'Modifier la réparation' : 'Modifier l\'intervention')
                                            : (repairType === 'simple' ? 'Nouvelle réparation' : 'Nouvelle intervention')
                                        }
                                    </h2>
                                    <p className="text-sm text-neutral-400 font-medium">
                                        {repairType === 'simple'
                                            ? 'Saisissez les détails techniques et clients.'
                                            : 'Plusieurs appareils, plusieurs pannes - Tout en un seul dossier.'
                                        }
                                    </p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-800 transition-all active:scale-90"><X className="w-6 h-6 text-neutral-400" /></button>
                            </div>

                            {/* Formulaire Réparation Simple */}
                            {repairType === 'simple' && (
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
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Type de Panne</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowFaultTypesModal(true)}
                                                            className="text-xs text-primary hover:text-primary/80 font-semibold"
                                                        >
                                                            + Gérer les pannes
                                                        </button>
                                                    </div>
                                                    <select
                                                        required
                                                        value={formData.fault_type_id}
                                                        onChange={(e) => setFormData({ ...formData, fault_type_id: e.target.value })}
                                                        className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 shadow-sm font-bold text-foreground"
                                                    >
                                                        <option value="">Sélectionner la panne...</option>
                                                        {faultTypes.map(type => (
                                                            <option key={type.id} value={type.id}>{type.name}</option>
                                                        ))}
                                                    </select>
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

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                {userProfile?.role !== 'technician' && (
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
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-emerald-500">
                                                    <DollarSign size={18} />
                                                    <label className="text-sm font-black uppercase tracking-widest">Paiement</label>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Statut du paiement</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, payment_status: 'unpaid', paid_amount: '' })}
                                                            className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${formData.payment_status === 'unpaid' ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-black shadow-lg' : 'bg-card border-neutral-100 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
                                                        >
                                                            ⏳ Non payé
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, payment_status: 'partial', paid_amount: '' })}
                                                            className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${formData.payment_status === 'partial' ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-black shadow-lg' : 'bg-card border-neutral-100 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
                                                        >
                                                            💰 Partiel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, payment_status: 'paid', paid_amount: formData.price })}
                                                            className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${formData.payment_status === 'paid' ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-black shadow-lg' : 'bg-card border-neutral-100 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
                                                        >
                                                            ✅ Payé
                                                        </button>
                                                    </div>
                                                </div>

                                                {formData.payment_status === 'partial' && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Montant payé (DA)</label>
                                                        <input
                                                            type="number"
                                                            value={formData.paid_amount}
                                                            onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                                                            className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-neutral-50/50 dark:bg-neutral-900/50 shadow-sm font-black text-foreground"
                                                            placeholder="Montant déjà versé"
                                                        />
                                                    </motion.div>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-indigo-500">
                                                    <User size={18} />
                                                    <label className="text-sm font-black uppercase tracking-widest">Assignation & Statut</label>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Intervenant</label>
                                                    <select
                                                        value={formData.assigned_to}
                                                        onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                                        disabled={userProfile?.role === 'technician'}
                                                        className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 shadow-sm font-bold text-foreground disabled:opacity-50"
                                                    >
                                                        <option value="">Non assigné</option>
                                                        {teamMembers.map(member => (
                                                            <option key={member.id} value={member.id}>{member.name || member.email} ({member.role})</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Étape Actuelle</label>
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
                            )}

                            {/* Formulaire Intervention */}
                            {repairType === 'intervention' && (
                                <form onSubmit={handleSubmit} className="p-8 md:p-10 overflow-y-auto flex-1 custom-scrollbar">
                                    {/* Section Client */}
                                    <div className="mb-8">
                                        <div className="flex items-center gap-2 text-primary mb-4">
                                            <User size={18} />
                                            <label className="text-sm font-black uppercase tracking-widest">Client</label>
                                        </div>
                                        <select
                                            value={formData.clientId}
                                            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-neutral-50/50 dark:bg-neutral-900/50 font-medium text-foreground"
                                            required
                                        >
                                            <option value="">+ Nouveau client</option>
                                            {clients.map((client: any) => (
                                                <option key={client.id} value={client.id}>
                                                    {client.name} - {client.phone}
                                                </option>
                                            ))}
                                        </select>

                                        {formData.clientId === '' && (
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <input
                                                    type="text"
                                                    placeholder="Nom du client *"
                                                    value={formData.clientName}
                                                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                                    className="px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-medium text-foreground"
                                                    required
                                                />
                                                <input
                                                    type="tel"
                                                    placeholder="Téléphone *"
                                                    value={formData.clientPhone}
                                                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                                                    className="px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-medium text-foreground"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Section Appareils */}
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-primary">
                                                <Smartphone size={18} />
                                                <label className="text-sm font-black uppercase tracking-widest">Appareils à réparer</label>
                                            </div>
                                            <span className="text-xs text-neutral-400 font-medium">
                                                {interventionDevices.length} appareil{interventionDevices.length > 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        <div className="space-y-6">
                                            {interventionDevices.map((device, index) => (
                                                <div key={device.id} className="bg-neutral-50 dark:bg-neutral-900/30 rounded-3xl p-6 border border-neutral-100 dark:border-neutral-800">
                                                    {/* Header de l'appareil */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-lg font-bold text-foreground">
                                                            Appareil {index + 1}
                                                        </h3>
                                                        {interventionDevices.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeDevice(device.id)}
                                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Modèle et IMEI */}
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">
                                                                Modèle *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="ex: iPhone 13 Pro Max"
                                                                value={device.model}
                                                                onChange={(e) => updateDevice(device.id, 'model', e.target.value)}
                                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-neutral-800 font-medium text-foreground"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">
                                                                IMEI / SN
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="Numéro de série"
                                                                value={device.imei}
                                                                onChange={(e) => updateDevice(device.id, 'imei', e.target.value)}
                                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-neutral-800 font-medium text-foreground"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Pannes */}
                                                    <div className="mb-4">
                                                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 block">
                                                            Pannes à réparer
                                                        </label>
                                                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                                            {faultTypes.map((fault) => {
                                                                const isSelected = device.faults?.some((f: any) => f.id === fault.id);
                                                                const selectedFault = device.faults?.find((f: any) => f.id === fault.id);

                                                                return (
                                                                    <div key={fault.id} className="space-y-2">
                                                                        <div
                                                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isSelected
                                                                                ? 'bg-primary/5 border-primary/30'
                                                                                : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-primary/20'
                                                                                }`}
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isSelected}
                                                                                onChange={() => toggleFault(device.id, fault.id)}
                                                                                className="w-5 h-5 rounded border-neutral-300 text-primary focus:ring-primary/20"
                                                                            />
                                                                            <div className="flex-1">
                                                                                <div className="font-bold text-sm text-foreground">
                                                                                    {fault.name}
                                                                                </div>
                                                                            </div>
                                                                            {isSelected && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            openPartsModal(device.id, fault.id);
                                                                                        }}
                                                                                        className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 ${getFaultParts(device.id, fault.id).length > 0
                                                                                            ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800'
                                                                                            : 'bg-white border-neutral-200 text-neutral-400 hover:text-primary hover:border-primary/30 dark:bg-neutral-800 dark:border-neutral-700'}`}
                                                                                        title="Gérer les pièces"
                                                                                    >
                                                                                        <Box size={16} />
                                                                                        {getFaultParts(device.id, fault.id).length > 0 && (
                                                                                            <span className="text-[10px] font-black">{getFaultParts(device.id, fault.id).length}</span>
                                                                                        )}
                                                                                    </button>
                                                                                    <input
                                                                                        type="number"
                                                                                        placeholder="Prix"
                                                                                        value={selectedFault?.price || ''}
                                                                                        onChange={(e) => updateFaultPrice(device.id, fault.id, parseFloat(e.target.value) || 0)}
                                                                                        className="w-24 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-neutral-800 font-bold text-xs text-foreground"
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Liste des pièces pour cette panne */}
                                                                        {isSelected && getFaultParts(device.id, fault.id).length > 0 && (
                                                                            <div className="ml-8 space-y-1">
                                                                                {getFaultParts(device.id, fault.id).map((part) => (
                                                                                    <div key={part.id} className="flex items-center justify-between bg-white dark:bg-neutral-800/50 px-3 py-1.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                                                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                                                            <Package size={10} className="text-amber-500 shrink-0" />
                                                                                            <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 truncate">
                                                                                                {part.quantity}x {part.name}
                                                                                            </span>
                                                                                        </div>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => removePartFromFault(device.id, fault.id, part.id)}
                                                                                            className="text-neutral-300 hover:text-red-500 transition-colors p-1"
                                                                                        >
                                                                                            <X size={12} />
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Sous-total de l'appareil */}
                                                    <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                                                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                                                            Sous-total
                                                        </span>
                                                        <span className="text-lg font-black text-primary">
                                                            {(device.faults || []).reduce((sum: number, f: any) => sum + (f.price || 0), 0).toLocaleString()} DA
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={addDevice}
                                                className="w-full py-6 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-3xl text-neutral-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all font-bold flex items-center justify-center gap-2 group"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-primary/10 flex items-center justify-center transition-all">
                                                    <Plus size={20} />
                                                </div>
                                                <span>Ajouter un autre appareil</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Section Diagnostic & Travaux */}
                                    <div className="mb-8">
                                        <div className="flex items-center gap-2 text-amber-500 mb-4">
                                            <Info size={18} />
                                            <label className="text-sm font-black uppercase tracking-widest">Diagnostic & Travaux</label>
                                        </div>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-neutral-50/50 dark:bg-neutral-900/50 shadow-sm font-medium resize-none text-foreground"
                                            rows={4}
                                            placeholder="Détails du problème et travaux à effectuer sur l'ensemble des appareils..."
                                        />
                                    </div>

                                    {/* Section Assignation */}
                                    <div className="mb-8">
                                        <div className="flex items-center gap-2 text-indigo-500 mb-4">
                                            <User size={18} />
                                            <label className="text-sm font-black uppercase tracking-widest">Assignation & Statut</label>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Intervenant</label>
                                                <select
                                                    value={formData.assigned_to}
                                                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                                    disabled={userProfile?.role === 'technician'}
                                                    className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 shadow-sm font-bold text-foreground disabled:opacity-50"
                                                >
                                                    <option value="">Non assigné</option>
                                                    {teamMembers.map(member => (
                                                        <option key={member.id} value={member.id}>{member.name || member.email} ({member.role})</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Étape Actuelle</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {Object.entries(statusLabels).map(([key, label]) => (
                                                        <button
                                                            key={key}
                                                            type="button"
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

                                    {/* Section Paiement */}
                                    <div className="mb-8">
                                        <div className="flex items-center gap-2 text-emerald-500 mb-4">
                                            <DollarSign size={18} />
                                            <label className="text-sm font-black uppercase tracking-widest">Paiement</label>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Statut du paiement</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, payment_status: 'unpaid', paid_amount: '' })}
                                                        className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${formData.payment_status === 'unpaid' ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-black shadow-lg' : 'bg-card border-neutral-100 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
                                                    >
                                                        ⏳ Non payé
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, payment_status: 'partial', paid_amount: '' })}
                                                        className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${formData.payment_status === 'partial' ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-black shadow-lg' : 'bg-card border-neutral-100 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
                                                    >
                                                        💰 Partiel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const total = calculateInterventionTotal();
                                                            setFormData({ ...formData, payment_status: 'paid', paid_amount: total.toString() });
                                                        }}
                                                        className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${formData.payment_status === 'paid' ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-black shadow-lg' : 'bg-card border-neutral-100 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
                                                    >
                                                        ✅ Payé
                                                    </button>
                                                </div>
                                            </div>

                                            {formData.payment_status === 'partial' && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Montant payé (DA)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.paid_amount}
                                                        onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                                                        className="w-full px-5 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-neutral-50/50 dark:bg-neutral-900/50 shadow-sm font-black text-foreground"
                                                        placeholder="Montant déjà versé"
                                                    />
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Total général */}
                                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-6 mb-8">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                                                Total intervention
                                            </span>
                                            <span className="text-xs text-neutral-400">
                                                {interventionDevices.reduce((total, d) => total + (d.faults?.length || 0), 0)} panne{interventionDevices.reduce((total, d) => total + (d.faults?.length || 0), 0) > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="text-3xl font-black text-primary">
                                            {calculateInterventionTotal().toLocaleString()} DA
                                        </div>
                                    </div>

                                    {/* Boutons */}
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 h-14 rounded-2xl text-neutral-400 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                                        >
                                            Annuler
                                        </button>
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="h-14 flex-[2] rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black font-black hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-xl active:scale-[0.98] transition-all"
                                        >
                                            {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Enregistrer l'intervention"}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div >
                )
                }
            </AnimatePresence >

            {/* Payment Modal */}
            <AnimatePresence>
                {
                    showPaymentModal && (
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
                    )
                }
            </AnimatePresence >

            {/* Modal de sélection des pièces pour une panne */}
            <AnimatePresence>
                {showPartsModal && currentFaultForParts && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
                            onClick={() => setShowPartsModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-neutral-100 dark:border-neutral-800">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-neutral-900 dark:text-white">Sélectionner les pièces</h3>
                                        <p className="text-sm text-neutral-400 font-medium">
                                            Pour la panne : <span className="text-primary font-bold">{faultTypes.find(f => f.id === currentFaultForParts.faultId)?.name}</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowPartsModal(false)}
                                        className="p-3 bg-neutral-50 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-2xl transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Rechercher une pièce..."
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-neutral-50/50 dark:bg-neutral-900/50 font-medium text-foreground"
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        value={searchTerm}
                                    />
                                </div>
                            </div>

                            {/* Liste des pièces */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                {inventory
                                    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map(item => {
                                        const key = `${currentFaultForParts.deviceId}-${currentFaultForParts.faultId}`;
                                        const selected = (faultParts[key] || []).find(p => p.id === item.id);

                                        return (
                                            <div
                                                key={item.id}
                                                className={`flex items-center justify-between p-4 rounded-3xl border transition-all ${selected ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/30' : 'bg-white dark:bg-neutral-800/40 border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selected ? 'bg-primary text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
                                                        <Package size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-neutral-900 dark:text-white leading-tight">{item.name}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${item.stock <= item.min_stock ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                                Stock: {item.stock}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-neutral-400">
                                                                Prix: {item.selling_price} DA
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {selected ? (
                                                        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
                                                            <button
                                                                onClick={() => {
                                                                    if (selected.quantity > 1) {
                                                                        addPartToFault(item, selected.quantity - 1);
                                                                    } else {
                                                                        removePartFromFault(currentFaultForParts.deviceId, currentFaultForParts.faultId, item.id);
                                                                    }
                                                                }}
                                                                className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded-lg text-neutral-500 transition-all"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                            <span className="w-8 text-center font-black text-sm">{selected.quantity}</span>
                                                            <button
                                                                onClick={() => {
                                                                    if (selected.quantity < item.stock) {
                                                                        addPartToFault(item, selected.quantity + 1);
                                                                    }
                                                                }}
                                                                className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded-lg text-neutral-500 transition-all"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => addPartToFault(item, 1)}
                                                            disabled={item.stock <= 0}
                                                            className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-black rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                                                        >
                                                            Ajouter
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                {inventory.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                    <div className="text-center py-20 px-8">
                                        <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search size={32} className="text-neutral-300" />
                                        </div>
                                        <h4 className="text-lg font-bold text-neutral-400">Aucune pièce trouvée</h4>
                                        <p className="text-sm text-neutral-400">Réessayez avec un autre terme ou ajoutez une pièce à l'inventaire.</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-8 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20">
                                <Button
                                    onClick={() => setShowPartsModal(false)}
                                    className="w-full h-14 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black font-black hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-xl"
                                >
                                    Terminer
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

            {
                showLabel && ticketData && (
                    <RepairLabel
                        repair={ticketData}
                        onClose={() => setShowLabel(false)}
                    />
                )
            }

            {/* Modal de gestion des pannes */}
            {
                showFaultTypesModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
                        >
                            <div className="p-8 border-b border-neutral-100 dark:border-neutral-800">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-black">Gestion des Pannes</h2>
                                    <button
                                        onClick={() => setShowFaultTypesModal(false)}
                                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                                {/* Formulaire d'ajout */}
                                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-6 mb-6">
                                    <h3 className="text-lg font-bold mb-4">Ajouter une panne</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2 block">
                                                Nom de la panne *
                                            </label>
                                            <input
                                                type="text"
                                                value={faultTypeForm.name}
                                                onChange={(e) => setFaultTypeForm({ ...faultTypeForm, name: e.target.value })}
                                                placeholder="Ex: Écran cassé"
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2 block">
                                                Description
                                            </label>
                                            <textarea
                                                value={faultTypeForm.description}
                                                onChange={(e) => setFaultTypeForm({ ...faultTypeForm, description: e.target.value })}
                                                placeholder="Description de la panne..."
                                                rows={2}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2 block">
                                                    Icône
                                                </label>
                                                <select
                                                    value={faultTypeForm.icon}
                                                    onChange={(e) => setFaultTypeForm({ ...faultTypeForm, icon: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                >
                                                    <option value="AlertCircle">Alerte</option>
                                                    <option value="Smartphone">Smartphone</option>
                                                    <option value="Battery">Batterie</option>
                                                    <option value="Zap">Charge</option>
                                                    <option value="Volume2">Audio</option>
                                                    <option value="Wifi">Wi-Fi</option>
                                                    <option value="Bluetooth">Bluetooth</option>
                                                    <option value="Camera">Caméra</option>
                                                    <option value="ToggleLeft">Boutons</option>
                                                    <option value="Hand">Tactile</option>
                                                    <option value="Droplet">Eau</option>
                                                    <option value="Code">Logiciel</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-neutral-600 dark:border-neutral-400 mb-2 block">
                                                    Couleur
                                                </label>
                                                <select
                                                    value={faultTypeForm.color}
                                                    onChange={(e) => setFaultTypeForm({ ...faultTypeForm, color: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                >
                                                    <option value="neutral">Neutre</option>
                                                    <option value="red">Rouge</option>
                                                    <option value="amber">Ambre</option>
                                                    <option value="yellow">Jaune</option>
                                                    <option value="emerald">Émeraude</option>
                                                    <option value="blue">Bleu</option>
                                                    <option value="indigo">Indigo</option>
                                                    <option value="purple">Violet</option>
                                                    <option value="pink">Rose</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleAddFaultType}
                                            disabled={!faultTypeForm.name.trim()}
                                            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Ajouter la panne
                                        </button>
                                    </div>
                                </div>

                                {/* Liste des pannes */}
                                <div>
                                    <h3 className="text-lg font-bold mb-4">Pannes existantes ({faultTypes.length})</h3>
                                    <div className="space-y-2">
                                        {faultTypes.map((fault: any) => (
                                            <div
                                                key={fault.id}
                                                className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl bg-${fault.color}-100 dark:bg-${fault.color}-900/20 flex items-center justify-center text-${fault.color}-600`}>
                                                        <IconRenderer name={fault.icon} size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{fault.name}</p>
                                                        {fault.description && (
                                                            <p className="text-sm text-neutral-500">{fault.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteFaultType(fault.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )
            }
        </motion.div >
    );
}

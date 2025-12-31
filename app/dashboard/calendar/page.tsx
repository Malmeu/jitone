'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Calendar as CalendarIcon, Clock, User, X, Check, MoreHorizontal, Info, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'fr': fr,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { locale: fr }),
    getDay,
    locales,
});

export default function CalendarPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [establishmentId, setEstablishmentId] = useState<string>('');
    const [view, setView] = useState<View>('month');
    const [date, setDate] = useState(new Date());

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        client_id: '',
        start_time: '',
        end_time: '',
        appointment_type: 'consultation',
        notes: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: establishment } = await supabase
                .from('establishments')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (establishment) {
                setEstablishmentId(establishment.id);

                const { data: clientsData } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('establishment_id', establishment.id)
                    .order('name');

                setClients(clientsData || []);
                await fetchAppointments(establishment.id);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async (estId: string) => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    *,
                    client:clients(name, phone)
                `)
                .eq('establishment_id', estId)
                .order('start_time');

            if (error) throw error;
            setAppointments(data || []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const events = useMemo(() => {
        return appointments.map(apt => ({
            id: apt.id,
            title: apt.title,
            start: new Date(apt.start_time),
            end: new Date(apt.end_time),
            resource: apt,
        }));
    }, [appointments]);

    const handleSelectSlot = (slotInfo: any) => {
        setSelectedSlot(slotInfo);
        setSelectedEvent(null);
        setFormData({
            title: '',
            description: '',
            client_id: '',
            start_time: format(slotInfo.start, "yyyy-MM-dd'T'HH:mm"),
            end_time: format(slotInfo.end, "yyyy-MM-dd'T'HH:mm"),
            appointment_type: 'consultation',
            notes: '',
        });
        setShowModal(true);
    };

    const handleSelectEvent = (event: any) => {
        setSelectedEvent(event.resource);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const dataToSubmit = selectedEvent ? selectedEvent : formData;

        if (!dataToSubmit.title || !dataToSubmit.start_time || !dataToSubmit.end_time) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const appointmentData = {
                establishment_id: establishmentId,
                title: dataToSubmit.title,
                description: dataToSubmit.description,
                client_id: dataToSubmit.client_id || null,
                start_time: dataToSubmit.start_time,
                end_time: dataToSubmit.end_time,
                appointment_type: dataToSubmit.appointment_type,
                notes: dataToSubmit.notes,
                status: 'scheduled',
                created_by: user.id,
            };

            if (selectedEvent) {
                const { error } = await supabase
                    .from('appointments')
                    .update(appointmentData)
                    .eq('id', selectedEvent.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('appointments')
                    .insert(appointmentData);

                if (error) throw error;
            }

            setShowModal(false);
            fetchAppointments(establishmentId);
        } catch (error) {
            console.error('Error:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    const handleDelete = async () => {
        if (!selectedEvent) return;
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) return;

        try {
            const { error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', selectedEvent.id);

            if (error) throw error;

            setShowModal(false);
            fetchAppointments(establishmentId);
        } catch (error) {
            console.error('Error:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const eventStyleGetter = (event: any) => {
        const statusColors = {
            scheduled: { backgroundColor: '#F0F7FF', color: '#1056BB', border: '1px solid #C4DFFF' },
            confirmed: { backgroundColor: '#EFFFF4', color: '#047857', border: '1px solid #B7F2D3' },
            completed: { backgroundColor: '#F9FAFB', color: '#4B5563', border: '1px solid #E5E7EB' },
            cancelled: { backgroundColor: '#FFF5F5', color: '#C53030', border: '1px solid #FEB2B2' },
            no_show: { backgroundColor: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' },
        };

        const status = event.resource?.status || 'scheduled';
        const style = statusColors[status as keyof typeof statusColors] || statusColors.scheduled;

        return {
            style: {
                ...style,
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 6px',
            }
        };
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
            initial="hidden" animate="visible" variants={containerVariants}
            className="max-w-[1600px] mx-auto pb-24 px-4 md:px-8 font-inter font-inter"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full font-inter">Planning & Agendas</span>
                    </motion.div>
                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-2 font-inter"
                    >
                        Mon Calendrier
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-lg text-neutral-500 font-medium font-inter"
                    >
                        Visualisez vos rendez-vous clients et organisez votre journée.
                    </motion.p>
                </div>
                <motion.div variants={itemVariants}>
                    <button
                        onClick={() => {
                            setSelectedEvent(null);
                            setSelectedSlot(null);
                            setFormData({
                                title: '', description: '', client_id: '',
                                start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                                end_time: format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
                                appointment_type: 'consultation', notes: '',
                            });
                            setShowModal(true);
                        }}
                        className="h-14 px-8 rounded-2xl bg-neutral-900 border-none hover:bg-neutral-800 text-white shadow-xl transition-all active:scale-[0.98] font-bold flex items-center gap-3 font-inter"
                    >
                        <Plus size={20} />
                        Planifier un RDV
                    </button>
                </motion.div>
            </div>

            {/* Quick Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 font-inter">
                {[
                    { label: 'Programmés', val: appointments.filter(a => a.status === 'scheduled').length, color: 'text-blue-600', bg: 'bg-blue-50', icon: CalendarIcon },
                    { label: 'Confirmés', val: appointments.filter(a => a.status === 'confirmed').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Check },
                    { label: 'Aujourd\'hui', val: appointments.filter(a => format(new Date(a.start_time), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Clock },
                    {
                        label: 'Cette semaine', val: appointments.filter(a => {
                            const aptDate = new Date(a.start_time);
                            const weekStart = startOfWeek(new Date(), { locale: fr });
                            const weekEnd = new Date(weekStart);
                            weekEnd.setDate(weekEnd.getDate() + 7);
                            return aptDate >= weekStart && aptDate < weekEnd;
                        }).length, color: 'text-amber-600', bg: 'bg-amber-50', icon: MoreHorizontal
                    }
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 flex items-center gap-5 group hover:shadow-md transition-all font-inter">
                        <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 font-inter">{stat.label}</div>
                            <div className="text-2xl font-black text-neutral-900 font-inter font-inter">{stat.val}</div>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Calendar Container */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-100 p-8">
                <div style={{ height: '750px' }} className="calendar-apple-style font-inter">
                    <BigCalendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        selectable
                        view={view}
                        onView={setView}
                        date={date}
                        onNavigate={setDate}
                        eventPropGetter={eventStyleGetter}
                        messages={{
                            next: 'Suivant', previous: 'Précédent', today: "Aujourd'hui",
                            month: 'Mois', week: 'Semaine', day: 'Jour', agenda: 'Agenda',
                            noEventsInRange: 'Aucun rendez-vous',
                        }}
                        culture="fr"
                    />
                </div>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative bg-white rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,0.18)] max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col font-inter"
                        >
                            <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-[#FBFBFD]/50 font-inter">
                                <div>
                                    <h2 className="text-2xl font-bold text-neutral-900">{selectedEvent ? 'Modifier le rendez-vous' : 'Planifier un rendez-vous'}</h2>
                                    <p className="text-sm text-neutral-400 font-medium font-inter">Synchronisez votre planning avec vos clients.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center bg-white hover:bg-neutral-100 rounded-2xl border border-neutral-100 transition-all active:scale-90 font-inter"><X className="w-6 h-6 text-neutral-400" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto font-inter">
                                <div className="space-y-4">
                                    <div className="space-y-2 font-inter">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1 font-inter">Objet du rendez-vous *</label>
                                        <input
                                            type="text" required
                                            value={selectedEvent ? selectedEvent.title : formData.title}
                                            onChange={(e) => selectedEvent
                                                ? setSelectedEvent({ ...selectedEvent, title: e.target.value })
                                                : setFormData({ ...formData, title: e.target.value })
                                            }
                                            className="w-full px-5 py-4 rounded-3xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-[#FBFBFD] font-bold font-inter"
                                            placeholder="ex: Récupération iPhone 13 Pro"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-inter">
                                        <div className="space-y-2 font-inter">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1 font-inter">Client concerné</label>
                                            <select
                                                value={selectedEvent ? selectedEvent.client_id || '' : formData.client_id}
                                                onChange={(e) => selectedEvent
                                                    ? setSelectedEvent({ ...selectedEvent, client_id: e.target.value })
                                                    : setFormData({ ...formData, client_id: e.target.value })
                                                }
                                                className="w-full px-5 py-4 rounded-3xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-[#FBFBFD] font-bold font-inter"
                                            >
                                                <option value="">Sélectionner un client</option>
                                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2 font-inter">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1 font-inter">Catégorie</label>
                                            <select
                                                value={selectedEvent ? selectedEvent.appointment_type : formData.appointment_type}
                                                onChange={(e) => selectedEvent
                                                    ? setSelectedEvent({ ...selectedEvent, appointment_type: e.target.value })
                                                    : setFormData({ ...formData, appointment_type: e.target.value })
                                                }
                                                className="w-full px-5 py-4 rounded-3xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-[#FBFBFD] font-bold font-inter"
                                            >
                                                <option value="repair">🛠 Réparation</option>
                                                <option value="pickup">📦 Récupération</option>
                                                <option value="consultation">💬 Consultation</option>
                                                <option value="other">📍 Autre</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-inter">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1 font-inter">Début *</label>
                                            <input
                                                type="datetime-local" required
                                                value={selectedEvent ? format(new Date(selectedEvent.start_time), "yyyy-MM-dd'T'HH:mm") : formData.start_time}
                                                onChange={(e) => selectedEvent
                                                    ? setSelectedEvent({ ...selectedEvent, start_time: e.target.value })
                                                    : setFormData({ ...formData, start_time: e.target.value })
                                                }
                                                className="w-full px-5 py-4 rounded-3xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-[#FBFBFD] font-bold font-inter"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1 font-inter">Fin *</label>
                                            <input
                                                type="datetime-local" required
                                                value={selectedEvent ? format(new Date(selectedEvent.end_time), "yyyy-MM-dd'T'HH:mm") : formData.end_time}
                                                onChange={(e) => selectedEvent
                                                    ? setSelectedEvent({ ...selectedEvent, end_time: e.target.value })
                                                    : setFormData({ ...formData, end_time: e.target.value })
                                                }
                                                className="w-full px-5 py-4 rounded-3xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-[#FBFBFD] font-bold font-inter font-inter"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1 font-inter">Détails & Notes</label>
                                        <textarea
                                            value={selectedEvent ? selectedEvent.description || '' : formData.description}
                                            onChange={(e) => selectedEvent
                                                ? setSelectedEvent({ ...selectedEvent, description: e.target.value })
                                                : setFormData({ ...formData, description: e.target.value })
                                            }
                                            rows={4}
                                            className="w-full px-5 py-4 rounded-3xl border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-[#FBFBFD] font-bold resize-none font-inter"
                                            placeholder="Informations complémentaires sur le rendez-vous..."
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 font-inter">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-14 rounded-2xl text-neutral-400 font-bold hover:bg-neutral-50 transition-all font-inter">Annuler</button>
                                    <button type="submit" className="flex-[2] h-14 bg-neutral-900 text-white font-black rounded-2xl hover:bg-neutral-800 shadow-xl transition-all active:scale-95 font-inter">
                                        {selectedEvent ? 'Enregistrer les modifications' : 'Confirmer le rendez-vous'}
                                    </button>
                                    {selectedEvent && (
                                        <button type="button" onClick={handleDelete} className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-100 transition-all font-inter font-inter"><X size={24} /></button>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .calendar-apple-style .rbc-header {
                    padding: 15px !important;
                    font-size: 11px !important;
                    font-weight: 900 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                    color: #9CA3AF !important;
                    border-bottom: 1px solid #F3F4F6 !important;
                    background: #FBFBFD !important;
                }
                .calendar-apple-style .rbc-calendar { font-family: 'Inter', sans-serif !important; border: none !important; }
                .calendar-apple-style .rbc-month-view { border: none !important; }
                .calendar-apple-style .rbc-day-bg { border-left: 1px solid #F3F4F6 !important; }
                .calendar-apple-style .rbc-month-row { border-top: 1px solid #F3F4F6 !important; }
                .calendar-apple-style .rbc-today { background-color: #F0F7FF !important; }
                .calendar-apple-style .rbc-off-range-bg { background: transparent !important; opacity: 0.3 !important; }
                .calendar-apple-style .rbc-event { border: none !important; padding: 0 !important; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05) !important; }
                .calendar-apple-style .rbc-show-more { color: #1056BB !important; font-weight: 800 !important; font-size: 10px !important; text-transform: uppercase !important; }
                .calendar-apple-style .rbc-toolbar { border-bottom: none !important; margin-bottom: 20px !important; }
                .calendar-apple-style .rbc-toolbar-label { font-size: 1.25rem !important; font-weight: 800 !important; color: #111827 !important; }
                .calendar-apple-style .rbc-btn-group button { 
                    border: 1px solid #F3F4F6 !important; 
                    background: white !important; 
                    padding: 8px 16px !important; 
                    font-size: 12px !important; 
                    font-weight: 700 !important; 
                    color: #4B5563 !important; 
                    border-radius: 12px !important; 
                    margin: 2px !important; 
                    transition: all 0.2s !important;
                }
                .calendar-apple-style .rbc-btn-group button:hover { background: #F9FAFB !important; color: #111827 !important; }
                .calendar-apple-style .rbc-btn-group button.rbc-active { background: #111827 !important; color: white !important; border-color: #111827 !important; }
            `}</style>
        </motion.div>
    );
}

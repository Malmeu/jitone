'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Calendar as CalendarIcon, Clock, User, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
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

                // Récupérer les clients
                const { data: clientsData } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('establishment_id', establishment.id)
                    .order('name');

                setClients(clientsData || []);

                // Récupérer les rendez-vous
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

        if (!formData.title || !formData.start_time || !formData.end_time) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const appointmentData = {
                establishment_id: establishmentId,
                title: formData.title,
                description: formData.description,
                client_id: formData.client_id || null,
                start_time: formData.start_time,
                end_time: formData.end_time,
                appointment_type: formData.appointment_type,
                notes: formData.notes,
                status: 'scheduled',
                created_by: user.id,
            };

            if (selectedEvent) {
                // Mise à jour
                const { error } = await supabase
                    .from('appointments')
                    .update(appointmentData)
                    .eq('id', selectedEvent.id);

                if (error) throw error;
                alert('Rendez-vous mis à jour !');
            } else {
                // Création
                const { error } = await supabase
                    .from('appointments')
                    .insert(appointmentData);

                if (error) throw error;
                alert('Rendez-vous créé !');
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

            alert('Rendez-vous supprimé !');
            setShowModal(false);
            fetchAppointments(establishmentId);
        } catch (error) {
            console.error('Error:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const eventStyleGetter = (event: any) => {
        const statusColors = {
            scheduled: { backgroundColor: '#3b82f6', color: 'white' },
            confirmed: { backgroundColor: '#10b981', color: 'white' },
            completed: { backgroundColor: '#6b7280', color: 'white' },
            cancelled: { backgroundColor: '#ef4444', color: 'white' },
            no_show: { backgroundColor: '#f59e0b', color: 'white' },
        };

        const status = event.resource?.status || 'scheduled';
        return {
            style: statusColors[status as keyof typeof statusColors] || statusColors.scheduled,
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Calendrier & Rendez-vous</h1>
                    <p className="text-neutral-500">Gérez vos rendez-vous et votre planning</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedEvent(null);
                        setSelectedSlot(null);
                        setFormData({
                            title: '',
                            description: '',
                            client_id: '',
                            start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                            end_time: format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
                            appointment_type: 'consultation',
                            notes: '',
                        });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors font-medium"
                >
                    <Plus size={20} />
                    Nouveau Rendez-vous
                </button>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <CalendarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-500">Programmés</p>
                            <p className="text-2xl font-bold text-neutral-900">
                                {appointments.filter(a => a.status === 'scheduled').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <Clock className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-500">Confirmés</p>
                            <p className="text-2xl font-bold text-neutral-900">
                                {appointments.filter(a => a.status === 'confirmed').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-50 rounded-xl">
                            <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-500">Aujourd'hui</p>
                            <p className="text-2xl font-bold text-neutral-900">
                                {appointments.filter(a =>
                                    format(new Date(a.start_time), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                                ).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <CalendarIcon className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-500">Cette semaine</p>
                            <p className="text-2xl font-bold text-neutral-900">
                                {appointments.filter(a => {
                                    const aptDate = new Date(a.start_time);
                                    const weekStart = startOfWeek(new Date(), { locale: fr });
                                    const weekEnd = new Date(weekStart);
                                    weekEnd.setDate(weekEnd.getDate() + 7);
                                    return aptDate >= weekStart && aptDate < weekEnd;
                                }).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendrier */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6" style={{ height: '700px' }}>
                <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    selectable
                    view={view}
                    onView={setView}
                    date={date}
                    onNavigate={setDate}
                    eventPropGetter={eventStyleGetter}
                    messages={{
                        next: 'Suivant',
                        previous: 'Précédent',
                        today: "Aujourd'hui",
                        month: 'Mois',
                        week: 'Semaine',
                        day: 'Jour',
                        agenda: 'Agenda',
                        date: 'Date',
                        time: 'Heure',
                        event: 'Événement',
                        noEventsInRange: 'Aucun rendez-vous dans cette période',
                        showMore: (total) => `+ ${total} de plus`,
                    }}
                    culture="fr"
                />
            </div>

            {/* Modal de création/édition */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
                            <h2 className="text-xl font-bold text-neutral-900">
                                {selectedEvent ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {selectedEvent && (
                                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">
                                        Statut: {selectedEvent.status}
                                    </span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Titre *
                                </label>
                                <input
                                    type="text"
                                    value={selectedEvent ? selectedEvent.title : formData.title}
                                    onChange={(e) => selectedEvent
                                        ? setSelectedEvent({ ...selectedEvent, title: e.target.value })
                                        : setFormData({ ...formData, title: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    required
                                    placeholder="Ex: Rendez-vous avec M. Dupont"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Client
                                </label>
                                <select
                                    value={selectedEvent ? selectedEvent.client_id || '' : formData.client_id}
                                    onChange={(e) => selectedEvent
                                        ? setSelectedEvent({ ...selectedEvent, client_id: e.target.value })
                                        : setFormData({ ...formData, client_id: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="">Aucun client</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} - {client.phone}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Début *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={selectedEvent
                                            ? format(new Date(selectedEvent.start_time), "yyyy-MM-dd'T'HH:mm")
                                            : formData.start_time
                                        }
                                        onChange={(e) => selectedEvent
                                            ? setSelectedEvent({ ...selectedEvent, start_time: e.target.value })
                                            : setFormData({ ...formData, start_time: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Fin *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={selectedEvent
                                            ? format(new Date(selectedEvent.end_time), "yyyy-MM-dd'T'HH:mm")
                                            : formData.end_time
                                        }
                                        onChange={(e) => selectedEvent
                                            ? setSelectedEvent({ ...selectedEvent, end_time: e.target.value })
                                            : setFormData({ ...formData, end_time: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Type
                                </label>
                                <select
                                    value={selectedEvent ? selectedEvent.appointment_type : formData.appointment_type}
                                    onChange={(e) => selectedEvent
                                        ? setSelectedEvent({ ...selectedEvent, appointment_type: e.target.value })
                                        : setFormData({ ...formData, appointment_type: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="repair">Réparation</option>
                                    <option value="pickup">Récupération</option>
                                    <option value="consultation">Consultation</option>
                                    <option value="other">Autre</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={selectedEvent ? selectedEvent.description || '' : formData.description}
                                    onChange={(e) => selectedEvent
                                        ? setSelectedEvent({ ...selectedEvent, description: e.target.value })
                                        : setFormData({ ...formData, description: e.target.value })
                                    }
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    placeholder="Détails du rendez-vous..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    value={selectedEvent ? selectedEvent.notes || '' : formData.notes}
                                    onChange={(e) => selectedEvent
                                        ? setSelectedEvent({ ...selectedEvent, notes: e.target.value })
                                        : setFormData({ ...formData, notes: e.target.value })
                                    }
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    placeholder="Notes internes..."
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors font-medium"
                                >
                                    {selectedEvent ? 'Mettre à jour' : 'Créer le rendez-vous'}
                                </button>
                                {selectedEvent && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                                    >
                                        Supprimer
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

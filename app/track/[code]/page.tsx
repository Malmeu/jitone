'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
    ArrowLeft, Phone, CheckCircle2, Clock, Wrench, AlertCircle,
    FileText, Download, Check, X, MapPin, Smartphone, ShieldCheck,
    CreditCard, Calendar, MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const steps = [
    { id: 'nouveau', label: 'Réception', desc: 'Appareil enregistré', icon: Clock },
    { id: 'diagnostic', label: 'Diagnostic', desc: 'Analyse technique', icon: Wrench },
    { id: 'en_reparation', label: 'Réparation', desc: 'Intervention en cours', icon: Smartphone },
    { id: 'pret_recup', label: 'Terminé', desc: 'Prêt à récupérer', icon: CheckCircle2 },
];

const statusLabels: Record<string, string> = {
    nouveau: 'Appareil reçu',
    diagnostic: 'Diagnostic en cours',
    en_reparation: 'Réparation en cours',
    pret_recup: 'Réparation terminée',
    recupere: 'Appareil récupéré',
    annule: 'Intervention annulée',
};

export default function TrackPage() {
    const params = useParams();
    const router = useRouter();
    const code = params.code as string;

    const [repair, setRepair] = useState<any>(null);
    const [quotes, setQuotes] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            if (code.toUpperCase() === 'REPAR-DEMO') {
                setRepair({
                    id: 'demo-id',
                    code: 'REPAR-DEMO',
                    status: 'diagnostic',
                    item: 'iPhone 14 Pro Max',
                    description: 'Écran brisé et batterie faible - Diagnostic complet demandé.',
                    created_at: new Date().toISOString(),
                    imei_sn: '3587420911XXXXX',
                    client: { name: 'Client Démo', phone: '+213 555 00 00 00', email: 'demo@fixwave.dz' },
                    establishment: {
                        name: 'Fixwave Tech Center',
                        address: '123 Boulevard Mohamed V, Alger',
                        phone: '+213 21 00 00 00',
                        owner_email: 'contact@fixwave.dz'
                    }
                });
                setQuotes([{
                    id: 'q-demo',
                    quote_number: 'Q-2024-001',
                    total: 12500,
                    status: 'sent',
                    issue_date: new Date().toISOString(),
                    quote_items: [
                        { description: 'Écran Original iPhone 14 Pro Max', quantity: 1, unit_price: 9500 },
                        { description: 'Main d\'œuvre & Tests', quantity: 1, unit_price: 3000 }
                    ]
                }]);
                setLoading(false);
                return;
            }

            try {
                // Fetch Repair
                const { data: repairData, error: repairError } = await supabase
                    .from('repairs')
                    .select(`
                        *,
                        client:clients(name, phone, email),
                        establishment:establishments(*)
                    `)
                    .eq('code', code.toUpperCase())
                    .single();

                if (repairError || !repairData) throw new Error('Repair not found');
                setRepair(repairData);

                // Fetch Quotes for this repair
                const { data: quoteData } = await supabase
                    .from('quotes')
                    .select('*, quote_items(*)')
                    .eq('repair_id', repairData.id);
                setQuotes(quoteData || []);

                // Fetch Invoices for this repair
                const { data: invoiceData } = await supabase
                    .from('invoices')
                    .select('*, invoice_items(*)')
                    .eq('repair_id', repairData.id);
                setInvoices(invoiceData || []);

            } catch (err: any) {
                console.error(err);
                setError('Code de réparation introuvable');
            } finally {
                setLoading(false);
            }
        };

        if (code) {
            fetchAllData();
        }
    }, [code]);

    const handleQuoteAction = async (quoteId: string, action: 'accepted' | 'rejected') => {
        setActionLoading(true);
        try {
            const { error } = await supabase
                .from('quotes')
                .update({ status: action })
                .eq('id', quoteId);

            if (error) throw error;

            // Refresh data
            setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: action } : q));
        } catch (err) {
            console.error(err);
            alert('Une erreur est survenue lors de la validation du devis.');
        } finally {
            setActionLoading(false);
        }
    };

    const generateQuotePDF = (quote: any) => {
        if (!quote || !repair?.establishment) return;
        const est = repair.establishment;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(0, 122, 255);
        doc.text(est.name, 20, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(est.address || '', 20, 28);
        doc.text(`Tél: ${est.phone || ''}`, 20, 33);
        doc.text(`Email: ${est.owner_email || ''}`, 20, 38);

        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text('DEVIS', 190, 20, { align: 'right' });
        doc.setFontSize(10);
        doc.text(`N° ${quote.quote_number}`, 190, 28, { align: 'right' });
        doc.text(`Date: ${new Date(quote.issue_date).toLocaleDateString()}`, 190, 33, { align: 'right' });

        const tableData = quote.quote_items.map((item: any) => [
            item.description,
            item.quantity.toString(),
            `${item.unit_price.toLocaleString()} DA`,
            `${(item.quantity * item.unit_price).toLocaleString()} DA`
        ]);

        autoTable(doc, {
            startY: 50,
            head: [['Description', 'Qté', 'Prix U.', 'Total']],
            body: tableData,
            headStyles: { fillColor: [0, 122, 255] }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.text(`Total TTC: ${quote.total.toLocaleString()} DA`, 190, finalY, { align: 'right' });

        doc.save(`Devis-${quote.quote_number}.pdf`);
    };

    const generateInvoicePDF = (invoice: any) => {
        if (!invoice || !repair?.establishment) return;
        const est = repair.establishment;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(52, 199, 89);
        doc.text(est.name, 20, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(est.address || '', 20, 28);
        doc.text(`Tél: ${est.phone || ''}`, 20, 33);

        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text('FACTURE', 190, 20, { align: 'right' });
        doc.setFontSize(10);
        doc.text(`N° ${invoice.invoice_number}`, 190, 28, { align: 'right' });

        const tableData = invoice.invoice_items.map((item: any) => [
            item.description,
            item.quantity.toString(),
            `${item.unit_price.toLocaleString()} DA`,
            `${(item.quantity * item.unit_price).toLocaleString()} DA`
        ]);

        autoTable(doc, {
            startY: 50,
            head: [['Description', 'Qté', 'Prix U.', 'Total']],
            body: tableData,
            headStyles: { fillColor: [52, 199, 89] }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.text(`Total Payé: ${invoice.total.toLocaleString()} DA`, 190, finalY, { align: 'right' });

        doc.save(`Facture-${invoice.invoice_number}.pdf`);
    };

    const generateTicketPDF = () => {
        if (!repair || !repair?.establishment) return;
        const est = repair.establishment;
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.text("TICKET DE DÉPÔT", 105, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.text(est.name, 105, 30, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Code de suivi: ${repair.code}`, 105, 40, { align: 'center' });

        autoTable(doc, {
            startY: 50,
            body: [
                ['Appareil', repair.item],
                ['Client', repair.client?.name || 'N/A'],
                ['Téléphone', repair.client?.phone || 'N/A'],
                ['Date de dépôt', new Date(repair.created_at).toLocaleDateString()],
                ['Problème signalé', repair.description || 'N/A'],
            ],
            theme: 'grid',
            headStyles: { fillColor: [0, 0, 0] }
        });

        doc.save(`Ticket-${repair.code}.pdf`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center">
                <div className="text-center group">
                    <div className="relative mb-6">
                        <Wrench className="w-16 h-16 text-primary animate-spin-slow mx-auto relative z-10" />
                        <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse rounded-full" />
                    </div>
                    <p className="text-neutral-400 font-medium tracking-tight">Analyse de votre dossier...</p>
                </div>
            </div>
        );
    }

    if (error || !repair) {
        return (
            <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md bg-white p-12 rounded-[3rem] shadow-soft border border-neutral-100"
                >
                    <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <AlertCircle className="w-12 h-12 text-rose-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-neutral-900 mb-4 tracking-tight">Dossier introuvable</h1>
                    <p className="text-neutral-500 mb-10 leading-relaxed font-medium">
                        Désolé, nous ne parvenons pas à trouver de réparation correspondant au code <span className="font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded tracking-widest">{code.toUpperCase()}</span>.
                    </p>
                    <Button
                        onClick={() => router.push('/track')}
                        className="w-full h-14 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold transition-all active:scale-[0.98]"
                    >
                        Nouvelle recherche
                    </Button>
                </motion.div>
            </div>
        );
    }

    const currentStepIndex = steps.findIndex(s => s.id === repair.status);
    const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;
    const activeQuote = quotes.find(q => q.status === 'sent');
    const acceptedQuote = quotes.find(q => q.status === 'accepted');

    return (
        <div className="min-h-screen bg-[#FBFBFD] font-inter selection:bg-primary/10">
            {/* Header / Navigation */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-100/50">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/track" className="flex items-center gap-4 group">
                        <div className="w-10 h-10 flex items-center justify-center bg-neutral-50 rounded-xl group-hover:bg-neutral-100 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-neutral-500" />
                        </div>
                        <span className="hidden md:block font-bold text-neutral-400">Navigation</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Dossier</span>
                        <div className="bg-neutral-900 text-white px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-lg shadow-neutral-900/10">
                            #{code.toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Tracking & Status */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* Status Reveal Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-10 md:p-14 shadow-soft border border-neutral-100 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

                            <div className="relative z-10 text-center md:text-left flex flex-col md:flex-row md:items-center gap-10">
                                <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-soft
                                    ${repair.status === 'pret_recup' ? 'bg-emerald-50 text-emerald-600' :
                                        repair.status === 'annule' ? 'bg-rose-50 text-rose-600' : 'bg-primary/10 text-primary'}
                                `}>
                                    {repair.status === 'pret_recup' ? <CheckCircle2 size={48} className="animate-bounce-slow" /> :
                                        repair.status === 'nouveau' ? <Clock size={48} /> : <Wrench size={48} className="animate-pulse" />}
                                </div>
                                <div className="space-y-4 flex-1">
                                    <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight leading-tight">
                                        {statusLabels[repair.status] || repair.status}
                                    </h1>
                                    <p className="text-lg text-neutral-500 font-medium max-w-md">
                                        {repair.status === 'pret_recup'
                                            ? 'Excellente nouvelle ! Votre appareil est réparé et prêt à vous être rendu.'
                                            : repair.status === 'diagnostic'
                                                ? 'Nos experts analysent actuellement votre matériel pour identifier la solution optimale.'
                                                : 'Votre demande est prise en charge. Nous mettons tout en œuvre pour vous satisfaire.'}
                                    </p>
                                </div>
                            </div>

                            {/* Horizontal Progress Bar */}
                            <div className="mt-16 pt-16 border-t border-neutral-50">
                                <div className="relative px-2">
                                    {/* Line background */}
                                    <div className="absolute top-5 left-0 w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            className="h-full bg-primary shadow-[0_0_10px_rgba(0,122,255,0.5)]"
                                        />
                                    </div>

                                    <div className="flex justify-between relative z-10 font-bold">
                                        {steps.map((step, idx) => {
                                            const isCompleted = idx < currentStepIndex;
                                            const isCurrent = idx === currentStepIndex;
                                            return (
                                                <div key={step.id} className="flex flex-col items-center gap-4">
                                                    <div className={`w-11 h-11 rounded-full border-4 transition-all duration-700 flex items-center justify-center
                                                        ${isCompleted ? 'bg-primary border-primary text-white scale-90' :
                                                            isCurrent ? 'bg-white border-primary text-primary scale-110 shadow-xl' :
                                                                'bg-white border-neutral-100 text-neutral-300'}
                                                    `}>
                                                        {isCompleted ? <Check size={18} /> : <step.icon size={18} />}
                                                    </div>
                                                    <div className="hidden md:block text-center pt-2">
                                                        <p className={`text-xs font-black uppercase tracking-widest ${isCompleted || isCurrent ? 'text-neutral-900' : 'text-neutral-300'}`}>
                                                            {step.label}
                                                        </p>
                                                        <p className="text-[10px] text-neutral-400 mt-1 font-medium">{step.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* Quote Validation Section */}
                        <AnimatePresence>
                            {activeQuote && (
                                <motion.section
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-neutral-900 rounded-[3rem] p-10 md:p-14 text-white shadow-heavy relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -mr-40 -mt-40 animate-pulse" />

                                    <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                                        <div className="flex-1 space-y-6 text-center md:text-left">
                                            <div className="inline-flex px-4 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                Devis en attente
                                            </div>
                                            <h2 className="text-3xl font-bold tracking-tight">Validation Recommandée</h2>
                                            <p className="text-neutral-400 font-medium leading-relaxed">
                                                Nos techniciens ont identifié les pièces nécessaires. Veuillez valider le devis ci-dessous pour lancer l'intervention.
                                            </p>
                                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none mb-2">Montant Total TTC</span>
                                                    <span className="text-3xl font-black tabular-nums">{activeQuote.total.toLocaleString('fr-DZ')} <span className="text-sm font-bold opacity-40">DA</span></span>
                                                </div>
                                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary">
                                                    <CreditCard size={24} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-auto flex flex-col gap-4 shrink-0">
                                            <Button
                                                onClick={() => handleQuoteAction(activeQuote.id, 'accepted')}
                                                disabled={actionLoading}
                                                className="h-16 px-12 rounded-[1.5rem] bg-primary hover:bg-primary-hover text-white font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
                                            >
                                                {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Accepter le devis"}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleQuoteAction(activeQuote.id, 'rejected')}
                                                disabled={actionLoading}
                                                className="h-14 rounded-2xl text-rose-400 hover:text-rose-300 hover:bg-white/5 font-bold"
                                            >
                                                Refuser l'offre
                                            </Button>
                                        </div>
                                    </div>
                                </motion.section>
                            )}
                        </AnimatePresence>

                        {/* Recent Activity / Device Details */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-[2.5rem] p-10 border border-neutral-100 shadow-soft group hover:shadow-medium transition-all"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-neutral-50 text-neutral-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Smartphone size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900">Détails Appareil</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Modèle / Type</span>
                                        <span className="text-lg font-bold text-neutral-900">{repair.item}</span>
                                    </div>
                                    {repair.imei_sn && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">N° Série / IMEI</span>
                                            <span className="text-sm font-mono font-bold text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-lg inline-block w-fit">
                                                {repair.imei_sn}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-[2.5rem] p-10 border border-neutral-100 shadow-soft group hover:shadow-medium transition-all"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-neutral-50 text-neutral-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900">Suivi Technique</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Description Panne</span>
                                        <p className="text-sm text-neutral-500 font-medium leading-relaxed italic line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                                            "{repair.description || 'Intervention standard'}"
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-neutral-50 flex items-center gap-2 text-emerald-600">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-bold uppercase tracking-tight">Système actif</span>
                                    </div>
                                </div>
                            </motion.div>
                        </section>
                    </div>

                    {/* Right Column: Establishment & Forms */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Summary & Documents */}
                        <motion.section
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[3rem] p-10 border border-neutral-100 shadow-soft overflow-hidden"
                        >
                            <h3 className="text-xl font-bold text-neutral-900 mb-8 flex items-center justify-between">
                                Documents
                                <div className="w-8 h-8 bg-neutral-50 rounded-lg flex items-center justify-center text-neutral-300">
                                    <FileText size={16} />
                                </div>
                            </h3>
                            <div className="space-y-4">
                                <button
                                    onClick={generateTicketPDF}
                                    className="w-full flex items-center justify-between p-5 bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 rounded-3xl group transition-all text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-neutral-400 shadow-sm border border-neutral-100 group-hover:text-primary transition-colors">
                                            <FileText size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-neutral-900">Ticket S.A.V</span>
                                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-0.5">PDF • Officiel</span>
                                        </div>
                                    </div>
                                    <Download size={18} className="text-neutral-300 group-hover:text-neutral-900 transition-colors" />
                                </button>

                                {quotes.map(quote => (
                                    <button
                                        key={quote.id}
                                        onClick={() => generateQuotePDF(quote)}
                                        className="w-full flex items-center justify-between p-5 bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 rounded-3xl group transition-all text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-neutral-400 shadow-sm border border-neutral-100 group-hover:text-primary transition-colors">
                                                <FileText size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-neutral-900">Devis #{quote.quote_number}</span>
                                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-0.5">PDF • {quote.status}</span>
                                            </div>
                                        </div>
                                        <Download size={18} className="text-neutral-300 group-hover:text-neutral-900 transition-colors" />
                                    </button>
                                ))}

                                {invoices.map(invoice => (
                                    <button
                                        key={invoice.id}
                                        onClick={() => generateInvoicePDF(invoice)}
                                        className="w-full flex items-center justify-between p-5 bg-emerald-50/20 hover:bg-emerald-50/40 border border-emerald-100/50 rounded-3xl group transition-all text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-400 shadow-sm border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                <CreditCard size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-emerald-900">Facture #{invoice.invoice_number}</span>
                                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-0.5">{invoice.status === 'paid' ? 'Payée' : 'En attente'}</span>
                                            </div>
                                        </div>
                                        <Download size={18} className="text-emerald-300 group-hover:text-emerald-900 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </motion.section>

                        {/* Store Info */}
                        <motion.section
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-[3rem] p-10 border border-neutral-100 shadow-soft"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-14 h-14 bg-neutral-900 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-neutral-900/10">
                                    <MapPin size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-bold text-neutral-900 leading-tight">Centre Technique</h3>
                                    <span className="text-sm text-neutral-400 font-medium">Boutique & Support</span>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Établissement</span>
                                    <span className="text-lg font-bold text-neutral-900">{repair.establishment?.name}</span>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <a
                                        href={`tel:${repair.establishment?.phone}`}
                                        className="flex items-center justify-between p-5 bg-blue-50/50 hover:bg-blue-50 rounded-3xl group transition-all"
                                    >
                                        <div className="flex items-center gap-4 text-blue-600">
                                            <Phone size={20} />
                                            <span className="font-bold">{repair.establishment?.phone || 'Non renseigné'}</span>
                                        </div>
                                        <ArrowLeft size={16} className="rotate-180 text-blue-200 group-hover:text-blue-500 transition-colors" />
                                    </a>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Localisation</span>
                                    <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                                        {repair.establishment?.address || 'Consultez votre ticket pour l\'adresse exacte.'}
                                    </p>
                                </div>
                            </div>

                            <Button
                                className="w-full h-14 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl mt-12 flex items-center gap-3 transition-transform active:scale-95"
                                onClick={() => window.open(`https://api.whatsapp.com/send?phone=${repair.establishment?.phone}`, '_blank')}
                            >
                                <MessageSquare size={18} />
                                Nous contacter
                            </Button>
                        </motion.section>

                    </div>
                </div>
            </main>

            {/* Bottom Safe Area Padding for Mobile */}
            <div className="h-20 w-full lg:hidden" />
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return <Clock className={`${className} animate-spin`} />;
}

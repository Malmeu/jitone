'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Edit, Trash2, Send, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function QuoteDetailPage() {
    const router = useRouter();
    const params = useParams();
    const quoteId = params.id as string;

    const [quote, setQuote] = useState<any>(null);
    const [establishment, setEstablishment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (quoteId) {
            fetchQuote();
        }
    }, [quoteId]);

    const fetchQuote = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: establishmentData } = await supabase
                .from('establishments')
                .select('*')
                .eq('user_id', user.id)
                .single();

            setEstablishment(establishmentData);

            const { data, error } = await supabase
                .from('quotes')
                .select(`
                    *,
                    client:clients(*),
                    quote_items(*)
                `)
                .eq('id', quoteId)
                .single();

            if (error) {
                console.error('Error fetching quote:', error);
                throw error;
            }

            console.log('Quote loaded:', data);
            setQuote(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = () => {
        if (!quote || !establishment) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // En-tête avec logo et informations établissement
        doc.setFontSize(24);
        doc.setTextColor(59, 130, 246); // Couleur primaire
        doc.text(establishment.name, 20, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(establishment.address || '', 20, 28);
        doc.text(`Tél: ${establishment.phone}`, 20, 33);
        doc.text(`Email: ${establishment.owner_email}`, 20, 38);

        // Titre DEVIS
        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.text('DEVIS', pageWidth - 20, 20, { align: 'right' });

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`N° ${quote.quote_number}`, pageWidth - 20, 28, { align: 'right' });
        doc.text(`Date: ${new Date(quote.issue_date).toLocaleDateString('fr-FR')}`, pageWidth - 20, 33, { align: 'right' });
        doc.text(`Valide jusqu'au: ${new Date(quote.valid_until).toLocaleDateString('fr-FR')}`, pageWidth - 20, 38, { align: 'right' });

        // Ligne de séparation
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 45, pageWidth - 20, 45);

        // Informations client
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Client:', 20, 55);

        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.text(quote.client.name, 20, 62);
        doc.text(quote.client.phone, 20, 67);
        if (quote.client.email) {
            doc.text(quote.client.email, 20, 72);
        }
        if (quote.client.address) {
            doc.text(quote.client.address, 20, 77);
        }

        // Tableau des articles
        const formatPrice = (price: number) => {
            return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        };

        const tableData = quote.quote_items
            .sort((a: any, b: any) => a.position - b.position)
            .map((item: any) => [
                item.description,
                item.quantity.toString(),
                `${formatPrice(item.unit_price)} DA`,
                `${formatPrice(item.quantity * item.unit_price)} DA`
            ]);

        autoTable(doc, {
            startY: 90,
            head: [['Description', 'Qté', 'Prix unitaire', 'Total']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [59, 130, 246],
                textColor: 255,
                fontSize: 10,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 9,
                cellPadding: 5
            },
            columnStyles: {
                0: { cellWidth: 90 },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 35, halign: 'right' },
                3: { cellWidth: 35, halign: 'right' }
            }
        });

        // Calcul de la position après le tableau
        const finalY = (doc as any).lastAutoTable.finalY + 10;

        // Totaux
        const totalsX = pageWidth - 70;
        let currentY = finalY;

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Sous-total:', totalsX, currentY, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        doc.text(`${formatPrice(quote.subtotal)} DA`, pageWidth - 20, currentY, { align: 'right' });

        if (quote.tax_rate > 0) {
            currentY += 7;
            doc.setTextColor(100, 100, 100);
            doc.text(`TVA (${quote.tax_rate}%):`, totalsX, currentY, { align: 'right' });
            doc.setTextColor(0, 0, 0);
            doc.text(`${formatPrice(quote.tax_amount)} DA`, pageWidth - 20, currentY, { align: 'right' });
        }

        if (quote.discount_amount > 0) {
            currentY += 7;
            doc.setTextColor(100, 100, 100);
            doc.text('Remise:', totalsX, currentY, { align: 'right' });
            doc.setTextColor(220, 38, 38);
            doc.text(`-${formatPrice(quote.discount_amount)} DA`, pageWidth - 20, currentY, { align: 'right' });
        }

        // Total TTC
        currentY += 10;
        doc.setDrawColor(200, 200, 200);
        doc.line(totalsX - 10, currentY - 3, pageWidth - 20, currentY - 3);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL TTC:', totalsX, currentY, { align: 'right' });
        doc.setTextColor(59, 130, 246);
        doc.text(`${formatPrice(quote.total)} DA`, pageWidth - 20, currentY, { align: 'right' });

        // Conditions générales
        if (quote.terms_conditions) {
            currentY += 20;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text('Conditions générales:', 20, currentY);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);
            const terms = doc.splitTextToSize(quote.terms_conditions, pageWidth - 40);
            doc.text(terms, 20, currentY + 7);
        }

        // Pied de page
        const footerY = doc.internal.pageSize.getHeight() - 20;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `${establishment.name} - ${establishment.phone} - ${establishment.owner_email}`,
            pageWidth / 2,
            footerY,
            { align: 'center' }
        );

        // Télécharger le PDF
        doc.save(`Devis-${quote.quote_number}.pdf`);
    };

    const updateStatus = async (newStatus: string) => {
        try {
            const { error } = await supabase
                .from('quotes')
                .update({ status: newStatus })
                .eq('id', quote.id);

            if (error) throw error;

            setQuote({ ...quote, status: newStatus });
            alert('Statut mis à jour !');
        } catch (error) {
            console.error('Error:', error);
            alert('Erreur lors de la mise à jour');
        }
    };

    const deleteQuote = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) return;

        try {
            const { error } = await supabase
                .from('quotes')
                .delete()
                .eq('id', quote.id);

            if (error) throw error;

            alert('Devis supprimé !');
            router.push('/dashboard/quotes');
        } catch (error) {
            console.error('Error:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            draft: { label: 'Brouillon', color: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400' },
            sent: { label: 'Envoyé', color: 'bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400' },
            accepted: { label: 'Accepté', color: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400' },
            rejected: { label: 'Refusé', color: 'bg-rose-50 text-rose-500 dark:bg-rose-900/20 dark:text-rose-400' },
            expired: { label: 'Expiré', color: 'bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400' },
        };
        const badge = badges[status as keyof typeof badges] || badges.draft;
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!quote) {
        return (
            <div className="text-center py-24">
                <FileText className="w-20 h-20 text-neutral-300 dark:text-neutral-700 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-foreground mb-2">Devis introuvable</h3>
                <p className="text-neutral-500 mb-8">Le devis demandé n'existe pas ou a été supprimé.</p>
                <Link href="/dashboard/quotes" className="inline-flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95">
                    <ArrowLeft size={18} />
                    Retour aux devis
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-24 px-4 md:px-8 font-inter">
            {/* Header */}
            <div className="mb-12">
                <Link
                    href="/dashboard/quotes"
                    className="inline-flex items-center gap-2 text-neutral-500 hover:text-foreground mb-6 transition-colors font-bold uppercase text-[10px] tracking-widest"
                >
                    <ArrowLeft size={14} />
                    Retour aux devis
                </Link>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
                            Devis {quote.quote_number}
                        </h1>
                        <div className="flex items-center gap-4">
                            {getStatusBadge(quote.status)}
                            <div className="flex items-center gap-2 text-neutral-400 font-medium text-sm">
                                <FileText size={14} />
                                Créé le {new Date(quote.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={generatePDF}
                            className="h-12 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-lg shadow-emerald-500/10 font-bold active:scale-95 flex items-center gap-2"
                        >
                            <Download size={18} />
                            Exporter PDF
                        </button>
                        <Link
                            href={`/dashboard/quotes/${quote.id}/edit`}
                            className="h-12 px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-lg shadow-blue-500/10 font-bold active:scale-95 flex items-center gap-2"
                        >
                            <Edit size={18} />
                            Modifier
                        </Link>
                        <button
                            onClick={deleteQuote}
                            className="h-12 px-6 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-lg shadow-rose-500/10 font-bold active:scale-95 flex items-center gap-2"
                        >
                            <Trash2 size={18} />
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Contenu principal */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Informations client */}
                    <div className="bg-card rounded-[2rem] border border-neutral-100 dark:border-neutral-800 shadow-soft p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl flex items-center justify-center text-neutral-400">
                                <FileText size={18} />
                            </div>
                            <h2 className="text-xl font-bold text-foreground tracking-tight">Informations Client</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Nom du client</label>
                                    <p className="text-lg font-bold text-foreground">{quote.client.name}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Téléphone</label>
                                    <p className="text-neutral-600 dark:text-neutral-300 font-bold">{quote.client.phone}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Email</label>
                                    <p className="text-neutral-600 dark:text-neutral-300 font-bold">{quote.client.email || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Adresse</label>
                                    <p className="text-neutral-600 dark:text-neutral-300 font-medium">{quote.client.address || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Articles */}
                    <div className="bg-card rounded-[2rem] border border-neutral-100 dark:border-neutral-800 shadow-soft overflow-hidden">
                        <div className="p-8 border-b border-neutral-50 dark:border-neutral-800">
                            <h2 className="text-xl font-bold text-foreground tracking-tight">Détails de l'offre</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#FBFBFD] dark:bg-neutral-900/50 text-neutral-400 text-[11px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-4">Description de la prestation</th>
                                        <th className="px-8 py-4 text-center">Qté</th>
                                        <th className="px-8 py-4 text-right">Prix Unitaire</th>
                                        <th className="px-8 py-4 text-right">Montant</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                                    {quote.quote_items
                                        .sort((a: any, b: any) => a.position - b.position)
                                        .map((item: any) => (
                                            <tr key={item.id} className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-all">
                                                <td className="px-8 py-4">
                                                    <p className="text-foreground font-bold">{item.description}</p>
                                                </td>
                                                <td className="px-8 py-4 text-center">
                                                    <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-lg font-black text-xs">{item.quantity}</span>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <p className="text-neutral-600 dark:text-neutral-400 font-bold">{item.unit_price.toLocaleString('fr-DZ')} <span className="text-[10px] text-neutral-400">DA</span></p>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <p className="text-foreground font-black">{(item.quantity * item.unit_price).toLocaleString('fr-DZ')} <span className="text-[10px] text-neutral-400">DA</span></p>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notes et conditions */}
                    {(quote.notes || quote.terms_conditions) && (
                        <div className="grid md:grid-cols-2 gap-6">
                            {quote.notes && (
                                <div className="bg-card rounded-[2rem] border border-neutral-100 dark:border-neutral-800 shadow-soft p-8">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 mb-4">Note interne</h3>
                                    <div className="bg-neutral-50/50 dark:bg-neutral-900/50 rounded-2xl p-4 border border-dashed border-neutral-200 dark:border-neutral-800">
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap font-medium">{quote.notes}</p>
                                    </div>
                                </div>
                            )}
                            {quote.terms_conditions && (
                                <div className="bg-card rounded-[2rem] border border-neutral-100 dark:border-neutral-800 shadow-soft p-8">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 mb-4">Conditions générales</h3>
                                    <div className="bg-neutral-50/50 dark:bg-neutral-900/50 rounded-2xl p-4 border border-dashed border-neutral-200 dark:border-neutral-800">
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 whitespace-pre-wrap leading-relaxed">{quote.terms_conditions}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Résumé financier */}
                    <div className="bg-neutral-900 dark:bg-white rounded-[2rem] shadow-heavy p-8 text-white dark:text-black">
                        <h2 className="text-xl font-bold mb-6 tracking-tight">Récapitulatif Financier</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Total HT</span>
                                <span className="font-bold">
                                    {quote.subtotal.toLocaleString('fr-DZ')} DA
                                </span>
                            </div>

                            {quote.tax_rate > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest text-[10px]">TVA ({quote.tax_rate}%)</span>
                                    <span className="font-bold">
                                        {quote.tax_amount.toLocaleString('fr-DZ')} DA
                                    </span>
                                </div>
                            )}

                            {quote.discount_amount > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Remise Commerciale</span>
                                    <span className="font-bold text-rose-400 dark:text-rose-600">
                                        -{quote.discount_amount.toLocaleString('fr-DZ')} DA
                                    </span>
                                </div>
                            )}

                            <div className="pt-6 border-t border-neutral-800 dark:border-neutral-100 mt-6">
                                <div className="flex justify-between items-end">
                                    <span className="font-black uppercase tracking-widest text-[11px] mb-1">Total TTC</span>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-blue-400 dark:text-blue-600 tracking-tighter leading-none">
                                            {quote.total.toLocaleString('fr-DZ')}
                                        </p>
                                        <span className="text-[10px] font-black uppercase text-neutral-500 mt-1 block">Dinars Algériens</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Planning */}
                    <div className="bg-card rounded-[2rem] border border-neutral-100 dark:border-neutral-800 shadow-soft p-8">
                        <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                            <ArrowLeft className="rotate-180 w-4 h-4 text-primary" />
                            Échéances
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                                    <FileText size={16} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Date d'édition</span>
                                    <p className="font-bold text-foreground">
                                        {new Date(quote.issue_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center text-amber-500 shrink-0">
                                    <ArrowLeft className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Validité jusqu'au</span>
                                    <p className="font-bold text-foreground">
                                        {new Date(quote.valid_until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="bg-card rounded-[2rem] border border-neutral-100 dark:border-neutral-800 shadow-soft p-8">
                        <h2 className="text-lg font-bold text-foreground mb-6 tracking-tight">Cycle Commercial</h2>
                        <div className="space-y-3">
                            {quote.status === 'draft' && (
                                <button
                                    onClick={() => updateStatus('sent')}
                                    className="w-full flex items-center justify-center h-14 gap-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                                >
                                    <Send size={16} />
                                    Expédier au client
                                </button>
                            )}
                            {quote.status === 'sent' && (
                                <>
                                    <button
                                        onClick={() => updateStatus('accepted')}
                                        className="w-full flex items-center justify-center h-14 gap-2 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-500/20"
                                    >
                                        <CheckCircle size={16} />
                                        Confirmer la vente
                                    </button>
                                    <button
                                        onClick={() => updateStatus('rejected')}
                                        className="w-full flex items-center justify-center h-14 gap-2 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-rose-100 dark:hover:bg-rose-900/20"
                                    >
                                        Refuser l'offre
                                    </button>
                                </>
                            )}
                            {quote.status === 'accepted' && (
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3">
                                    <CheckCircle className="text-emerald-500" size={24} />
                                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">Ce devis a été accepté et archivé.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

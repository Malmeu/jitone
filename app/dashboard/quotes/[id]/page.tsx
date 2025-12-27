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
            draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
            sent: { label: 'Envoyé', color: 'bg-blue-100 text-blue-700' },
            accepted: { label: 'Accepté', color: 'bg-green-100 text-green-700' },
            rejected: { label: 'Refusé', color: 'bg-red-100 text-red-700' },
            expired: { label: 'Expiré', color: 'bg-orange-100 text-orange-700' },
        };
        const badge = badges[status as keyof typeof badges] || badges.draft;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!quote) {
        return (
            <div className="text-center py-16">
                <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Devis introuvable</h3>
                <p className="text-neutral-500 mb-4">Le devis demandé n'existe pas ou a été supprimé.</p>
                <Link href="/dashboard/quotes" className="text-primary hover:underline">
                    Retour aux devis
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/dashboard/quotes"
                    className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
                >
                    <ArrowLeft size={20} />
                    Retour aux devis
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                            Devis {quote.quote_number}
                        </h1>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(quote.status)}
                            <span className="text-sm text-neutral-500">
                                Créé le {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={generatePDF}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors font-medium"
                        >
                            <Download size={18} />
                            PDF
                        </button>
                        <Link
                            href={`/dashboard/quotes/${quote.id}/edit`}
                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors font-medium"
                        >
                            <Edit size={18} />
                            Modifier
                        </Link>
                        <button
                            onClick={deleteQuote}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors font-medium"
                        >
                            <Trash2 size={18} />
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contenu principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Informations client */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-neutral-900 mb-4">Client</h2>
                        <div className="space-y-2">
                            <p className="text-neutral-900 font-medium">{quote.client.name}</p>
                            <p className="text-neutral-600">{quote.client.phone}</p>
                            {quote.client.email && <p className="text-neutral-600">{quote.client.email}</p>}
                            {quote.client.address && <p className="text-neutral-600">{quote.client.address}</p>}
                        </div>
                    </div>

                    {/* Articles */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-neutral-900 mb-4">Articles / Services</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">Description</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-neutral-600">Qté</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-neutral-600">Prix unit.</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-neutral-600">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {quote.quote_items
                                        .sort((a: any, b: any) => a.position - b.position)
                                        .map((item: any) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 text-neutral-900">{item.description}</td>
                                                <td className="px-4 py-3 text-center text-neutral-700">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-neutral-700">
                                                    {item.unit_price.toLocaleString('fr-DZ')} DA
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                                                    {(item.quantity * item.unit_price).toLocaleString('fr-DZ')} DA
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notes et conditions */}
                    {(quote.notes || quote.terms_conditions) && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            {quote.notes && (
                                <div className="mb-4">
                                    <h3 className="font-bold text-neutral-900 mb-2">Notes internes</h3>
                                    <p className="text-neutral-600 whitespace-pre-wrap">{quote.notes}</p>
                                </div>
                            )}
                            {quote.terms_conditions && (
                                <div>
                                    <h3 className="font-bold text-neutral-900 mb-2">Conditions générales</h3>
                                    <p className="text-neutral-600 whitespace-pre-wrap">{quote.terms_conditions}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Résumé financier */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-neutral-900 mb-4">Résumé</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">Sous-total</span>
                                <span className="font-medium text-neutral-900">
                                    {quote.subtotal.toLocaleString('fr-DZ')} DA
                                </span>
                            </div>

                            {quote.tax_rate > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-600">TVA ({quote.tax_rate}%)</span>
                                    <span className="font-medium text-neutral-900">
                                        {quote.tax_amount.toLocaleString('fr-DZ')} DA
                                    </span>
                                </div>
                            )}

                            {quote.discount_amount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-600">Remise</span>
                                    <span className="font-medium text-red-600">
                                        -{quote.discount_amount.toLocaleString('fr-DZ')} DA
                                    </span>
                                </div>
                            )}

                            <div className="pt-3 border-t border-gray-200">
                                <div className="flex justify-between">
                                    <span className="font-bold text-neutral-900">Total TTC</span>
                                    <span className="font-bold text-xl text-primary">
                                        {quote.total.toLocaleString('fr-DZ')} DA
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informations */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-neutral-900 mb-4">Informations</h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-neutral-600">Date d'émission</span>
                                <p className="font-medium text-neutral-900">
                                    {new Date(quote.issue_date).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                            <div>
                                <span className="text-neutral-600">Valide jusqu'au</span>
                                <p className="font-medium text-neutral-900">
                                    {new Date(quote.valid_until).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-neutral-900 mb-4">Actions</h2>
                        <div className="space-y-2">
                            {quote.status === 'draft' && (
                                <button
                                    onClick={() => updateStatus('sent')}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
                                >
                                    <Send size={16} />
                                    Marquer comme envoyé
                                </button>
                            )}
                            {quote.status === 'sent' && (
                                <>
                                    <button
                                        onClick={() => updateStatus('accepted')}
                                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors font-medium text-sm"
                                    >
                                        <CheckCircle size={16} />
                                        Marquer comme accepté
                                    </button>
                                    <button
                                        onClick={() => updateStatus('rejected')}
                                        className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors font-medium text-sm"
                                    >
                                        Marquer comme refusé
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

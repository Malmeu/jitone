'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RepairTicketProps {
    repair: {
        code: string;
        item: string;
        description?: string;
        client?: { name: string; phone?: string };
        created_at: string;
        price?: number;
        is_unlock?: boolean;
        imei_sn?: string;
        payment_status?: string;
        paid_amount?: number;
    };
    establishment: {
        name: string;
        phone?: string;
        address?: string;
        logo_url?: string;
        ticket_color?: string;
        ticket_message?: string;
    };
    onClose: () => void;
}

export function RepairTicket({ repair, establishment, onClose }: RepairTicketProps) {
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (qrCanvasRef.current) {
            const trackUrl = `${window.location.origin}/track/${repair.code}`;
            QRCode.toCanvas(qrCanvasRef.current, trackUrl, {
                width: 100,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });
        }
    }, [repair.code]);

    const handlePrint = () => {
        window.print();
    };

    const handleWhatsApp = () => {
        const trackUrl = `${window.location.origin}/track/${repair.code}`;
        const message = `🔧 *${establishment.name}*\n\n` +
            `Bonjour ${repair.client?.name || 'Client'},\n\n` +
            `Votre ${repair.item} a bien été déposé pour réparation.\n\n` +
            `📋 *Code de suivi:* ${repair.code}\n` +
            `📱 *Suivez votre réparation:*\n${trackUrl}\n\n` +
            `Merci de votre confiance ! 😊`;

        const whatsappUrl = `https://wa.me/${repair.client?.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handlePrintAndClose = () => {
        window.print();
        // Fermer après un court délai pour laisser le temps à l'impression
        setTimeout(() => {
            onClose();
        }, 500);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-card dark:bg-neutral-900 rounded-3xl shadow-heavy max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden border border-neutral-100 dark:border-neutral-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Ne s'imprime pas */}
                <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center print:hidden flex-shrink-0 bg-neutral-50/50 dark:bg-neutral-900/50">
                    <h2 className="text-lg font-bold text-foreground">Ticket de dépôt</h2>
                    <div className="flex gap-2">
                        {repair.client?.phone && (
                            <Button onClick={handleWhatsApp} size="sm" variant="secondary" className="bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                WhatsApp
                            </Button>
                        )}
                        <Button onClick={handlePrint} size="sm" variant="outline" className="bg-card dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700">
                            <Printer className="w-4 h-4 mr-2" />
                            Aperçu
                        </Button>
                        <Button onClick={handlePrintAndClose} size="sm" className="bg-neutral-900 dark:bg-white text-white dark:text-black">
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimer
                        </Button>
                        <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                            <X className="w-5 h-5 text-neutral-400" />
                        </button>
                    </div>
                </div>

                {/* Ticket à imprimer - avec scroll */}
                <div className="overflow-y-auto flex-1 print:overflow-visible">
                    <div className="p-8 print:p-4 ticket-content bg-white dark:bg-white/95 rounded-2xl m-4 print:m-0 border border-neutral-100 dark:border-neutral-800 print:border-none shadow-sm print:shadow-none">
                        {/* En-tête établissement - Compact */}
                        <div className="text-center mb-3 pb-3 border-b-2 border-dashed border-gray-300">
                            {establishment.logo_url && (
                                <div className="mb-2 flex justify-center">
                                    <img
                                        src={establishment.logo_url}
                                        alt={establishment.name}
                                        className="h-12 w-auto object-contain"
                                    />
                                </div>
                            )}
                            <h1 className="text-xl font-bold text-neutral-900 mb-1">{establishment.name}</h1>
                            <div className="text-xs text-neutral-600 space-y-0.5">
                                {establishment.phone && <p>📞 {establishment.phone}</p>}
                                {establishment.address && <p>📍 {establishment.address}</p>}
                            </div>
                        </div>

                        {/* Code + QR en ligne */}
                        <div className="flex items-center justify-between mb-3 pb-3 border-b-2 border-dashed border-gray-300">
                            <div className="flex-1">
                                <p className="text-xs text-neutral-500 uppercase font-bold mb-1">Code de suivi</p>
                                <div
                                    className="text-white px-4 py-2 rounded-lg inline-block"
                                    style={{ backgroundColor: establishment.ticket_color || '#000000' }}
                                >
                                    <p className="text-lg font-mono font-bold">{repair.code}</p>
                                </div>
                            </div>
                            <div className="bg-white p-2 rounded-lg border-2 border-gray-200">
                                <canvas ref={qrCanvasRef} className="qr-code" />
                            </div>
                        </div>

                        {/* Informations réparation - 2 colonnes */}
                        <div className="mb-3 pb-3 border-b-2 border-dashed border-gray-300">
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                                <div className="col-span-2">
                                    <p className="text-xs text-neutral-400 uppercase font-bold mb-0.5">Client</p>
                                    <p className="text-sm font-bold text-neutral-900">{repair.client?.name || 'N/A'}</p>
                                    {repair.client?.phone && (
                                        <p className="text-xs text-neutral-600">{repair.client.phone}</p>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <p className="text-xs text-neutral-400 uppercase font-bold mb-0.5">Appareil</p>
                                    <p className="text-sm font-bold text-neutral-900">
                                        {repair.item}
                                        {repair.is_unlock && (
                                            <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                                                🔓
                                            </span>
                                        )}
                                    </p>
                                    {repair.is_unlock && repair.imei_sn && (
                                        <p className="text-xs text-neutral-600 font-mono">IMEI: {repair.imei_sn}</p>
                                    )}
                                </div>

                                {repair.description && (
                                    <div className="col-span-2">
                                        <p className="text-xs text-neutral-400 uppercase font-bold mb-0.5">Description</p>
                                        <p className="text-xs text-neutral-700">{repair.description}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-xs text-neutral-400 uppercase font-bold mb-0.5">Date</p>
                                    <p className="text-xs font-medium text-neutral-900">
                                        {new Date(repair.created_at).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>

                                {repair.price && (
                                    <div>
                                        <p className="text-xs text-neutral-400 uppercase font-bold mb-0.5">Prix estimé</p>
                                        <p className="text-xs font-bold text-neutral-900">
                                            {parseFloat(repair.price.toString()).toLocaleString('fr-DZ')} DA
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Statut de paiement */}
                        {repair.price && (
                            <div className="mb-3 pb-3 border-b-2 border-dashed border-gray-300">
                                <p className="text-xs text-neutral-400 uppercase font-bold mb-1">Paiement</p>
                                {repair.payment_status === 'paid' ? (
                                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                                        <p className="text-xs text-emerald-900 font-bold flex items-center gap-1">
                                            ✅ Payé intégralement - {parseFloat(repair.price.toString()).toLocaleString('fr-DZ')} DA
                                        </p>
                                    </div>
                                ) : repair.payment_status === 'partial' ? (
                                    <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                                        <p className="text-xs text-amber-900 font-bold">
                                            💰 Paiement partiel : {parseFloat((repair.paid_amount || 0).toString()).toLocaleString('fr-DZ')} DA / {parseFloat(repair.price.toString()).toLocaleString('fr-DZ')} DA
                                        </p>
                                        <p className="text-xs text-amber-700 mt-1">
                                            Reste à payer : {(parseFloat(repair.price.toString()) - parseFloat((repair.paid_amount || 0).toString())).toLocaleString('fr-DZ')} DA
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-red-50 p-2 rounded-lg border border-red-200">
                                        <p className="text-xs text-red-900 font-bold">
                                            ⏳ Non payé - Montant : {parseFloat(repair.price.toString()).toLocaleString('fr-DZ')} DA
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Instructions compactes */}
                        <div className="bg-blue-50 p-2 rounded-lg mb-2">
                            <p className="text-xs text-blue-900 font-medium">
                                📱 Suivez en ligne : <span className="font-mono font-bold">{window.location.host}/track</span>
                            </p>
                        </div>

                        {/* Message personnalisé compact */}
                        {establishment.ticket_message && (
                            <div className="bg-green-50 p-2 rounded-lg mb-2 border border-green-200">
                                <p className="text-xs text-green-900 font-medium text-center">
                                    {establishment.ticket_message}
                                </p>
                            </div>
                        )}

                        {/* Footer compact */}
                        <div className="mt-2 pt-2 border-t border-gray-200 text-center">
                            <p className="text-xs text-neutral-400">
                                Conservez ce ticket
                            </p>
                        </div>
                    </div>
                </div>
                {/* Fin de la div de scroll */}
            </div>

            {/* Styles d'impression */}
            <style jsx global>{`
        @media print {
          /* Masquer tout sauf le ticket */
          body * {
            visibility: hidden !important;
          }
          
          /* Afficher uniquement le contenu du ticket */
          .ticket-content,
          .ticket-content * {
            visibility: visible !important;
          }
          
          /* Masquer les boutons et le header */
          .print\\:hidden {
            display: none !important;
          }
          
          /* Container du ticket - centré et compact */
          .ticket-content {
            position: absolute !important;
            left: 50% !important;
            top: 0 !important;
            transform: translateX(-50%) !important;
            width: 80mm !important;
            max-width: 80mm !important;
            padding: 5mm !important;
            margin: 0 auto !important;
            background: white !important;
            box-sizing: border-box !important;
            box-shadow: none !important;
            border: none !important;
          }
          
          /* Format ticket de caisse */
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          /* Tailles de police réduites */
          .ticket-content {
            font-size: 8pt !important;
            line-height: 1.2 !important;
            color: #000 !important;
          }
          
          /* Titres compacts */
          .ticket-content h1 {
            font-size: 11pt !important;
            margin-bottom: 3px !important;
            color: #000 !important;
          }
          
          .ticket-content h2 {
            font-size: 10pt !important;
            color: #000 !important;
          }
          
          .ticket-content p {
            margin: 2px 0 !important;
            color: #000 !important;
          }
          
          /* QR Code plus petit */
          .ticket-content .qr-code {
            width: 70px !important;
            height: 70px !important;
          }
          
          /* Logo plus petit */
          .ticket-content img {
            max-height: 25px !important;
            width: auto !important;
          }
          
          /* Espacements réduits */
          .ticket-content > div {
            margin-bottom: 4px !important;
          }
          
          /* Bordures compactes */
          .ticket-content .border-b-2 {
            border-bottom: 1px dashed #000 !important;
            padding-bottom: 4px !important;
            margin-bottom: 4px !important;
          }
          
          /* Code de suivi compact */
          .ticket-content [style*="background"] {
            padding: 4px 8px !important;
            border-radius: 4px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Grille compacte */
          .ticket-content .grid {
            gap: 4px !important;
          }
          
          /* Boxes compactes */
          .ticket-content .bg-blue-50,
          .ticket-content .bg-green-50,
          .ticket-content .bg-emerald-50,
          .ticket-content .bg-amber-50,
          .ticket-content .bg-red-50 {
            padding: 3px !important;
            margin-bottom: 3px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Forcer tous les textes gris à devenir noirs pour l'impression */
          .ticket-content .text-neutral-300,
          .ticket-content .text-neutral-400,
          .ticket-content .text-neutral-500,
          .ticket-content .text-neutral-600,
          .ticket-content .text-neutral-700 {
            color: #000 !important;
          }
          
          /* Assurer que tous les spans et divs sont en noir */
          .ticket-content span,
          .ticket-content div {
            color: #000 !important;
          }
        }
      `}</style>
        </div>
    );
}

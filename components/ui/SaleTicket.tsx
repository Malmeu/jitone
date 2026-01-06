'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SaleTicketProps {
    sale: {
        id: string;
        created_at: string;
        total_amount: number;
        subtotal?: number;
        discount_rate?: number;
        discount_amount?: number;
        tax_rate?: number;
        tax_amount?: number;
        payment_method: string;
        client_name?: string;
        client_phone?: string;
        items?: { item_name: string; quantity: number; unit_price: number }[];
    };
    establishment: {
        name: string;
        phone?: string;
        address?: string;
        logo_url?: string;
        ticket_color?: string;
    };
    onClose: () => void;
}

export function SaleTicket({ sale, establishment, onClose }: SaleTicketProps) {
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (qrCanvasRef.current) {
            const receiptUrl = `${window.location.origin}/receipt/${sale.id}`;
            QRCode.toCanvas(qrCanvasRef.current, receiptUrl, {
                width: 100,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });
        }
    }, [sale.id]);

    const handlePrint = () => {
        window.print();
    };

    const handlePrintAndClose = () => {
        window.print();
        setTimeout(() => {
            onClose();
        }, 500);
    };

    const paymentMethodLabels: Record<string, string> = {
        cash: 'Espèces',
        card: 'Carte bancaire',
        baridimob: 'BaridiMob',
        transfer: 'Virement',
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
                    <h2 className="text-lg font-bold text-foreground">Ticket de vente</h2>
                    <div className="flex gap-2">
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

                        {/* Numéro de vente + QR */}
                        <div className="flex items-center justify-between mb-3 pb-3 border-b-2 border-dashed border-gray-300">
                            <div className="flex-1">
                                <p className="text-xs text-neutral-500 uppercase font-bold mb-1">Ticket de vente</p>
                                <div
                                    className="text-white px-4 py-2 rounded-lg inline-block"
                                    style={{ backgroundColor: establishment.ticket_color || '#000000' }}
                                >
                                    <p className="text-lg font-mono font-bold">#{sale.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="bg-white p-2 rounded-lg border-2 border-gray-200">
                                <canvas ref={qrCanvasRef} className="qr-code" />
                            </div>
                        </div>

                        {/* Informations client et date */}
                        <div className="mb-3 pb-3 border-b-2 border-dashed border-gray-300">
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                                <div className="col-span-2">
                                    <p className="text-xs text-neutral-400 uppercase font-bold mb-0.5">Date</p>
                                    <p className="text-sm font-bold text-neutral-900">
                                        {new Date(sale.created_at).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                        })} à {new Date(sale.created_at).toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>

                                {sale.client_name && (
                                    <div className="col-span-2">
                                        <p className="text-xs text-neutral-400 uppercase font-bold mb-0.5">Client</p>
                                        <p className="text-sm font-bold text-neutral-900">{sale.client_name}</p>
                                        {sale.client_phone && (
                                            <p className="text-xs text-neutral-600">{sale.client_phone}</p>
                                        )}
                                    </div>
                                )}

                                <div className="col-span-2">
                                    <p className="text-xs text-neutral-400 uppercase font-bold mb-0.5">Paiement</p>
                                    <p className="text-sm font-bold text-neutral-900">
                                        {paymentMethodLabels[sale.payment_method] || sale.payment_method}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Articles vendus */}
                        <div className="mb-3 pb-3 border-b-2 border-dashed border-gray-300">
                            <p className="text-xs text-neutral-400 uppercase font-bold mb-2">Articles</p>
                            <div className="space-y-2">
                                {sale.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start text-sm">
                                        <div className="flex-1">
                                            <div className="font-bold text-neutral-900">{item.item_name}</div>
                                            <div className="text-xs text-neutral-500">
                                                {item.quantity} x {parseFloat(item.unit_price.toString()).toLocaleString('fr-DZ')} DA
                                            </div>
                                        </div>
                                        <div className="font-bold text-neutral-900">
                                            {(item.quantity * parseFloat(item.unit_price.toString())).toLocaleString('fr-DZ')} DA
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total */}
                        <div className="mb-3 pb-3 border-b-2 border-dashed border-gray-300 space-y-2">
                            <div className="flex justify-between text-sm text-neutral-600">
                                <span>Sous-total</span>
                                <span>{parseFloat((sale.subtotal || sale.total_amount).toString()).toLocaleString('fr-DZ')} DA</span>
                            </div>
                            {sale.discount_rate && sale.discount_rate > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600">
                                    <span>Remise ({sale.discount_rate}%)</span>
                                    <span>-{parseFloat((sale.discount_amount || 0).toString()).toLocaleString('fr-DZ')} DA</span>
                                </div>
                            )}
                            {sale.tax_rate && sale.tax_rate > 0 && (
                                <div className="flex justify-between text-sm text-neutral-600">
                                    <span>TVA ({sale.tax_rate}%)</span>
                                    <span>{parseFloat((sale.tax_amount || 0).toString()).toLocaleString('fr-DZ')} DA</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-black text-neutral-900 pt-2 border-t border-gray-200">
                                <span>TOTAL</span>
                                <span>{parseFloat(sale.total_amount.toString()).toLocaleString('fr-DZ')} DA</span>
                            </div>
                        </div>

                        {/* Footer compact */}
                        <div className="mt-2 pt-2 border-t border-gray-200 text-center">
                            <p className="text-xs text-neutral-400">
                                Merci pour votre achat !
                            </p>
                            <p className="text-xs text-neutral-300 mt-1">
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
          
          /* Forcer tous les textes gris à devenir noirs pour l'impression */
          .ticket-content .text-neutral-300,
          .ticket-content .text-neutral-400,
          .ticket-content .text-neutral-500,
          .ticket-content .text-neutral-600 {
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

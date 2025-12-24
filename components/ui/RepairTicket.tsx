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
                width: 150,
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Ne s'imprime pas */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center print:hidden flex-shrink-0">
                    <h2 className="text-lg font-bold text-neutral-900">Ticket de dépôt</h2>
                    <div className="flex gap-2">
                        {repair.client?.phone && (
                            <Button onClick={handleWhatsApp} size="sm" variant="secondary">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                WhatsApp
                            </Button>
                        )}
                        <Button onClick={handlePrint} size="sm" variant="outline">
                            <Printer className="w-4 h-4 mr-2" />
                            Aperçu
                        </Button>
                        <Button onClick={handlePrintAndClose} size="sm">
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimer
                        </Button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Ticket à imprimer - avec scroll */}
                <div className="overflow-y-auto flex-1 print:overflow-visible">
                    <div className="p-8 print:p-6 ticket-content">
                        {/* En-tête établissement */}
                        <div className="text-center mb-6 pb-6 border-b-2 border-dashed border-gray-300">
                            {establishment.logo_url && (
                                <div className="mb-4 flex justify-center">
                                    <img
                                        src={establishment.logo_url}
                                        alt={establishment.name}
                                        className="h-16 w-auto object-contain"
                                    />
                                </div>
                            )}
                            <h1 className="text-2xl font-bold text-neutral-900 mb-2">{establishment.name}</h1>
                            {establishment.phone && (
                                <p className="text-sm text-neutral-600">📞 {establishment.phone}</p>
                            )}
                            {establishment.address && (
                                <p className="text-sm text-neutral-600">📍 {establishment.address}</p>
                            )}
                        </div>

                        {/* Code de suivi */}
                        <div className="text-center mb-6">
                            <p className="text-sm text-neutral-500 uppercase font-bold tracking-wider mb-2">
                                Code de suivi
                            </p>
                            <div
                                className="text-white px-6 py-3 rounded-xl inline-block"
                                style={{ backgroundColor: establishment.ticket_color || '#000000' }}
                            >
                                <p className="text-2xl font-mono font-bold tracking-wider">{repair.code}</p>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-white p-3 rounded-xl border-2 border-gray-200">
                                <canvas ref={qrCanvasRef} className="qr-code" />
                            </div>
                        </div>

                        {/* Informations réparation */}
                        <div className="space-y-4 mb-6 pb-6 border-b-2 border-dashed border-gray-300">
                            <div>
                                <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider mb-1">Client</p>
                                <p className="text-base font-bold text-neutral-900">{repair.client?.name || 'N/A'}</p>
                                {repair.client?.phone && (
                                    <p className="text-sm text-neutral-600">{repair.client.phone}</p>
                                )}
                            </div>

                            <div>
                                <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider mb-1">Appareil</p>
                                <p className="text-base font-bold text-neutral-900">{repair.item}</p>
                            </div>

                            {repair.description && (
                                <div>
                                    <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider mb-1">Description</p>
                                    <p className="text-sm text-neutral-700">{repair.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider mb-1">Date de dépôt</p>
                                    <p className="text-sm font-medium text-neutral-900">
                                        {new Date(repair.created_at).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>

                                {repair.price && (
                                    <div>
                                        <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider mb-1">Prix estimé</p>
                                        <p className="text-sm font-bold text-neutral-900">
                                            {parseFloat(repair.price.toString()).toLocaleString('fr-DZ')} DA
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 p-4 rounded-xl">
                            <p className="text-xs text-blue-900 font-medium mb-2">📱 Suivez votre réparation en ligne :</p>
                            <p className="text-xs text-blue-700">
                                1. Scannez le QR code ci-dessus<br />
                                2. Ou rendez-vous sur <span className="font-mono font-bold">{window.location.origin}/track</span><br />
                                3. Entrez votre code : <span className="font-mono font-bold">{repair.code}</span>
                            </p>
                        </div>

                        {/* Message personnalisé */}
                        {establishment.ticket_message && (
                            <div className="bg-green-50 p-4 rounded-xl mb-4 border border-green-200">
                                <p className="text-sm text-green-900 font-medium text-center">
                                    {establishment.ticket_message}
                                </p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                            <p className="text-xs text-neutral-400">
                                Conservez ce ticket jusqu&apos;à la récupération de votre appareil
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
          
          /* Container du ticket - centré */
          .ticket-content {
            position: absolute !important;
            left: 50% !important;
            top: 0 !important;
            transform: translateX(-50%) !important;
            width: 80mm !important;
            max-width: 80mm !important;
            padding: 10mm !important;
            margin: 0 auto !important;
            background: white !important;
            box-sizing: border-box !important;
          }
          
          /* Format ticket de caisse */
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          /* Réinitialiser les styles pour l'impression */
          .ticket-content {
            font-size: 9pt !important;
            line-height: 1.4 !important;
          }
          
          /* Ajuster les tailles pour ticket de caisse */
          .ticket-content h1 {
            font-size: 14pt !important;
            margin-bottom: 8px !important;
          }
          
          .ticket-content h2 {
            font-size: 12pt !important;
          }
          
          .ticket-content p {
            margin: 4px 0 !important;
          }
          
          /* QR Code */
          .ticket-content .qr-code {
            width: 100px !important;
            height: 100px !important;
          }
          
          /* Logo */
          .ticket-content img {
            max-height: 35px !important;
            width: auto !important;
          }
          
          /* Espacements */
          .ticket-content > div {
            margin-bottom: 8px !important;
          }
          
          /* Bordures */
          .ticket-content .border-b-2 {
            border-bottom: 1px dashed #000 !important;
            padding-bottom: 8px !important;
            margin-bottom: 8px !important;
          }
          
          /* Code de suivi */
          .ticket-content [style*="background"] {
            padding: 8px 12px !important;
            border-radius: 8px !important;
          }
        }
      `}</style>
        </div>
    );
}

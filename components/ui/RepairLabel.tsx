'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RepairLabelProps {
    repair: {
        code: string;
        item: string;
        description?: string;
        client?: { name: string; phone?: string };
        created_at: string;
    };
    onClose: () => void;
}

export function RepairLabel({ repair, onClose }: RepairLabelProps) {
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (qrCanvasRef.current) {
            const trackUrl = `${window.location.origin}/track/${repair.code}`;
            QRCode.toCanvas(qrCanvasRef.current, trackUrl, {
                width: 60,
                margin: 0,
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

    const handlePrintAndClose = () => {
        window.print();
        setTimeout(() => {
            onClose();
        }, 500);
    };

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-card dark:bg-neutral-900 rounded-[2.5rem] shadow-heavy max-w-sm w-full overflow-hidden border border-neutral-100 dark:border-neutral-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Visual Header */}
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center print:hidden bg-neutral-50/50 dark:bg-neutral-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Étiquette Appareil</h2>
                        <p className="text-xs text-neutral-400 font-medium">Format compact pour imprimante thermique.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                        <X size={20} className="text-neutral-400" />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center">
                    {/* The Label Area */}
                    <div id="repair-label-to-print" className="bg-white p-3 border border-dashed border-neutral-200 rounded-xl w-[200px] h-[333px] flex flex-col items-center text-black font-sans overflow-hidden">
                        {/* Header */}
                        <div className="text-center w-full mb-1">
                            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 leading-none mb-1">Diagnostic & Travaux</div>
                            <div className="text-[11px] font-bold leading-tight border-b border-neutral-100 pb-1 line-clamp-2 uppercase">
                                {repair.description || 'Diagnostic en attente'}
                            </div>
                        </div>

                        {/* QR Code central */}
                        <div className="flex-1 flex items-center justify-center py-2">
                            <canvas ref={qrCanvasRef} className="w-24 h-24" />
                        </div>

                        {/* Info Appareil */}
                        <div className="w-full text-center mt-auto border-t border-neutral-100 pt-2 space-y-1">
                            <div className="text-[11px] font-black leading-tight uppercase line-clamp-2">{repair.item}</div>
                            <div className="text-[9px] font-bold text-neutral-500 truncate">{repair.client?.name || 'Client'}</div>
                            <div className="text-[8px] font-bold text-neutral-400 mt-1 flex justify-between w-full px-1">
                                <span>{new Date(repair.created_at).toLocaleDateString()}</span>
                                <span className="font-mono">{repair.code}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-neutral-50/50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800 flex gap-4 print:hidden">
                    <Button onClick={onClose} variant="ghost" className="flex-1 h-12 rounded-2xl font-bold text-neutral-400">
                        Annuler
                    </Button>
                    <Button onClick={handlePrintAndClose} className="flex-[2] h-12 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black font-black hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-xl transition-all">
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimer
                    </Button>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: 30mm 50mm;
                        margin: 0;
                    }
                    body * {
                        visibility: hidden !important;
                        background: white !important;
                    }
                    #repair-label-to-print, #repair-label-to-print * {
                        visibility: visible !important;
                    }
                    #repair-label-to-print {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 30mm !important;
                        height: 50mm !important;
                        padding: 2mm !important;
                        border: none !important;
                        border-radius: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: space-between !important;
                        text-align: center !important;
                        box-sizing: border-box !important;
                    }
                    /* Forcer le QR code */
                    #repair-label-to-print canvas {
                        width: 20mm !important;
                        height: 20mm !important;
                    }
                }
            `}</style>
        </div>
    );
}

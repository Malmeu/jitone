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
                    <div id="repair-label-to-print" className="bg-white p-4 border border-dashed border-neutral-200 rounded-xl w-full max-w-[250px] aspect-[5/3] flex flex-col justify-between text-black font-sans">
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 leading-none mb-1">Fixwave Repair</div>
                                <div className="text-sm font-bold truncate leading-tight">{repair.item}</div>
                                <div className="text-[10px] font-medium text-neutral-500 truncate mt-0.5">{repair.client?.name || 'Client anonyme'}</div>
                            </div>
                            <canvas ref={qrCanvasRef} className="w-12 h-12 flex-shrink-0" />
                        </div>

                        <div className="mt-2 flex items-end justify-between border-t border-neutral-100 pt-2">
                            <div className="flex-1 min-w-0 pr-2">
                                <div className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">Problème / Travaux</div>
                                <div className="text-[13px] font-black leading-tight line-clamp-2 uppercase mt-0.5">{repair.description || 'Pas de description'}</div>
                            </div>
                            <div className="text-[9px] font-bold text-neutral-400 leading-none mb-0.5">
                                {new Date(repair.created_at).toLocaleDateString()}
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
                        size: 50mm 30mm;
                        margin: 0;
                    }
                    body * {
                        visibility: hidden;
                        background: white !important;
                    }
                    #repair-label-to-print, #repair-label-to-print * {
                        visibility: visible;
                    }
                    #repair-label-to-print {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 50mm !important;
                        height: 30mm !important;
                        padding: 2mm !important;
                        border: none !important;
                        border-radius: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                    }
                }
            `}</style>
        </div>
    );
}

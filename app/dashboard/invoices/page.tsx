'use client';

import { FileText } from 'lucide-react';

export default function InvoicesPage() {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900">Factures</h1>
                <p className="text-neutral-500">Gérez vos factures et paiements</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Fonctionnalité à venir</h3>
                <p className="text-neutral-500 max-w-md mx-auto">
                    La gestion des factures sera bientôt disponible. Vous pourrez générer des factures PDF et suivre vos paiements.
                </p>
            </div>
        </div>
    );
}

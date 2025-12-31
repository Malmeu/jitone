'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Search, Loader2, CheckCircle, XCircle, AlertCircle, Smartphone, ShieldCheck, Globe, Zap, History, Info, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ICloudCheckPage() {
    const [imei, setImei] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!imei.trim()) {
            setError('Veuillez entrer un IMEI ou numéro de série');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch('/api/icloud-check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imei: imei.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la vérification');
            }

            setResult(data);
        } catch (err: any) {
            console.error('Check error:', err);
            setError(err.message || 'Erreur lors de la vérification');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const lowerStatus = status?.toLowerCase() || '';
        if (lowerStatus.includes('clean') || lowerStatus.includes('off') || lowerStatus.includes('unlocked')) {
            return 'bg-emerald-50 border-emerald-100 text-emerald-600';
        } else if (lowerStatus.includes('lost') || lowerStatus.includes('locked') || lowerStatus.includes('on')) {
            return 'bg-rose-50 border-rose-100 text-rose-600';
        } else {
            return 'bg-amber-50 border-amber-100 text-amber-600';
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden" animate="visible" variants={containerVariants}
            className="max-w-[1200px] mx-auto pb-24 px-4 md:px-8 font-inter"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full font-inter">Sécurité & Hardware</span>
                    </motion.div>
                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-2 font-inter"
                    >
                        iCloud Check
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-lg text-neutral-500 font-medium font-inter"
                    >
                        Vérifiez l'état de verrouillage et la garantie des appareils Apple.
                    </motion.p>
                </div>
                <motion.div variants={itemVariants} className="hidden lg:flex items-center gap-4 p-4 bg-white rounded-3xl border border-neutral-100 shadow-sm font-inter">
                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                        <Zap size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 font-inter">Vitesse</div>
                        <div className="text-sm font-bold text-neutral-900 font-inter font-inter">Résultats instantanés</div>
                    </div>
                </motion.div>
            </div>

            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-100 overflow-hidden mb-12 font-inter">
                <div className="p-8 md:p-12 font-inter">
                    <form onSubmit={handleCheck} className="max-w-2xl mx-auto space-y-8">
                        <div className="space-y-4 font-inter">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1 font-inter">Identifiant de l'appareil</label>
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-300 group-focus-within:text-primary transition-colors font-inter" />
                                <input
                                    type="text"
                                    value={imei}
                                    onChange={(e) => setImei(e.target.value)}
                                    placeholder="Entrez l'IMEI ou le numéro de série..."
                                    className="w-full pl-16 pr-6 py-6 rounded-3xl border-2 border-neutral-50 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-xl font-bold bg-[#FBFBFD] font-inter font-inter"
                                    disabled={loading}
                                />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium px-1">
                                <Info size={14} />
                                <span>L'IMEI se trouve dans Réglages → Général → Informations ou tapez *#06#</span>
                            </div>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
                                <AlertCircle size={20} />
                                <span className="text-sm font-bold">{error}</span>
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading || !imei.trim()}
                            className="w-full h-18 text-lg font-black rounded-[2rem] bg-neutral-900 hover:bg-neutral-800 text-white shadow-2xl transition-all active:scale-[0.98] py-8"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                    Analyse des serveurs Apple...
                                </>
                            ) : (
                                <>
                                    Lancer la vérification
                                    <ArrowRight className="ml-3 w-6 h-6" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </motion.div>

            {/* Results Section */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
                        className="space-y-8 font-inter"
                    >
                        <div className="bg-white rounded-[2.5rem] border border-neutral-100 p-8 md:p-12 shadow-sm font-inter">
                            <div className="flex flex-col md:flex-row gap-12 items-start">
                                <div className="w-full md:w-1/3 flex flex-col items-center text-center font-inter">
                                    <div className="w-40 h-40 bg-neutral-50 rounded-[3rem] flex items-center justify-center mb-6 relative">
                                        <Smartphone size={80} className="text-neutral-200" />
                                        <div className={`absolute -bottom-2 -right-2 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white ${getStatusColor(result.findMyIphone || '')}`}>
                                            {result.findMyIphone?.toLowerCase().includes('off') ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-black text-neutral-900 mb-2 font-inter">{result.model || 'iPhone'}</h2>
                                    <p className="text-neutral-400 text-sm font-mono font-inter">{result.imei || imei}</p>
                                </div>

                                <div className="flex-1 w-full font-inter">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { label: 'Find My iPhone', val: result.findMyIphone || '---', icon: ShieldCheck },
                                            { label: 'Statut iCloud', val: result.iCloudStatus || '---', icon: Globe },
                                            { label: 'Garantie', val: result.warrantyStatus || '---', icon: History },
                                            { label: 'SIM Lock', val: result.simLock || '---', icon: Smartphone }
                                        ].map((item, i) => (
                                            <div key={i} className="p-6 bg-[#FBFBFD] rounded-[2rem] border border-neutral-50 group hover:border-primary/20 transition-all font-inter">
                                                <div className="flex items-center gap-3 mb-2 font-inter">
                                                    <item.icon size={16} className="text-neutral-300" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 font-inter">{item.label}</span>
                                                </div>
                                                <div className={`text-lg font-black ${item.val.toLowerCase().includes('on') || item.val.toLowerCase().includes('locked') ? 'text-rose-500' : item.val.toLowerCase().includes('off') || item.val.toLowerCase().includes('clean') ? 'text-emerald-500' : 'text-neutral-900'} font-inter`}>
                                                    {item.val}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 p-8 bg-neutral-900 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 font-inter">
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 font-inter">Marketing Name</div>
                                            <div className="text-xl font-bold font-inter">{result.modelName || 'Unknown Device'}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 font-inter">Achat estimé</div>
                                            <div className="text-xl font-bold font-inter">{result.purchaseDate || '---'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div variants={itemVariants} className="mt-12 bg-blue-50/50 rounded-[2.5rem] p-8 border border-blue-100/30 flex items-start gap-6 font-inter">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm font-inter">
                    <Info size={24} />
                </div>
                <div className="font-inter">
                    <h3 className="font-black text-blue-900 uppercase tracking-widest text-xs mb-3 font-inter">Guide des statuts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 font-inter">
                        <p className="text-sm text-blue-800/80 font-inter font-inter"><strong>iCloud Clean</strong> : L'appareil est libre de tout lien Apple ID propriétaire.</p>
                        <p className="text-sm text-blue-800/80 font-inter"><strong>Lost Mode</strong> : L'appareil a été déclaré comme volé ou perdu par son détenteur.</p>
                        <p className="text-sm text-blue-800/80 font-inter"><strong>Find My ON</strong> : Le verrouillage d'activation est actif, mot de passe requis.</p>
                        <p className="text-sm text-blue-800/80 font-inter"><strong>SIM Locked</strong> : L'appareil ne peut être utilisé qu'avec un opérateur spécifique.</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

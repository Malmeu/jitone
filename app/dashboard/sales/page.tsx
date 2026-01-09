'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, ShoppingCart, Trash2,
    DollarSign, Loader2, X, Check, Box, Tag,
    User, Phone, FileText, ArrowRight, Package,
    History, TrendingUp, CreditCard, Percent
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { SaleTicket } from '@/components/ui/SaleTicket';
import { useUser } from '../UserContext';

interface InventoryItem {
    id: string;
    name: string;
    sku: string;
    selling_price: number;
    current_stock: number;
    icon?: string;
    type: string;
}

interface CartItem extends InventoryItem {
    quantity: number;
}

interface Sale {
    id: string;
    created_at: string;
    total_amount: number;
    payment_method: string;
    client_name: string;
    items?: { item_name: string, quantity: number, unit_price: number }[];
}

export default function SalesPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCheckout, setShowCheckout] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [establishmentId, setEstablishmentId] = useState<string | null>(null);
    const [establishment, setEstablishment] = useState<any>(null);
    const [activeView, setActiveView] = useState<'pos' | 'history'>('pos');
    const [showTicket, setShowTicket] = useState(false);
    const [ticketData, setTicketData] = useState<any>(null);
    const [taxRate, setTaxRate] = useState<string | number>(0);
    const [discount, setDiscount] = useState<string | number>(0);

    const [clientData, setClientData] = useState({
        name: '',
        phone: '',
        payment_method: 'cash',
        notes: ''
    });

    const { profile, establishment: userEst, loading: userLoading } = useUser();

    useEffect(() => {
        if (!userLoading && profile) {
            fetchData();
        }
    }, [userLoading, profile]);

    const fetchData = async () => {
        try {
            if (!profile) return;
            setEstablishmentId(profile.establishment_id);
            setEstablishment(userEst);

            await Promise.all([
                loadInventory(profile.establishment_id),
                loadSales(profile.establishment_id)
            ]);
        } catch (error) {
            console.error('Error in fetchData:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadInventory = async (estId: string) => {
        const { data } = await supabase
            .from('inventory')
            .select('id, name, sku, selling_price, current_stock, icon, type')
            .eq('establishment_id', estId)
            .eq('type', 'sale_item')
            .gt('current_stock', 0)
            .order('name');
        if (data) setInventory(data);
    };

    const loadSales = async (estId: string) => {
        const { data } = await supabase
            .from('sales')
            .select(`
                *,
                items:sale_items(item_name, quantity, unit_price)
            `)
            .eq('establishment_id', estId)
            .order('created_at', { ascending: false })
            .limit(10);
        if (data) setSales(data);
    };

    const addToCart = (item: InventoryItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                if (existing.quantity >= item.current_stock) return prev;
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.id === id) {
                const newQty = i.quantity + delta;
                if (newQty < 1) return i;
                if (newQty > i.current_stock) return i;
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const cartSubtotal = cart.reduce((acc, item) => acc + (item.selling_price * item.quantity), 0);
    const discountVal = typeof discount === 'string' ? (parseFloat(discount) || 0) : discount;
    const taxVal = typeof taxRate === 'string' ? (parseFloat(taxRate) || 0) : taxRate;

    const discountAmount = cartSubtotal * (discountVal / 100);
    const subtotalAfterDiscount = cartSubtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * (taxVal / 100);
    const cartTotal = subtotalAfterDiscount + taxAmount;

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!establishmentId || cart.length === 0) return;
        setSubmitting(true);

        try {
            // 1. Créer la vente
            const { data: sale, error: saleError } = await supabase
                .from('sales')
                .insert([{
                    establishment_id: establishmentId,
                    subtotal: cartSubtotal,
                    discount_rate: discountVal,
                    discount_amount: discountAmount,
                    tax_rate: taxVal,
                    tax_amount: taxAmount,
                    total_amount: cartTotal,
                    payment_method: clientData.payment_method,
                    client_name: clientData.name,
                    client_phone: clientData.phone,
                    notes: clientData.notes
                }])
                .select()
                .single();

            if (saleError) throw saleError;

            // 2. Créer les items de vente et mettre à jour le stock
            const saleItems = cart.map(item => ({
                sale_id: sale.id,
                inventory_id: item.id,
                quantity: item.quantity,
                unit_price: item.selling_price,
                total_price: item.selling_price * item.quantity,
                item_name: item.name
            }));

            const { error: itemsError } = await supabase.from('sale_items').insert(saleItems);
            if (itemsError) throw itemsError;

            // Mettre à jour le stock pour chaque item
            for (const item of cart) {
                await supabase.rpc('decrement_inventory_stock', {
                    item_id: item.id,
                    qty: item.quantity
                });
            }

            // Préparer les données du ticket
            const ticketItems = cart.map(item => ({
                item_name: item.name,
                quantity: item.quantity,
                unit_price: item.selling_price
            }));

            setTicketData({
                ...sale,
                items: ticketItems
            });

            // Reset
            setCart([]);
            setClientData({ name: '', phone: '', payment_method: 'cash', notes: '' });
            setTaxRate(0);
            setDiscount(0);
            setShowCheckout(false);
            setShowTicket(true);
            await fetchData();
        } catch (error: any) {
            console.error('Error processing sale:', error);
            alert('Erreur lors de la vente: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto pb-24 px-4 md:px-8 font-inter">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full">Point de Vente</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-2">Ventes directes</h1>
                    <p className="text-lg text-neutral-500 font-medium">Vendez vos accessoires et téléphones en toute simplicité.</p>
                </div>

                <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-neutral-900/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                    <button
                        onClick={() => setActiveView('pos')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeView === 'pos' ? 'bg-white dark:bg-neutral-800 text-primary shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                    >
                        <ShoppingCart size={18} /> Caisse
                    </button>
                    <button
                        onClick={() => setActiveView('history')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeView === 'history' ? 'bg-white dark:bg-neutral-800 text-primary shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                    >
                        <History size={18} /> Historique
                    </button>
                </div>
            </div>

            {activeView === 'pos' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Inventory */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Rechercher un article..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 rounded-[2rem] border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all bg-card shadow-sm font-medium text-foreground"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredInventory.map(item => (
                                <motion.div
                                    layout
                                    key={item.id}
                                    onClick={() => addToCart(item)}
                                    whileHover={{ y: -5 }}
                                    className="group cursor-pointer bg-card rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 p-6 shadow-sm hover:shadow-xl hover:border-[#1E7FA0]/20 transition-all active:scale-[0.98] flex flex-col min-h-[260px] justify-between relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#1E7FA0]/5 rounded-full blur-2xl -mr-12 -mt-12" />

                                    <div className="w-14 h-14 bg-[#1E7FA0]/5 dark:bg-[#1E7FA0]/10 text-[#1E7FA0] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <IconRenderer name={item.icon || 'Box'} size={28} />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="font-black text-foreground text-lg leading-tight line-clamp-2 min-h-[2.5rem]">{item.name}</div>
                                        <div className="space-y-3">
                                            <div className="text-[#1E7FA0] font-black text-2xl tracking-tight">
                                                {item.selling_price.toLocaleString()} <span className="text-sm font-bold opacity-60">DA</span>
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">STOCK: {item.current_stock}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Cart */}
                    <div className="lg:col-span-4 h-fit sticky top-8">
                        <div className="bg-card rounded-[3rem] shadow-soft border border-neutral-100 dark:border-neutral-800 p-8 flex flex-col gap-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <ShoppingCart size={24} className="text-primary" />
                                    Panier
                                </h3>
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">{cart.length} articles</span>
                            </div>

                            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                                {cart.length === 0 ? (
                                    <div className="text-center py-12 text-neutral-400">
                                        <Box size={40} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-medium">Le panier est vide</p>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} className="flex items-start gap-4 group">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm break-words leading-tight">{item.name}</div>
                                                <div className="text-xs text-neutral-400 mt-1">{item.selling_price.toLocaleString()} DA</div>
                                            </div>
                                            <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-900/50 p-1.5 rounded-xl flex-shrink-0">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-white dark:hover:bg-neutral-800 rounded-lg text-neutral-500">-</button>
                                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-white dark:hover:bg-neutral-800 rounded-lg text-neutral-500">+</button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="p-2 text-neutral-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"><Trash2 size={16} /></button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                                <div className="flex justify-between items-center text-sm text-neutral-500">
                                    <span>Sous-total</span>
                                    <span>{cartSubtotal.toLocaleString()} DA</span>
                                </div>
                                {/* Remise */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Percent size={14} className="text-emerald-500" />
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={discount}
                                            onChange={(e) => setDiscount(e.target.value)}
                                            className="w-20 px-2 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                                            placeholder="0"
                                        />
                                        <span className="text-xs text-neutral-400 font-medium">% Remise</span>
                                    </div>
                                    {discountVal > 0 && (
                                        <div className="flex justify-between items-center text-sm text-emerald-600">
                                            <span>Remise ({discountVal}%)</span>
                                            <span>-{discountAmount.toLocaleString()} DA</span>
                                        </div>
                                    )}
                                </div>

                                {/* TVA */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Percent size={14} className="text-neutral-400" />
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(e.target.value)}
                                            className="w-20 px-2 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                                            placeholder="0"
                                        />
                                        <span className="text-xs text-neutral-400 font-medium">% TVA</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-neutral-500">
                                        <span>TVA ({taxRate}%)</span>
                                        <span>{taxAmount.toLocaleString()} DA</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="text-2xl font-black text-primary">{cartTotal.toLocaleString()} DA</span>
                                </div>
                                <Button
                                    disabled={cart.length === 0}
                                    onClick={() => setShowCheckout(true)}
                                    className="w-full h-14 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-2xl shadow-xl font-black flex items-center justify-center gap-3"
                                >
                                    Payer <ArrowRight size={20} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* History View */
                <div className="space-y-6">
                    <div className="bg-card rounded-[2.5rem] shadow-soft border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[#FBFBFD] dark:bg-neutral-900/50 text-neutral-400 text-[11px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-6">Date</th>
                                    <th className="px-8 py-6">Client</th>
                                    <th className="px-8 py-6">Articles</th>
                                    <th className="px-8 py-6">Paiement</th>
                                    <th className="px-8 py-6 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                                {sales.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-neutral-400">Aucune vente enregistrée.</td>
                                    </tr>
                                ) : (
                                    sales.map(sale => (
                                        <tr key={sale.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="font-bold">{new Date(sale.created_at).toLocaleDateString()}</div>
                                                <div className="text-[10px] text-neutral-400">{new Date(sale.created_at).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-bold">{sale.client_name || 'Client de passage'}</div>
                                                <div className="text-xs text-neutral-400">{sale.payment_method}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-wrap gap-1">
                                                    {sale.items?.map((item, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-md text-[10px] font-bold">
                                                            {item.quantity}x {item.item_name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 uppercase text-[10px] font-black text-emerald-500 tracking-widest">Payé</td>
                                            <td className="px-8 py-6 text-right font-black text-lg">{sale.total_amount.toLocaleString()} DA</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            <AnimatePresence>
                {showCheckout && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md" onClick={() => setShowCheckout(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative bg-card rounded-[3rem] shadow-heavy max-w-md w-full p-8 border border-neutral-100 dark:border-neutral-800"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold">Finaliser la vente</h2>
                                <button onClick={() => setShowCheckout(false)} className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all"><X /></button>
                            </div>

                            <form onSubmit={handleCheckout} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Nom du client (Optionnel)</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                            <input
                                                type="text"
                                                value={clientData.name}
                                                onChange={e => setClientData({ ...clientData, name: e.target.value })}
                                                className="w-full pl-10 pr-4 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold"
                                                placeholder="ex: Ahmed Ben"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Téléphone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                            <input
                                                type="text"
                                                value={clientData.phone}
                                                onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                                                className="w-full pl-10 pr-4 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold"
                                                placeholder="05..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Mode de Paiement</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['cash', 'card'].map(m => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => setClientData({ ...clientData, payment_method: m })}
                                                    className={`py-4 rounded-2xl border font-bold capitalize transition-all ${clientData.payment_method === m ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-card border-neutral-100 dark:border-neutral-800 text-neutral-500'}`}
                                                >
                                                    {m === 'cash' ? 'Espèces' : 'Carte'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                                    <div className="text-sm text-neutral-500 font-medium mb-1">Montant à payer</div>
                                    <div className="text-3xl font-black text-primary">{cartTotal.toLocaleString()} DA</div>
                                </div>

                                <Button disabled={submitting} type="submit" className="w-full h-16 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-2xl shadow-xl font-black text-lg">
                                    {submitting ? <Loader2 className="animate-spin" /> : 'Valider le Paiement'}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sale Ticket Modal */}
            <AnimatePresence>
                {showTicket && ticketData && establishment && (
                    <SaleTicket
                        sale={ticketData}
                        establishment={establishment}
                        onClose={() => setShowTicket(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    UserPlus,
    Shield,
    Wrench,
    MoreHorizontal,
    Trash2,
    Clock,
    TrendingUp,
    CheckCircle2,
    Search,
    Mail,
    User,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUser } from '../UserContext';

export default function TeamPage() {
    const [team, setTeam] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [establishment, setEstablishment] = useState<any>(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('technician');
    const [inviteName, setInviteName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [stats, setStats] = useState<any>(null);

    const { profile, establishment: userEst, loading: userLoading } = useUser();

    useEffect(() => {
        if (!userLoading && profile) {
            fetchTeamData();
        }
    }, [userLoading, profile]);

    const fetchTeamData = async () => {
        try {
            if (!profile) return;
            setEstablishment(userEst);

            const [teamRes, repairStatsRes] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('establishment_id', profile.establishment_id)
                    .order('role'),
                supabase
                    .from('repairs')
                    .select('assigned_to, status, started_at, completed_at')
                    .eq('establishment_id', profile.establishment_id)
            ]);

            if (teamRes.data) setTeam(teamRes.data);

            const repairStats = repairStatsRes.data;
            if (repairStats) {
                const memberStats: any = {};
                repairStats.forEach(r => {
                    if (!r.assigned_to) return;
                    if (!memberStats[r.assigned_to]) {
                        memberStats[r.assigned_to] = { total: 0, completed: 0, totalTime: 0 };
                    }
                    memberStats[r.assigned_to].total += 1;
                    if (r.status === 'pret_recup' || r.status === 'recupere') {
                        memberStats[r.assigned_to].completed += 1;
                        if (r.started_at && r.completed_at) {
                            const duration = new Date(r.completed_at).getTime() - new Date(r.started_at).getTime();
                            memberStats[r.assigned_to].totalTime += duration;
                        }
                    }
                });
                setStats(memberStats);
            }

        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Simplified: In a real app, this would send an email invite or use an Edge Function
            // Here we assume the user might already exist or we create a profile that they'll claim
            // FOR NOW: Let's assume we can't create Auth users, so we just add a profile with a placeholder ID if they don't exist?
            // BETTER: Search if user exists by email in a public profiles table (if exposed) or just add to establishment by email.

            // For this demo, we'll just show the UI part and simulate success if it's a new email
            // In a real Supabase setup, you'd use a service role via an API route.

            const { error } = await supabase
                .from('profiles')
                .insert([{
                    establishment_id: establishment.id,
                    email: inviteEmail,
                    name: inviteName,
                    role: inviteRole,
                    status: 'active',
                    id: crypto.randomUUID() // Placeholder, won't link to Auth until fixed
                }]);

            if (error) throw error;

            setShowAddModal(false);
            setInviteEmail('');
            setInviteName('');
            await fetchTeamData();
        } catch (error: any) {
            alert('Erreur: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const updateRole = async (memberId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', memberId);
            if (error) throw error;
            await fetchTeamData();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (establishment?.subscription_plan !== 'premium') {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4">
                <div className="bg-neutral-900 rounded-[3rem] p-12 text-white text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px]" />
                    <div className="relative z-10">
                        <div className="inline-flex p-4 bg-white/10 rounded-3xl mb-8">
                            <ShieldCheck size={48} className="text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Passez au Forfait <span className="text-primary italic">Premium</span></h1>
                        <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
                            La gestion d'équipe est une fonctionnalité avancée. Recrutez des techniciens, suivez leur travail et développez votre activité.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                            {[
                                { title: 'Multi-comptes', desc: 'Ajoutez votre équipe technique' },
                                { title: 'Rapports Excel', desc: 'Exports comptables un clic' },
                                { title: 'Inventaire Pro', desc: 'Gestion avancée des stocks' }
                            ].map((feat, i) => (
                                <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                    <div className="font-bold text-lg mb-1">{feat.title}</div>
                                    <div className="text-xs text-white/40">{feat.desc}</div>
                                </div>
                            ))}
                        </div>
                        <Button className="h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-sm shadow-xl border-none">
                            Contacter le support pour activer
                        </Button>
                        <p className="mt-6 text-sm text-white/30 font-bold uppercase tracking-widest">Upgradez votre atelier dès aujourd'hui</p>
                    </div>
                </div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-12 pb-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Ressources Humaines</span>
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-2">Gestion d'Équipe</motion.h1>
                    <motion.p variants={itemVariants} className="text-lg text-neutral-500 font-medium">Gérez vos employés et suivez leurs performances en temps réel.</motion.p>
                </div>
                <motion.div variants={itemVariants}>
                    <Button onClick={() => setShowAddModal(true)} className="h-14 px-8 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-xl font-bold">
                        <UserPlus className="w-5 h-5 mr-3" />
                        Ajouter un collaborateur
                    </Button>
                </motion.div>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="p-8 bg-card rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-soft">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
                        <Users size={24} />
                    </div>
                    <div className="text-3xl font-black text-foreground mb-1">{team.length}</div>
                    <div className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Effectif Total</div>
                </motion.div>
                <motion.div variants={itemVariants} className="p-8 bg-card rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-soft">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="text-3xl font-black text-foreground mb-1">
                        {(Object.values(stats || {}) as any[]).reduce((acc: number, s: any) => acc + (s.completed || 0), 0)}
                    </div>
                    <div className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Réparations Terminées</div>
                </motion.div>
                <motion.div variants={itemVariants} className="p-8 bg-card rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-soft">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
                        <TrendingUp size={24} />
                    </div>
                    <div className="text-3xl font-black text-foreground mb-1">94%</div>
                    <div className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Taux de Réussite</div>
                </motion.div>
            </div>

            {/* Team List */}
            <motion.div variants={itemVariants} className="bg-card rounded-[2.5rem] shadow-soft border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#FBFBFD] dark:bg-neutral-900/50 text-neutral-400 text-[11px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-6">Membre</th>
                                <th className="px-8 py-6">Rôle</th>
                                <th className="px-8 py-6">Performance</th>
                                <th className="px-8 py-6">Temps Moyen</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                            {team.map((member) => {
                                const memberStat = stats?.[member.id] || { total: 0, completed: 0, totalTime: 0 };
                                const avgTime = memberStat.completed > 0
                                    ? Math.round(memberStat.totalTime / memberStat.completed / (1000 * 60))
                                    : 0;

                                return (
                                    <tr key={member.id} className="group hover:bg-[#FBFBFD]/50 dark:hover:bg-neutral-900/50 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-500 font-black text-xl border-2 border-white dark:border-neutral-800 shadow-sm">
                                                    {member.name?.charAt(0) || <User size={20} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground text-base">{member.name || 'Sans nom'}</div>
                                                    <div className="text-neutral-400 text-xs mt-0.5">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                {member.role === 'owner' ? (
                                                    <span className="px-3 py-1 bg-neutral-900 text-white dark:bg-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-tight">Propriétaire</span>
                                                ) : (
                                                    <select
                                                        value={member.role}
                                                        onChange={(e) => updateRole(member.id, e.target.value)}
                                                        className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-tight focus:outline-none"
                                                    >
                                                        <option value="manager">Manager</option>
                                                        <option value="technician">Technicien</option>
                                                    </select>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5 w-32">
                                                <div className="flex justify-between text-[10px] font-bold uppercase">
                                                    <span className="text-neutral-400">Progression</span>
                                                    <span className="text-primary">{memberStat.completed}/{memberStat.total}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{ width: `${memberStat.total > 0 ? (memberStat.completed / memberStat.total) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 font-bold">
                                                <Clock size={14} className="text-primary" />
                                                {avgTime > 0 ? `${avgTime} min` : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {member.role !== 'owner' && (
                                                <button className="p-2.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Invite Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-card rounded-[3rem] shadow-heavy max-w-lg w-full p-10 border border-neutral-100 dark:border-neutral-800">
                            <h2 className="text-3xl font-bold text-foreground mb-2">Ajouter un collaborateur</h2>
                            <p className="text-neutral-400 mb-8 font-medium">L'employé doit déjà disposer d'un compte ou s'inscrire avec cet email.</p>

                            <form onSubmit={handleAddMember} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Nom Complet</label>
                                    <div className="relative">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                        <input
                                            required placeholder="Jean Dupont"
                                            value={inviteName} onChange={(e) => setInviteName(e.target.value)}
                                            className="w-full pl-14 pr-6 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Adresse Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                        <input
                                            required type="email" placeholder="email@exemple.com"
                                            value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                                            className="w-full pl-14 pr-6 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Rôle Attribué</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                        <select
                                            value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                                            className="w-full pl-14 pr-6 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 focus:outline-none focus:ring-4 focus:ring-primary/5 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold flex appearance-none"
                                        >
                                            <option value="technician">Technicien (Accès SAV uniquement)</option>
                                            <option value="manager">Manager (Accès Total)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1 h-14 rounded-2xl text-neutral-400 outline-none">Annuler</Button>
                                    <Button type="submit" disabled={submitting} className="flex-[2] h-14 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black font-black shadow-xl">
                                        Confirmer l'ajout
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

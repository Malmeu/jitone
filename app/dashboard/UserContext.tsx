'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface UserContextType {
    user: any;
    profile: any;
    establishment: any;
    loading: boolean;
    refreshData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [establishment, setEstablishment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchData = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                setLoading(false);
                return;
            }
            setUser(authUser);

            // Fetch profile and establishment in parallel
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*, establishment:establishments(*)')
                .eq('user_id', authUser.id)
                .single();

            if (profileData) {
                setProfile(profileData);
                setEstablishment(profileData.establishment);
            }
        } catch (error) {
            console.error('Error in UserProvider:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <UserContext.Provider value={{ user, profile, establishment, loading, refreshData: fetchData }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

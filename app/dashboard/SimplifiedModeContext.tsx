'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface SimplifiedModeContextType {
    isSimplified: boolean;
    toggleSimplified: () => void;
}

const SimplifiedModeContext = createContext<SimplifiedModeContextType | undefined>(undefined);

export function SimplifiedModeProvider({ children }: { children: React.ReactNode }) {
    const [isSimplified, setIsSimplified] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('isSimplifiedMode');
        if (saved === 'true') setIsSimplified(true);
    }, []);

    const toggleSimplified = () => {
        const newValue = !isSimplified;
        setIsSimplified(newValue);
        localStorage.setItem('isSimplifiedMode', String(newValue));
    };

    return (
        <SimplifiedModeContext.Provider value={{ isSimplified, toggleSimplified }}>
            {children}
        </SimplifiedModeContext.Provider>
    );
}

export function useSimplifiedMode() {
    const context = useContext(SimplifiedModeContext);
    if (context === undefined) {
        throw new Error('useSimplifiedMode must be used within a SimplifiedModeProvider');
    }
    return context;
}

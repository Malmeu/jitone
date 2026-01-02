import React from 'react';
import {
    Box, Smartphone, Laptop, Tablet, Battery, Cpu, Zap, Monitor, Speaker,
    Camera, Usb, Wrench, Settings, Shield, HardDrive, Wifi, Cable
} from 'lucide-react';

export const AVAILABLE_ICONS = [
    { id: 'Box', icon: Box },
    { id: 'Smartphone', icon: Smartphone },
    { id: 'Laptop', icon: Laptop },
    { id: 'Tablet', icon: Tablet },
    { id: 'Battery', icon: Battery },
    { id: 'Cpu', icon: Cpu },
    { id: 'Screen', icon: Monitor },
    { id: 'Zap', icon: Zap },
    { id: 'Speaker', icon: Speaker },
    { id: 'Camera', icon: Camera },
    { id: 'Usb', icon: Usb },
    { id: 'Wrench', icon: Wrench },
    { id: 'Cable', icon: Cable },
    { id: 'HardDrive', icon: HardDrive },
    { id: 'Wifi', icon: Wifi },
    { id: 'Shield', icon: Shield },
    { id: 'Settings', icon: Settings },
];

export const IconRenderer = ({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) => {
    const IconComponent = AVAILABLE_ICONS.find(i => i.id === name)?.icon || Box;
    return <IconComponent size={size} className={className} />;
};

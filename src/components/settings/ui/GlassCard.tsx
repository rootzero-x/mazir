import type { ReactNode } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
    return (
        <div className={`glass-card overflow-hidden ${className}`}>
            {children}
        </div>
    );
}

export function DangerZoneCard({ children, className = "" }: GlassCardProps) {
    return (
        <div className={`bg-red-950/20 backdrop-blur-md border border-red-900/30 shadow-lg shadow-red-900/10 rounded-[16px] overflow-hidden ${className}`}>
            {children}
        </div>
    );
}

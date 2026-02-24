import { Shield, Zap, Crown, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PermissionLevel } from "@/lib/types";

interface LevelBadgeProps {
    level: PermissionLevel | string;
    className?: string;
    showIcon?: boolean;
}

export default function LevelBadge({ level, className, showIcon = true }: LevelBadgeProps) {
    const rawLevel = String(level).toUpperCase();
    const lvl = rawLevel.startsWith('L') ? rawLevel : `L${rawLevel}`;

    // Level styling mapping
    const getStyle = () => {
        switch (lvl) {
            case "L3":
                return {
                    container: "bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)] animate-pulse",
                    icon: Flame,
                    label: "ADMIN",
                    gradient: "from-orange-500 to-yellow-400"
                };
            case "L2":
                return {
                    container: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30 shadow-[0_0_12px_rgba(217,70,239,0.15)]",
                    icon: Crown,
                    label: "PRO",
                    gradient: "from-fuchsia-500 to-purple-500"
                };
            case "L1":
                return {
                    container: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]",
                    icon: Zap,
                    label: "ELITE",
                    gradient: "from-cyan-500 to-blue-500"
                };
            case "L0":
            default:
                return {
                    container: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
                    icon: Shield,
                    label: "MATE",
                    gradient: "from-emerald-400 to-teal-500"
                };
        }
    };

    const style = getStyle();
    const Icon = style.icon;

    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all duration-500",
            style.container,
            className
        )}>
            {showIcon && <Icon className="w-3.5 h-3.5" />}
            <span className="flex items-center gap-1">
                <span className={cn("bg-gradient-to-r bg-clip-text text-transparent opacity-80", style.gradient)}>
                    {style.label}
                </span>
                <span className="opacity-40">{lvl}</span>
            </span>
        </div>
    );
}

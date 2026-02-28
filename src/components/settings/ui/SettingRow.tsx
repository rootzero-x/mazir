import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface SettingRowProps {
    title: string;
    description?: string;
    control?: ReactNode;
    children?: ReactNode;
    verticalOnMobile?: boolean;
    className?: string;
}

export function SettingRow({ title, description, control, children, verticalOnMobile = false, className = "" }: SettingRowProps) {
    return (
        <div className={`p-5 sm:p-6 flex ${verticalOnMobile ? 'flex-col sm:flex-row sm:items-center sm:justify-between gap-4' : 'items-center justify-between gap-4'} ${className} group hover:bg-white/[0.02] transition-colors rounded-xl`}>
            <div className="space-y-1.5 flex-1 pr-4">
                <h3 className="text-[15px] font-medium text-slate-200 tracking-wide">{title}</h3>
                {description && <p className="text-sm text-slate-400/90 leading-relaxed font-light">{description}</p>}
                {children}
            </div>
            {control && (
                <div className={verticalOnMobile ? 'w-full sm:w-auto mt-2 sm:mt-0' : 'shrink-0'}>
                    {control}
                </div>
            )}
        </div>
    );
}

interface ActionRowProps extends Omit<SettingRowProps, "control"> {
    onClick: () => void;
    buttonText: string;
    icon?: ReactNode;
    isDanger?: boolean;
    disabled?: boolean;
}


export function ActionRow({ title, description, onClick, buttonText, icon, isDanger = false, disabled = false, verticalOnMobile, className }: ActionRowProps) {
    let btnClass = "rounded-xl font-medium transition-all duration-300 neon-focus relative overflow-hidden ";

    if (isDanger) {
        btnClass += "bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20 hover:border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]";
    } else {
        btnClass += "bg-violet-600/90 hover:bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-violet-500/50 backdrop-blur-md";
    }

    return (
        <SettingRow title={title} description={description} verticalOnMobile={verticalOnMobile} className={className} control={
            <Button onClick={onClick} disabled={disabled} className={btnClass} type="button">
                {icon && <span className="mr-2">{icon}</span>}
                <span className="relative z-10">{buttonText}</span>
            </Button>
        } />
    );
}

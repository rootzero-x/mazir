import type { ReactNode } from "react";

interface SectionTitleProps {
    title: string;
    description?: string;
    icon?: ReactNode;
}

export function SectionTitle({ title, description, icon }: SectionTitleProps) {
    return (
        <div className="mb-6 flex items-start gap-4">
            {icon && (
                <div className="p-3 rounded-2xl bg-slate-800/40 border border-white/5 text-violet-400 shadow-inner">
                    {icon}
                </div>
            )}
            <div>
                <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
                {description && <p className="text-[15px] text-slate-400 mt-1.5 leading-relaxed">{description}</p>}
            </div>
        </div>
    );
}

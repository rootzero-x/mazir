import { User, Shield, Bell, Zap, Globe, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function SettingsSidebar({ activeTab, onTabChange }: SidebarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const tabs = [
        { id: "account", label: "Account Details", icon: User },
        { id: "profile", label: "Public Profile", icon: Globe },
        { id: "security", label: "Security & Login", icon: Shield },
        { id: "preferences", label: "Preferences", icon: Bell },
        { id: "appearance", label: "Appearance", icon: Zap },
    ];

    return (
        <>
            {/* Mobile/Tablet View (Segmented/Dropdown style header) */}
            <div className="lg:hidden mb-8">
                <div className="glass-card p-2 flex items-center justify-between">
                    <span className="px-4 text-sm font-medium text-slate-300">
                        {tabs.find(t => t.id === activeTab)?.label}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-slate-400"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                {isMobileMenuOpen && (
                    <div className="glass-card mt-2 p-2 flex flex-col gap-1 absolute w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] z-40 shadow-2xl">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        onTabChange(tab.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${isActive
                                            ? "bg-violet-500/10 text-violet-400 font-medium"
                                            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="text-sm">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Desktop View (Sidebar) */}
            <div className="hidden lg:flex flex-col gap-2 w-64 shrink-0 shrink-0 sticky top-[calc(env(safe-area-inset-top,0px)+6rem)]">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 text-left border ${isActive
                                    ? "bg-violet-500/10 border-violet-500/20 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)] text-violet-300"
                                    : "bg-transparent border-transparent text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                                }`}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? "text-violet-400" : ""}`} />
                            <span className="font-medium tracking-wide text-[15px]">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </>
    );
}

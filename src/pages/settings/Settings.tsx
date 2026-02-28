import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccountSettings from "@/components/settings/AccountSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import PreferencesSettings from "@/components/settings/PreferencesSettings";
import ProfileSettings from "@/components/settings/ProfileSettings";
import { SettingsSidebar } from "@/components/settings/ui/SettingsSidebar";
import { GlassCard } from "@/components/settings/ui/GlassCard";
import { toast } from "react-hot-toast";

export default function Settings() {
    const { user, checkAuth, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [settingsData, setSettingsData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("account");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get("/auth/me");
                setSettingsData(data.user || data.data?.user || data);
            } catch (error) {
                console.error("Failed to load settings:", error);
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleUpdate = async () => {
        await checkAuth();
        const { data } = await api.get("/auth/me");
        setSettingsData(data.user || data.data?.user || data);
    };

    if (loading || !settingsData) {
        return (
            <div className="h-full flex items-center justify-center bg-[var(--bg-primary)]">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    const activeUser = { ...user, ...settingsData };

    return (
        <div className="h-full overflow-y-auto overflow-x-hidden w-full pb-20 md:pb-0 relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 sm:mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white neon-text-glow">Settings</h1>
                        <p className="text-slate-400 mt-2 font-light">Manage your account, profile, and preferences.</p>
                    </div>
                    <Button
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2 rounded-xl transition-all font-medium py-2 px-4 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                        onClick={logout}
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Log out</span>
                    </Button>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Sidebar */}
                    <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

                    {/* Content Area */}
                    <div className="flex-1 w-full min-w-0">
                        <GlassCard className="p-0 sm:p-2 bg-[var(--surface-glass)]/60">
                            {/* We wrap the content in a smooth transition container */}
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out">
                                {activeTab === "account" && <AccountSettings user={activeUser} onUpdate={handleUpdate} />}
                                {activeTab === "profile" && <ProfileSettings user={activeUser} onUpdate={handleUpdate} />}
                                {activeTab === "security" && <SecuritySettings />}
                                {activeTab === "preferences" && <PreferencesSettings />}
                                {activeTab === "appearance" && (
                                    <div className="p-8 text-center text-slate-400 font-light">
                                        <p>Appearance settings are managed under App Preferences.</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>

                <div className="text-center text-xs text-slate-600/80 font-light pt-12 pb-4 tracking-wider">
                    MAZIR APPLICATION • V1.0.0
                </div>
            </div>
        </div>
    );
}

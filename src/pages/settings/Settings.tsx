import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccountSettings from "@/components/settings/AccountSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import PreferencesSettings from "@/components/settings/PreferencesSettings";
import { toast } from "react-hot-toast";

export default function Settings() {
    const { user, checkAuth, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [settingsData, setSettingsData] = useState<any>(null); // Full settings object from API if needed

    // Fetch initial settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // We can use the user object from auth context for most things, 
                // but fetching fresh data ensures we have the latest (e.g. cooldowns)
                const { data } = await api.get("/auth/me"); // Or /api/settings if it exists
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
        // Refresh auth context to reflect changes
        await checkAuth();
        // Also re-fetch local settings data
        const { data } = await api.get("/auth/me");
        setSettingsData(data.user || data.data?.user || data);
    };

    if (loading || !settingsData) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    // Merge auth user with fetched settings data for best of both worlds
    const activeUser = { ...user, ...settingsData };

    return (
        <div className="h-full overflow-y-auto bg-slate-950 pb-20 md:pb-0 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            <div className="max-w-4xl mx-auto space-y-8 pb-8 md:p-8">
                <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md pt-[calc(env(safe-area-inset-top,0px)+2rem)] pb-4 px-4 -mx-4 mb-8">
                    <div className="flex items-center justify-between px-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
                            <p className="text-slate-400 mt-1">Manage your account, profile, and preferences.</p>
                        </div>
                        <Button
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2"
                            onClick={logout}
                        >
                            <LogOut className="h-4 w-4" />
                            Log out
                        </Button>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Account Section */}
                    <AccountSettings user={activeUser} onUpdate={handleUpdate} />

                    {/* Security Section */}
                    <SecuritySettings />

                    {/* Preferences Section */}
                    <PreferencesSettings />
                </div>

                <div className="text-center text-xs text-slate-600 pt-8 pb-4">
                    Mazir Application v1.0.0
                </div>
            </div>
        </div>
    );
}

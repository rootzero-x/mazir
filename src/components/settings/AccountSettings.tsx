import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { User, Mail } from "lucide-react";
import type { User as UserType } from "@/lib/types";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { SectionTitle } from "./ui/SectionTitle";
import { SettingRow, ActionRow } from "./ui/SettingRow";
import { Button } from "@/components/ui/button";

interface AccountSettingsProps {
    user: UserType;
    onUpdate: () => void;
}

export default function AccountSettings({ user, onUpdate }: AccountSettingsProps) {
    // --- Username State ---
    const [username, setUsername] = useState(user.username);
    const [updatingUsername, setUpdatingUsername] = useState(false);

    // Sync state if user prop updates
    useEffect(() => {
        setUsername(user.username);
    }, [user]);

    // --- Handlers ---
    const handleUpdateUsername = async () => {
        if (username === user.username) return;

        setUpdatingUsername(true);
        try {
            await api.patch("/users/me", { username });
            toast.success("Username updated successfully");
            onUpdate();
        } catch (error: any) {
            console.error("Username update failed:", error);
            toast.error(error.response?.data?.message || "Failed to update username");
            setUsername(user.username); // Revert on failure
        } finally {
            setUpdatingUsername(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 pb-8">
            <SectionTitle
                title="Account Settings"
                description="Manage your primary account identifiers and linked credentials."
                icon={<User className="h-6 w-6" />}
            />

            <div className="space-y-6 mt-8">
                {/* --- Username Row --- */}
                <div className="panel-container border border-white/5 bg-slate-900/20 rounded-2xl overflow-hidden shadow-inner">
                    <SettingRow
                        title="Username"
                        description="Unique identifier for your profile. This will be publicly visible."
                        verticalOnMobile
                        control={
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <Input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="bg-slate-950/60 border-slate-700/50 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 w-full rounded-xl transition-all shadow-inner"
                                    placeholder="username"
                                />
                                <Button
                                    onClick={handleUpdateUsername}
                                    disabled={updatingUsername || username === user.username}
                                    className="bg-violet-600/90 hover:bg-violet-500 text-white rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-violet-500/50 transition-all"
                                >
                                    {updatingUsername ? "Saving..." : "Update"}
                                </Button>
                            </div>
                        }
                    />
                </div>

                {/* --- Email Row (Read Only) --- */}
                <div className="panel-container border border-white/5 bg-slate-900/20 rounded-2xl overflow-hidden shadow-inner">
                    <SettingRow
                        title="Email Address"
                        description={`Primary email: ${user.email}`}
                        verticalOnMobile
                        control={
                            <Button variant="outline" className="w-full sm:w-auto rounded-xl bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 border border-slate-700" onClick={() => toast("Email change coming soon!", { icon: "🚧" })}>
                                <Mail className="h-4 w-4 mr-2 text-slate-400" />
                                Change Email
                            </Button>
                        }
                    />
                </div>

                {/* --- Danger Zone Demo --- */}
                <div className="mt-12">
                    <h4 className="text-sm font-medium text-red-400 uppercase tracking-widest px-2 mb-4">Danger Zone</h4>
                    <div className="panel-container border border-red-900/30 bg-red-950/10 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                        <ActionRow
                            title="Delete Account"
                            description="Permanently delete your account and remove all data from our servers. This action is irreversible."
                            buttonText="Delete Account"
                            onClick={() => toast.error("Account deletion requires confirmation (coming soon)")}
                            isDanger
                            verticalOnMobile
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

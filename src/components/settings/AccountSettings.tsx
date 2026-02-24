import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, RefreshCw } from "lucide-react";
import type { User as UserType } from "@/lib/types";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

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
            await api.put("/users/me", { username });
            toast.success("Username updated successfully");
            onUpdate();
        } catch (error: any) {
            console.error("Username update failed:", error);
            toast.error(error.response?.data?.message || "Failed to update username");
        } finally {
            setUpdatingUsername(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <User className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-white">Account Settings</h2>
            </div>

            <div className="grid gap-6 ">
                {/* --- Username Card --- */}
                <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold text-white">Username</h3>
                            <p className="text-xs text-slate-500">Unique identifier for your profile URL.</p>
                        </div>

                        <div className="space-y-2">
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-slate-950/50 border-slate-800 w-full"
                                placeholder="username"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                            onClick={handleUpdateUsername}
                            disabled={updatingUsername || username === user.username}
                            className="bg-slate-800 hover:bg-slate-700 text-white w-full sm:w-auto"
                            size="sm"
                        >
                            {updatingUsername ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Update Username
                        </Button>
                    </div>
                </section>


            </div>

            {/* --- Email Section (Read Only) --- */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-slate-300">Email Address</h3>
                    <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast("Email change coming soon!", { icon: "🚧" })}>
                    Change Email
                </Button>
            </section>
        </div>
    );
}


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { SectionTitle } from "./ui/SectionTitle";

export default function SecuritySettings() {
    const { logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    // Auto-logout state
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    // Handle countdown and logout
    useEffect(() => {
        let interval: any;
        if (showLogoutAlert && countdown > 0) {
            interval = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (showLogoutAlert && countdown === 0) {
            logout();
        }
        return () => clearInterval(interval);
    }, [showLogoutAlert, countdown, logout]);

    const handleSave = async () => {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            toast.error("Please fill in all password fields");
            return;
        }

        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match");
            return;
        }

        if (passwords.new.length < 6) {
            toast.error("New password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            const response = await api.patch("/users/me/password", {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });

            if (response.data && response.data.ok) {
                // Trigger auto-logout flow
                setPasswords({ current: "", new: "", confirm: "" });
                setShowLogoutAlert(true);
            } else {
                toast.error("Failed to update password");
            }

        } catch (error: any) {
            console.error("Password update failed:", error);
            toast.error(error.response?.data?.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 pb-8 relative">
            {/* Full Screen Auto-Logout Alert */}
            {showLogoutAlert && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617]/95 backdrop-blur-xl p-4 text-center animate-in fade-in duration-300">
                    <div className="bg-[#0f172a]/80 border border-violet-500/30 p-10 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(139,92,246,0.15)] space-y-8 relative overflow-hidden">
                        {/* Neon top accent */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-70"></div>

                        <div className="mx-auto w-20 h-20 bg-violet-500/10 rounded-full flex items-center justify-center ring-1 ring-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                            <Shield className="w-10 h-10 text-violet-400" />
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold text-white neon-text-glow">Secured!</h2>
                            <p className="text-slate-400 font-light leading-relaxed">
                                Your password has been successfully updated. For your safety, we are logging you out on all devices.
                            </p>
                        </div>

                        <div className="text-6xl font-mono font-bold text-violet-400 neon-text-glow">
                            {countdown}
                        </div>

                        <p className="text-[13px] text-slate-500 uppercase tracking-widest">
                            Redirecting to login...
                        </p>
                    </div>
                </div>
            )}

            <SectionTitle
                title="Security & Login"
                description="Keep your account secure by using a strong password."
                icon={<Shield className="h-6 w-6" />}
            />

            <div className="mt-8 panel-container border border-white/5 bg-slate-900/20 rounded-2xl overflow-hidden shadow-inner p-5 sm:p-6 max-w-2xl">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[13px] font-medium text-slate-400 uppercase tracking-widest pl-1">Current Password</label>
                        <Input
                            type="password"
                            name="current"
                            value={passwords.current}
                            onChange={handleChange}
                            className="bg-slate-950/60 border-slate-700/50 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 rounded-xl transition-all shadow-inner h-11"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-medium text-slate-400 uppercase tracking-widest pl-1">New Password</label>
                        <Input
                            type="password"
                            name="new"
                            value={passwords.new}
                            onChange={handleChange}
                            className="bg-slate-950/60 border-slate-700/50 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 rounded-xl transition-all shadow-inner h-11"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-medium text-slate-400 uppercase tracking-widest pl-1">Confirm New Password</label>
                        <Input
                            type="password"
                            name="confirm"
                            value={passwords.confirm}
                            onChange={handleChange}
                            className="bg-slate-950/60 border-slate-700/50 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 rounded-xl transition-all shadow-inner h-11"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={loading || showLogoutAlert}
                            className="bg-violet-600/90 hover:bg-violet-500 text-white rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-violet-500/50 transition-all font-medium py-2 px-6 w-full sm:w-auto"
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

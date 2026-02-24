import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

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
            toast.error("Please fill all fields");
            return;
        }

        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match");
            return;
        }

        if (passwords.new.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("/auth/change-password", {
                current_password: passwords.current,
                new_password: passwords.new
            });

            if (response.data && response.data.ok) {
                // Trigger auto-logout flow
                setPasswords({ current: "", new: "", confirm: "" });
                setShowLogoutAlert(true);
            } else {
                toast.error(response.data?.message || "Failed to update password");
            }

        } catch (error: any) {
            console.error("Password update failed:", error);
            toast.error(error.response?.data?.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6 relative">
            {/* Full Screen Auto-Logout Alert */}
            {showLogoutAlert && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4 text-center animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-6">
                        <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                            <Shield className="w-8 h-8 text-green-500" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Password Changed!</h2>
                            <p className="text-slate-400">
                                Your password has been successfully updated. For security reasons, you will be logged out in:
                            </p>
                        </div>

                        <div className="text-5xl font-mono font-bold text-blue-500">
                            {countdown}
                        </div>

                        <p className="text-sm text-slate-500">
                            Redirecting to login page...
                        </p>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                    <Shield className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-white">Security</h2>
            </div>

            <div className="space-y-4 max-w-lg">
                {/* Inputs ... */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Current Password</label>
                    <Input
                        type="password"
                        name="current"
                        value={passwords.current}
                        onChange={handleChange}
                        className="bg-slate-950/50 border-slate-800"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">New Password</label>
                    <Input
                        type="password"
                        name="new"
                        value={passwords.new}
                        onChange={handleChange}
                        className="bg-slate-950/50 border-slate-800"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Confirm New Password</label>
                    <Input
                        type="password"
                        name="confirm"
                        value={passwords.confirm}
                        onChange={handleChange}
                        className="bg-slate-950/50 border-slate-800"
                    />
                </div>

                <div className="pt-2">
                    <Button
                        onClick={handleSave}
                        disabled={loading || showLogoutAlert}
                        className="bg-slate-800 hover:bg-slate-700 text-white w-full sm:w-auto"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </Button>
                </div>
            </div>
        </section>
    );
}

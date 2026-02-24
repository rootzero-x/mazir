import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        if (!token) {
            toast.error("Invalid or expired reset link");
            return;
        }
        setLoading(true);
        try {
            await api.post("/auth/reset-password", {
                token,
                password: formData.password,
            });
            toast.success("Password reset successfully!");
            navigate("/auth/login");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-8 rounded-2xl bg-slate-900/50 p-8 border border-slate-800 backdrop-blur-xl">
            {/* Icon */}
            <div className="text-center space-y-2">
                <div className="mx-auto h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        <path d="m9 12 2 2 4-4" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Set new password</h2>
                <p className="text-sm text-slate-400">
                    Make sure it's at least 8 characters
                </p>
            </div>

            {!token ? (
                <div className="space-y-4">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">
                        Invalid or expired reset link. Please request a new one.
                    </div>
                    <Button asChild variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                        <Link to="/auth/forgot-password">Request Reset Link</Link>
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">New Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="bg-slate-950 border-slate-800 focus-visible:ring-blue-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Confirm Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                className="bg-slate-950 border-slate-800 focus-visible:ring-blue-600"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500"
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </Button>

                    <div className="text-center text-sm text-slate-400">
                        <Link to="/auth/login" className="font-medium text-slate-400 hover:text-white">
                            Back to Login
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}

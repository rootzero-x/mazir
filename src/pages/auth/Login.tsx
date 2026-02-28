import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { navigateByNext } from "@/lib/navigation";

export default function Login() {
    const { login, checkAuth } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(formData);

            // Critical: Refresh auth state to get 'next' field
            const user = await checkAuth();

            console.log("[Login] Auth refreshed:", { user: user?.username, next: user?.next });

            // Strict backend-driven navigation
            // If backend says "onboarding_setup", we go there.
            // If backend says "feed" or null, we go to feed.
            const nextRoute = navigateByNext(user?.next);

            console.log("[Login] Navigating to:", nextRoute);
            navigate(nextRoute, { replace: true });

        } catch (error: any) {
            console.error(error);
            // Manual error handling since global interceptor silences 401
            toast.error(error.response?.data?.message || "Invalid email or password");

            if (error?.response?.data?.requiresVerification) {
                navigate("/auth/verify-device");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-8 rounded-[2rem] bg-slate-900/40 p-8 md:p-10 border border-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative z-10">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">Welcome back</h2>
                <p className="mt-2 text-[15px] font-light text-slate-400">
                    Enter your credentials to access your account
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
                    <div className="space-y-2.5">
                        <label className="text-sm font-medium text-slate-200">Email</label>
                        <Input
                            type="email"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="bg-slate-950/50 border-white/5 text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-violet-500/50 focus:border-violet-500/50 h-12 rounded-xl transition-all"
                        />
                    </div>
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-200">Password</label>
                            <Link to="/auth/forgot-password" className="text-xs text-violet-400 hover:text-violet-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.3)] transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            className="bg-slate-950/50 border-white/5 text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-violet-500/50 focus:border-violet-500/50 h-12 rounded-xl transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <Checkbox label="Remember me" defaultChecked />
                </div>

                <Button type="submit" className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border-0 rounded-xl transition-all transform hover:-translate-y-0.5" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                </Button>

                <div className="text-center text-sm text-slate-400 pt-2">
                    Don't have an account?{" "}
                    <Link to="/auth/register" className="font-medium text-violet-400 hover:text-violet-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.3)] transition-colors">
                        Create account
                    </Link>
                </div>
            </form>
        </div>
    );
}

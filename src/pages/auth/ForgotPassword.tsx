import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Please enter your email address");
            return;
        }
        setLoading(true);
        try {
            await api.post("/auth/forgot-password", { email });
            setSent(true);
            toast.success("Reset link sent! Check your inbox.");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send reset link");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-8 rounded-[2rem] bg-slate-900/40 p-8 md:p-10 border border-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative z-10">
            {/* Icon */}
            <div className="text-center space-y-2">
                <div className="mx-auto h-14 w-14 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-5 ring-1 ring-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">Forgot password?</h2>
                <p className="text-[15px] font-light text-slate-400">
                    Enter your email and we'll send you a reset link
                </p>
            </div>

            {sent ? (
                <div className="space-y-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm text-center shadow-[0_0_15px_rgba(16,185,129,0.15)] flex flex-col items-center justify-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center ring-1 ring-emerald-500/50 shadow-inner">
                            <svg className="w-5 h-5 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                            Check your inbox — reset link has been sent to <span className="font-bold text-emerald-300 block mt-1">{email}</span>
                        </div>
                    </div>
                    <Button asChild variant="outline" className="w-full h-12 border-white/10 bg-slate-950/50 text-slate-300 hover:text-white hover:border-violet-500/50 hover:bg-violet-600/20 transition-all rounded-xl shadow-inner">
                        <Link to="/auth/login">Back to Login</Link>
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2.5">
                        <label className="text-sm font-medium text-slate-200">Email address</label>
                        <Input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-slate-950/50 border-white/5 text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-violet-500/50 focus:border-violet-500/50 h-12 rounded-xl transition-all"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border-0 rounded-xl transition-all transform hover:-translate-y-0.5"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </Button>

                    <div className="text-center text-sm text-slate-400 pt-2">
                        Remember your password?{" "}
                        <Link to="/auth/login" className="font-medium text-violet-400 hover:text-violet-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.3)] transition-colors">
                            Sign in
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}

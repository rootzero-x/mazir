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
        <div className="w-full space-y-8 rounded-2xl bg-slate-900/50 p-8 border border-slate-800 backdrop-blur-xl">
            {/* Icon */}
            <div className="text-center space-y-2">
                <div className="mx-auto h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Forgot password?</h2>
                <p className="text-sm text-slate-400">
                    Enter your email and we'll send you a reset link
                </p>
            </div>

            {sent ? (
                <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm text-center">
                        ✓ Check your inbox — reset link has been sent to <span className="font-medium text-green-300">{email}</span>
                    </div>
                    <Button asChild variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                        <Link to="/auth/login">Back to Login</Link>
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Email address</label>
                        <Input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-slate-950 border-slate-800 focus-visible:ring-blue-600"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </Button>

                    <div className="text-center text-sm text-slate-400">
                        Remember your password?{" "}
                        <Link to="/auth/login" className="font-medium text-blue-400 hover:text-blue-300">
                            Sign in
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}

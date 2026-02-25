import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthStepper from "@/components/auth/AuthStepper";
import toast from "react-hot-toast";
import { navigateByNext } from "@/lib/navigation";
import api from "@/lib/api";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [verifyingInvite, setVerifyingInvite] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = inviteCode.trim().toUpperCase();

        if (code.length < 4) {
            toast.error("Invite code must be at least 4 characters");
            return;
        }

        setVerifyingInvite(true);
        try {
            // BACKEND REQUEST: verify-invite
            const res = await api.post("/auth/verify-invite", { code });
            const data = res.data;

            if (data?.status === "success" || data?.data?.valid) {
                toast.success("Access Granted! Welcome to Mazir.");
                setStep(2);
            } else {
                toast.error(data?.message || "Invalid or expired invite code");
            }
        } catch (error: any) {
            console.error("Invite verification failed:", error);
            toast.error(error.response?.data?.message || "Invalid invite code. Please try again.");
        } finally {
            setVerifyingInvite(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const response = await register({ ...formData, inviteCode });

            // Normalize response
            const normalized = response;

            // Extract next
            let next = normalized?.next || normalized?.data?.next || normalized?.data?.data?.next;

            // DEFAULT to verify_email for register flow
            if (!next) {
                next = "verify_email";
            }

            // Store email and navigate
            sessionStorage.setItem("pending_verify_email", formData.email);
            toast.success("Account created successfully!");
            navigate(navigateByNext(next, formData.email));

        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-8 rounded-2xl bg-slate-900/40 p-6 md:p-8 border border-slate-800/60 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/20 transition-all duration-700" />

            <AuthStepper currentStep={step === 1 ? 1 : 2} />

            <div className="text-center relative z-10">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 mb-4 ring-1 ring-blue-500/20">
                    {step === 1 ? (
                        <ShieldCheck className="h-6 w-6 text-blue-500" />
                    ) : (
                        <Loader2 className={loading ? "h-6 w-6 text-blue-500 animate-spin" : "h-6 w-6 text-blue-500"} />
                    )}
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                    {step === 1 ? "Access Gate" : "Create Account"}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                    {step === 1
                        ? "MAZIR is currently invite-only."
                        : "Join the elite knowledge network."}
                </p>
            </div>

            {step === 1 ? (
                <form onSubmit={handleInviteSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-300">Invite Code</label>
                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter bg-blue-500/10 px-2 py-0.5 rounded">Required</span>
                        </div>
                        <Input
                            placeholder="MAZIR-XXXX-XXXX"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            required
                            disabled={verifyingInvite}
                            className="bg-slate-950/50 border-slate-800 text-center uppercase tracking-[0.2em] font-mono h-14 text-lg focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={verifyingInvite || !inviteCode}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 group/btn"
                    >
                        {verifyingInvite ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                    <div className="text-center text-xs text-slate-500">
                        Don't have a code? <Link to="/auth/request-access" className="text-blue-400 hover:underline">Request access</Link>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleRegister} className="space-y-6 relative z-10">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Username</label>
                            <Input
                                placeholder="rootzero"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                className="bg-slate-950/50 border-slate-800 focus:ring-blue-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email Address</label>
                            <Input
                                type="email"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="bg-slate-950/50 border-slate-800 focus:ring-blue-500/50"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="bg-slate-950/50 border-slate-800 focus:ring-blue-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                                <Input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                    className="bg-slate-950/50 border-slate-800 focus:ring-blue-500/50"
                                />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-500 font-bold shadow-lg shadow-blue-500/20" disabled={loading}>
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizing Account...</>
                        ) : (
                            "Complete Registration"
                        )}
                    </Button>

                    <div className="text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <Link to="/auth/login" className="font-medium text-blue-400 hover:text-blue-300">
                            Sign in instead
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
    const location = useLocation();
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

    // Auto-fill invite code if passed from RequestAccess
    useEffect(() => {
        const state = location.state as { code?: string };
        if (state?.code) {
            setInviteCode(state.code);
            toast.success("Invite code auto-filled!", { icon: "✨" });
        }
    }, [location.state]);

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

            // EXTREMELY ROBUST CHECK: status="success" OR data.success=true OR data.valid=true
            const isSuccess = data?.status === "success" ||
                data?.success === true ||
                data?.data?.success === true ||
                data?.data?.valid === true;

            if (isSuccess) {
                toast.success("Access Granted! Welcome to Mazir.");
                setStep(2);
            } else {
                toast.error(data?.message || data?.data?.message || "Invalid or expired invite code");
            }
        } catch (error: any) {
            console.error("Invite verification failed:", error);
            const errMsg = error.response?.data?.message || error.response?.data?.data?.message || "Invalid invite code. Please try again.";
            toast.error(errMsg);
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
        <div className="w-full space-y-8 rounded-[2rem] bg-slate-900/40 p-8 md:p-10 border border-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-600/20 transition-all duration-700" />

            <AuthStepper currentStep={step === 1 ? 1 : 2} />

            <div className="text-center relative z-10">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/10 mb-5 ring-1 ring-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                    {step === 1 ? (
                        <ShieldCheck className="h-7 w-7 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                    ) : (
                        <Loader2 className={loading ? "h-7 w-7 text-violet-400 animate-spin drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" : "h-7 w-7 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]"} />
                    )}
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                    {step === 1 ? "Access Gate" : "Create Account"}
                </h2>
                <p className="mt-2 text-[15px] font-light text-slate-400">
                    {step === 1
                        ? "MAZIR is currently invite-only."
                        : "Join the elite knowledge network."}
                </p>
            </div>

            {step === 1 ? (
                <form onSubmit={handleInviteSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-200">Invite Code</label>
                            <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20 shadow-[0_0_8px_rgba(139,92,246,0.2)]">Required</span>
                        </div>
                        <Input
                            placeholder="MAZIR-XXXX-XXXX"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            required
                            disabled={verifyingInvite}
                            className="bg-slate-950/50 border-white/5 text-center uppercase tracking-[0.2em] font-mono h-14 text-lg focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 rounded-xl transition-all shadow-inner text-white"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={verifyingInvite || !inviteCode}
                        className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border-0 rounded-xl transition-all transform hover:-translate-y-0.5 group/btn"
                    >
                        {verifyingInvite ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                    <div className="text-center text-xs text-slate-400 pt-2">
                        Don't have a code? <Link to="/auth/request-access" className="text-violet-400 hover:text-violet-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.3)] hover:underline transition-colors">Request access</Link>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleRegister} className="space-y-6 relative z-10">
                    <div className="space-y-5">
                        <div className="space-y-2.5">
                            <label className="text-sm font-medium text-slate-200">Username</label>
                            <Input
                                placeholder="rootzero"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                className="bg-slate-950/50 border-white/5 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 h-12 rounded-xl transition-all"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-sm font-medium text-slate-200">Email Address</label>
                            <Input
                                type="email"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="bg-slate-950/50 border-white/5 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 h-12 rounded-xl transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2.5">
                                <label className="text-sm font-medium text-slate-200">Password</label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="bg-slate-950/50 border-white/5 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 h-12 rounded-xl transition-all"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-sm font-medium text-slate-200">Confirm Password</label>
                                <Input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                    className="bg-slate-950/50 border-white/5 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 h-12 rounded-xl transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border-0 rounded-xl transition-all transform hover:-translate-y-0.5" disabled={loading}>
                        {loading ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Finalizing Account...</>
                        ) : (
                            "Complete Registration"
                        )}
                    </Button>

                    <div className="text-center text-sm text-slate-400 pt-2">
                        Already have an account?{" "}
                        <Link to="/auth/login" className="font-medium text-violet-400 hover:text-violet-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.3)] transition-colors">
                            Sign in instead
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}

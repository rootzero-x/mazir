import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, Mail, KeyRound, Copy, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function RequestAccess() {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [generatedInviteCode, setGeneratedInviteCode] = useState("");
    const [copied, setCopied] = useState(false);

    const handleRequestEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // BACKEND REQUEST: request-access
            await api.post("/auth/request-access", { email });
            toast.success("Verification code sent to your email!");
            setStep(2);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // BACKEND REQUEST: verify-request-code
            const res = await api.post("/auth/verify-request-code", { email, code: verificationCode });
            const data = res.data;

            // Handle both { invite_code: "..." } and { data: { invite_code: "..." } }
            const inviteCode = data?.invite_code || data?.data?.invite_code;

            if (inviteCode) {
                setGeneratedInviteCode(inviteCode);
                setStep(3);
                toast.success("Identity verified! Here is your invite code.");
            } else {
                toast.error("Invalid verification code.");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedInviteCode);
        setCopied(true);
        toast.success("Code copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full space-y-8 rounded-[2rem] bg-slate-900/40 p-8 md:p-10 border border-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-600/20 transition-all duration-700" />

            <div className="text-center relative z-10 space-y-2">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/10 mb-5 ring-1 ring-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                    {step === 1 ? <Mail className="h-7 w-7 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" /> :
                        step === 2 ? <KeyRound className="h-7 w-7 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" /> :
                            <CheckCircle2 className="h-7 w-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />}
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                    {step === 1 ? "Request Access" : step === 2 ? "Verify Identity" : "Access Granted"}
                </h2>
                <p className="mt-2 text-[15px] font-light text-slate-400">
                    {step === 1 ? "Enter your email to receive an invite code." :
                        step === 2 ? `We've sent a 6-digit code to ${email}` :
                            "Your exclusive invite code is ready."}
                </p>
            </div>

            {step === 1 && (
                <form onSubmit={handleRequestEmail} className="space-y-6 relative z-10">
                    <div className="space-y-2.5">
                        <label className="text-sm font-medium text-slate-200">Email Address</label>
                        <Input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-slate-950/50 border-white/5 text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-violet-500/50 focus:border-violet-500/50 h-12 rounded-xl transition-all shadow-inner"
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border-0 rounded-xl transition-all transform hover:-translate-y-0.5">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Verification Code"}
                    </Button>
                    <div className="text-center pt-2">
                        <Link to="/auth/register" className="text-sm font-medium text-violet-400 hover:text-violet-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.3)] transition-colors">
                            Back to Access Gate
                        </Link>
                    </div>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-6 relative z-10">
                    <div className="space-y-2.5">
                        <label className="text-sm font-medium text-slate-200">Verification Code</label>
                        <Input
                            placeholder="000000"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            required
                            maxLength={6}
                            className="bg-slate-950/50 border-white/5 text-center text-xl tracking-[0.5em] font-mono h-14 focus-visible:ring-1 focus-visible:ring-violet-500/50 focus:border-violet-500/50 rounded-xl transition-all shadow-inner text-white"
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border-0 rounded-xl transition-all transform hover:-translate-y-0.5">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Get Code"}
                    </Button>
                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-sm font-medium text-violet-400 hover:text-violet-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.3)] transition-colors"
                        >
                            Change email address
                        </button>
                    </div>
                </form>
            )}

            {step === 3 && (
                <div className="space-y-8 relative z-10 text-center">
                    <div className="p-6 md:p-8 bg-slate-950/60 border border-white/5 rounded-[1.5rem] shadow-inner space-y-4">
                        <p className="text-xs uppercase tracking-widest text-violet-400 font-bold drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]">Your Invite Code</p>
                        <div className="flex items-center justify-center gap-2">
                            <code className="text-3xl font-mono font-bold text-white tracking-[0.2em] drop-shadow-md">
                                {generatedInviteCode}
                            </code>
                            <button
                                onClick={copyToClipboard}
                                className="p-2.5 rounded-xl transition-all border border-white/5 bg-slate-900/50 text-slate-400 hover:text-white hover:bg-violet-600/20 hover:border-violet-500/50 active:scale-95 shadow-sm"
                            >
                                {copied ? <CheckCircle2 className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" /> : <Copy className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        onClick={() => navigate("/auth/register", { state: { code: generatedInviteCode } })}
                        className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border-0 rounded-xl transition-all transform hover:-translate-y-0.5 group/btn"
                    >
                        Continue to Register
                        <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>

                    <p className="text-xs font-light text-slate-500">
                        This code is unique to your email address and can only be used once.
                    </p>
                </div>
            )}
        </div>
    );
}

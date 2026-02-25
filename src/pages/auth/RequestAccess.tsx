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
        <div className="w-full space-y-8 rounded-2xl bg-slate-900/40 p-6 md:p-8 border border-slate-800/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center relative z-10">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 mb-4 ring-1 ring-blue-500/20">
                    {step === 1 ? <Mail className="h-6 w-6 text-blue-500" /> :
                        step === 2 ? <KeyRound className="h-6 w-6 text-blue-500" /> :
                            <CheckCircle2 className="h-6 w-6 text-green-500" />}
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                    {step === 1 ? "Request Access" : step === 2 ? "Verify Identity" : "Access Granted"}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                    {step === 1 ? "Enter your email to receive an invite code." :
                        step === 2 ? `We've sent a 6-digit code to ${email}` :
                            "Your exclusive invite code is ready."}
                </p>
            </div>

            {step === 1 && (
                <form onSubmit={handleRequestEmail} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Email Address</label>
                        <Input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-slate-950/50 border-slate-800 h-12"
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-12 bg-blue-600 hover:bg-blue-500 font-bold">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Verification Code"}
                    </Button>
                    <div className="text-center">
                        <Link to="/auth/register" className="text-xs text-slate-500 hover:text-white transition-colors">
                            Back to Access Gate
                        </Link>
                    </div>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Verification Code</label>
                        <Input
                            placeholder="000000"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            required
                            maxLength={6}
                            className="bg-slate-950/50 border-slate-800 text-center text-xl tracking-[0.5em] font-mono h-14"
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-12 bg-blue-600 hover:bg-blue-500 font-bold">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Get Code"}
                    </Button>
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full text-xs text-slate-500 hover:text-white transition-colors"
                    >
                        Change email address
                    </button>
                </form>
            )}

            {step === 3 && (
                <div className="space-y-6 relative z-10 text-center">
                    <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Your Invite Code</p>
                        <div className="flex items-center justify-center gap-2">
                            <code className="text-2xl font-mono font-bold text-blue-400 tracking-wider">
                                {generatedInviteCode}
                            </code>
                            <button
                                onClick={copyToClipboard}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                            >
                                {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        onClick={() => navigate("/auth/register", { state: { code: generatedInviteCode } })}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-500 font-bold group"
                    >
                        Continue to Register
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <p className="text-[10px] text-slate-600">
                        This code is unique to your email address and can only be used once.
                    </p>
                </div>
            )}
        </div>
    );
}

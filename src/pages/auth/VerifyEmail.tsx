import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthStepper from "@/components/auth/AuthStepper";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { tokenStorage } from "@/lib/tokenStorage";
import { navigateByNext } from "@/lib/navigation";

export default function VerifyEmail() {
    const navigate = useNavigate();
    const location = useLocation();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        // Try to get email from location state or sessionStorage
        const emailFromState = location.state && typeof location.state === 'object' && 'email' in location.state
            ? (location.state as { email: string }).email
            : null;
        const emailFromStorage = sessionStorage.getItem("pending_verify_email") || sessionStorage.getItem("verify_email");
        const foundEmail = emailFromState || emailFromStorage;

        if (!foundEmail) {
            toast.error("No email found. Please register again.");
            navigate("/auth/register");
        } else {
            setEmail(foundEmail);
        }
    }, [navigate, location]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((t) => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 6) {
            toast.error("Please enter a valid 6-digit code");
            return;
        }
        setLoading(true);

        try {
            const { data } = await api.post("/auth/verify-email", { email, code });

            // Extract token from response if present
            const token = data?.token || data?.data?.token;
            if (token) {
                console.log("[VerifyEmail] Token received, storing...");
                tokenStorage.set(token);
            }

            // Extract next from various possible locations
            let next = data?.next || data?.data?.next || data?.data?.data?.next;

            // CRITICAL: For verify email flow, if next is missing, DEFAULT to onboarding_setup
            // Verify email success ALWAYS goes to onboarding
            if (!next) {
                console.warn("Verify email response missing 'next' field, defaulting to onboarding_setup:", data);
                next = "onboarding_setup";
            }

            // Clear email storage and navigate
            toast.success("Email verified!");
            sessionStorage.removeItem("verify_email");
            sessionStorage.removeItem("pending_verify_email");
            navigate(navigateByNext(next));

        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-8 rounded-2xl bg-slate-900/50 p-8 border border-slate-800 backdrop-blur-xl text-center">
            <AuthStepper currentStep={3} />

            <div className="space-y-2">
                <div className="mx-auto h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Check your email</h2>
                <p className="text-sm text-slate-400">
                    We sent a verification code to {email}. Enter it below.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-3xl tracking-[1em] font-mono h-16 bg-slate-950 border-slate-800"
                    maxLength={6}
                />

                <Button type="submit" className="w-full h-12" disabled={loading}>
                    {loading ? "Verifying..." : "Verify Email"}
                </Button>
            </form>

            <div className="text-sm text-slate-400">
                Didn't receive code?{" "}
                {timer > 0 ? (
                    <span className="text-slate-600">Resend in {timer}s</span>
                ) : (
                    <button
                        disabled={resendLoading}
                        onClick={async () => {
                            if (!email) return;
                            setResendLoading(true);
                            try {
                                await api.post("/auth/resend-verification", { email });
                                toast.success("Verification code sent!");
                                setTimer(60);
                            } catch (error: any) {
                                toast.error(error.response?.data?.message || "Failed to resend code");
                            } finally {
                                setResendLoading(false);
                            }
                        }}
                        className="text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {resendLoading ? "Sending..." : "Resend"}
                    </button>
                )}
            </div>
        </div>
    );
}

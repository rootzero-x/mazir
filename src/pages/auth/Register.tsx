import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthStepper from "@/components/auth/AuthStepper";
import toast from "react-hot-toast";
import { navigateByNext } from "@/lib/navigation";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleInviteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inviteCode.length < 4) {
            toast.error("Invalid invite code");
            return;
        }
        // TODO: Verify invite code with backend
        setStep(2);
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

            // Normalize response to handle double-wrapping
            const normalized = response; // Already normalized by api.ts interceptor

            // Extract next from various possible locations
            let next = normalized?.next || normalized?.data?.next || normalized?.data?.data?.next;

            // CRITICAL: For register flow, if next is missing, DEFAULT to verify_email
            // Register ALWAYS requires email verification
            if (!next) {
                console.warn("Register response missing 'next' field, defaulting to verify_email:", normalized);
                next = "verify_email";
            }

            // Store email and navigate
            sessionStorage.setItem("pending_verify_email", formData.email);
            toast.success("Account created! Please verify your email.");
            navigate(navigateByNext(next, formData.email));

        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-8 rounded-2xl bg-slate-900/50 p-8 border border-slate-800 backdrop-blur-xl">
            <AuthStepper currentStep={step === 1 ? 1 : 2} />

            <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                    {step === 1 ? "Do you have an invite?" : "Create your account"}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                    {step === 1
                        ? "MAZIR is currently invite-only."
                        : "Join the elite knowledge network."}
                </p>
            </div>

            {step === 1 ? (
                <form onSubmit={handleInviteSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Invite Code</label>
                        <Input
                            placeholder="ENTER-CODE"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            required
                            className="bg-slate-950 border-slate-800 text-center uppercase tracking-widest"
                        />
                    </div>
                    <Button type="submit" className="w-full">Continue</Button>
                    <div className="text-center text-xs text-slate-500">
                        Don't have a code? <a href="#" className="underline">Request access</a>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Username</label>
                            <Input
                                placeholder="@username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Email</label>
                            <Input
                                type="email"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Password</label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="bg-slate-950 border-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Confirm</label>
                                <Input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                    className="bg-slate-950 border-slate-800"
                                />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating account..." : "Create Account"}
                    </Button>

                    <div className="text-center text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link to="/auth/login" className="font-medium text-blue-400 hover:text-blue-300">
                            Sign in
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}

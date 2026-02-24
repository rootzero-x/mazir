import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function VerifyDevice() {
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 6) {
            toast.error("Invalid code");
            return;
        }
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            toast.success("Device verified!");
            navigate("/feed");
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="w-full space-y-8 rounded-2xl bg-slate-900/50 p-8 border border-slate-800 backdrop-blur-xl text-center">
            <div className="space-y-2">
                <div className="mx-auto h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">New Device Detected</h2>
                <p className="text-sm text-slate-400">
                    For your security, please verify this device. Check your email for a code.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    className="text-center text-3xl tracking-[1em] font-mono h-16 bg-slate-950 border-slate-800"
                    maxLength={6}
                />

                <Button type="submit" className="w-full h-12" disabled={loading}>
                    {loading ? "Verifying..." : "Verify Device"}
                </Button>
            </form>
        </div>
    );
}

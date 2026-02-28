import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import OnboardingStepper from "@/components/onboarding/OnboardingStepper";
import { navigateByNext } from "@/lib/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import api from "@/lib/api";

const COMMUNITY_RULES = [
    {
        id: "respect",
        title: "Respect Everyone",
        description: "Treat all members with kindness and respect, regardless of background or skill level.",
    },
    {
        id: "no-spam",
        title: "No Spam or Self-Promotion",
        description: "Avoid excessive self-promotion, spam, or irrelevant content.",
    },
    {
        id: "constructive",
        title: "Be Constructive",
        description: "Provide helpful feedback and engage in meaningful discussions.",
    },
    {
        id: "privacy",
        title: "Respect Privacy",
        description: "Don't share others' personal information without consent.",
    },
    {
        id: "original",
        title: "Original Content",
        description: "Share original work and give credit when sharing others' content.",
    },
];

export default function Rules() {
    const navigate = useNavigate();
    const { checkAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [acceptedRules, setAcceptedRules] = useState<string[]>([]);
    const [agreeAll, setAgreeAll] = useState(false);

    const toggleRule = (ruleId: string) => {
        setAcceptedRules((prev) => {
            const newRules = prev.includes(ruleId)
                ? prev.filter((id) => id !== ruleId)
                : [...prev, ruleId];
            setAgreeAll(newRules.length === COMMUNITY_RULES.length);
            return newRules;
        });
    };

    const toggleAgreeAll = () => {
        if (agreeAll) {
            setAcceptedRules([]);
            setAgreeAll(false);
        } else {
            setAcceptedRules(COMMUNITY_RULES.map((rule) => rule.id));
            setAgreeAll(true);
        }
    };

    const handleAccept = async () => {
        if (acceptedRules.length !== COMMUNITY_RULES.length) {
            toast.error("Please accept all community rules to continue");
            return;
        }

        setLoading(true);

        try {
            const { data } = await api.post("/onboarding/rules", {
                accepted: true,
                rules: acceptedRules,
            });

            // Normalize response (handle double-wrap)
            const next = data?.next || data?.data?.next || "onboarding_rooms";

            // Refresh user state to get updated onboarding progress
            await checkAuth();

            toast.success("Rules accepted!");
            navigate(navigateByNext(next));
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save rules");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
            {/* Ambient Glows */}
            <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-sky-500/10 blur-[150px] pointer-events-none z-0" />

            <div className="w-full max-w-2xl space-y-8 rounded-[2rem] bg-slate-900/40 p-8 border border-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <OnboardingStepper currentStep={2} />

                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                        Community Rules
                    </h1>
                    <p className="text-slate-400">
                        Respect the code. Respect the network. Let's build something amazing together.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Accept All Checkbox */}
                    <div className="flex items-center space-x-4 rounded-xl border border-violet-500/50 bg-violet-600/10 p-5 shadow-[0_0_15px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/30">
                        <Checkbox
                            checked={agreeAll}
                            onCheckedChange={toggleAgreeAll}
                            id="agree-all"
                            className="border-violet-400 bg-slate-950/50 data-[state=checked]:bg-violet-600 data-[state=checked]:text-white"
                        />
                        <label
                            htmlFor="agree-all"
                            className="flex-1 text-[15px] font-bold text-white cursor-pointer tracking-wide drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                        >
                            I agree to all community rules
                        </label>
                    </div>

                    {/* Individual Rules */}
                    <div className="space-y-3.5">
                        {COMMUNITY_RULES.map((rule) => (
                            <div
                                key={rule.id}
                                className={`flex items-start space-x-4 rounded-xl border p-5 transition-all ${acceptedRules.includes(rule.id)
                                    ? "border-violet-500/30 bg-slate-900/70 shadow-[0_4px_15px_rgba(139,92,246,0.1)]"
                                    : "border-white/5 bg-slate-950/50 shadow-inner"
                                    }`}
                            >
                                <Checkbox
                                    checked={acceptedRules.includes(rule.id)}
                                    onCheckedChange={() => toggleRule(rule.id)}
                                    id={rule.id}
                                    className="mt-0.5 border-white/20 data-[state=checked]:bg-violet-600 data-[state=checked]:text-white shadow-inner"
                                />
                                <label
                                    htmlFor={rule.id}
                                    className="flex-1 cursor-pointer space-y-1.5"
                                >
                                    <div className="text-[15px] font-semibold text-slate-200">
                                        {rule.title}
                                    </div>
                                    <div className="text-sm text-slate-400 font-light pr-4 leading-relaxed">
                                        {rule.description}
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>

                    <Button
                        onClick={handleAccept}
                        disabled={loading || !agreeAll}
                        className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border-0 rounded-xl transition-all transform hover:-translate-y-0.5"
                    >
                        {loading ? "Saving..." : "Accept & Continue"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

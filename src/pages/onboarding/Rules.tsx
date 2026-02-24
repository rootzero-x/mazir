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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
            <div className="w-full max-w-2xl space-y-8 rounded-2xl bg-slate-900/50 p-8 border border-slate-800 backdrop-blur-xl">
                <OnboardingStepper currentStep={2} />

                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Community Rules
                    </h1>
                    <p className="text-slate-400">
                        Respect the code. Respect the network. Let's build something amazing together.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Accept All Checkbox */}
                    <div className="flex items-center space-x-3 rounded-lg border-2 border-blue-600 bg-blue-600/10 p-4">
                        <Checkbox
                            checked={agreeAll}
                            onCheckedChange={toggleAgreeAll}
                            id="agree-all"
                        />
                        <label
                            htmlFor="agree-all"
                            className="flex-1 text-sm font-semibold text-white cursor-pointer"
                        >
                            I agree to all community rules
                        </label>
                    </div>

                    {/* Individual Rules */}
                    <div className="space-y-4">
                        {COMMUNITY_RULES.map((rule) => (
                            <div
                                key={rule.id}
                                className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all ${acceptedRules.includes(rule.id)
                                    ? "border-slate-700 bg-slate-950/50"
                                    : "border-slate-800 bg-slate-950/30"
                                    }`}
                            >
                                <Checkbox
                                    checked={acceptedRules.includes(rule.id)}
                                    onCheckedChange={() => toggleRule(rule.id)}
                                    id={rule.id}
                                />
                                <label
                                    htmlFor={rule.id}
                                    className="flex-1 cursor-pointer space-y-1"
                                >
                                    <div className="text-sm font-semibold text-white">
                                        {rule.title}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {rule.description}
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>

                    <Button
                        onClick={handleAccept}
                        disabled={loading || !agreeAll}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                    >
                        {loading ? "Saving..." : "Accept & Continue"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

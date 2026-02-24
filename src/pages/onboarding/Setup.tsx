import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import OnboardingStepper from "@/components/onboarding/OnboardingStepper";
import { navigateByNext } from "@/lib/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import api from "@/lib/api";

const GOALS_OPTIONS = [
    { id: "learn", label: "Learn New Skills", icon: "🎓" },
    { id: "connect", label: "Connect with Others", icon: "🤝" },
    { id: "create", label: "Create Projects", icon: "🚀" },
    { id: "teach", label: "Share Knowledge", icon: "💡" },
    { id: "collaborate", label: "Collaborate", icon: "👥" },
];

const SKILLS_OPTIONS = [
    { id: "frontend", label: "Frontend Dev" },
    { id: "backend", label: "Backend Dev" },
    { id: "design", label: "UI/UX Design" },
    { id: "mobile", label: "Mobile Dev" },
    { id: "data", label: "Data Science" },
    { id: "devops", label: "DevOps" },
    { id: "ai", label: "AI/ML" },
    { id: "blockchain", label: "Blockchain" },
];

export default function Setup() {
    const navigate = useNavigate();
    const { user, checkAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [bio, setBio] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const toggleGoal = (goalId: string) => {
        setSelectedGoals((prev) =>
            prev.includes(goalId)
                ? prev.filter((id) => id !== goalId)
                : prev.length < 3
                    ? [...prev, goalId]
                    : prev
        );
    };

    const toggleSkill = (skillId: string) => {
        setSelectedSkills((prev) =>
            prev.includes(skillId)
                ? prev.filter((id) => id !== skillId)
                : prev.length < 5
                    ? [...prev, skillId]
                    : prev
        );
    };

    const handleContinue = async () => {
        if (selectedGoals.length === 0) {
            toast.error("Please select at least one goal");
            return;
        }
        if (selectedSkills.length === 0) {
            toast.error("Please select at least one skill");
            return;
        }

        setLoading(true);
        setFieldErrors({});

        try {
            // Fallback for display_name if empty: use username or generate fallback
            const finalDisplayName = displayName.trim()
                || user?.username
                || (user?.email ? user.email.split('@')[0] : "User");

            const { data } = await api.post("/onboarding/setup", {
                display_name: finalDisplayName,
                goals: selectedGoals,
                skills: selectedSkills,
                bio: bio.trim() || undefined,
            });

            // Normalize response (handle double-wrap)
            const next = data?.next || data?.data?.next || "onboarding_rules";

            // Refresh user state to get updated onboarding progress
            await checkAuth();

            toast.success("Setup saved!");
            navigate(navigateByNext(next));
        } catch (error: any) {
            console.error(error);

            // Handle 422 validation errors
            if (error.response?.status === 422 && error.response?.data?.fields) {
                setFieldErrors(error.response.data.fields);
                toast.error("Please fix the validation errors");
            } else {
                toast.error(error.response?.data?.message || "Failed to save setup");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
            <div className="w-full max-w-2xl space-y-8 rounded-2xl bg-slate-900/50 p-8 border border-slate-800 backdrop-blur-xl">
                <OnboardingStepper currentStep={1} />

                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Let's Set Up Your Profile
                    </h1>
                    <p className="text-slate-400">
                        Tell us about your goals and skills so we can personalize your experience.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Display Name Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-200">
                            Display Name <span className="text-slate-500">(Optional)</span>
                        </label>
                        <Input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
                            placeholder="e.g., Root Zero"
                            className="bg-slate-950 border-slate-800 focus-visible:ring-blue-600 text-white"
                            maxLength={50}
                        />
                        <p className="text-xs text-slate-500">
                            This name shows on your profile. {displayName.length}/50
                        </p>
                        {fieldErrors.display_name && (
                            <p className="text-xs text-red-400">
                                {fieldErrors.display_name.join(", ")}
                            </p>
                        )}
                    </div>

                    {/* Goals Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-200">
                            What are your goals? <span className="text-slate-500">(Select 1-3)</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {GOALS_OPTIONS.map((goal) => (
                                <button
                                    key={goal.id}
                                    onClick={() => toggleGoal(goal.id)}
                                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${selectedGoals.includes(goal.id)
                                        ? "border-blue-600 bg-blue-600/10 text-white"
                                        : "border-slate-700 bg-slate-950/50 text-slate-400 hover:border-slate-600 hover:bg-slate-900/50"
                                        }`}
                                >
                                    <span className="text-2xl">{goal.icon}</span>
                                    <span className="text-xs font-medium text-center">{goal.label}</span>
                                </button>
                            ))}
                        </div>
                        {fieldErrors.goals && (
                            <p className="text-xs text-red-400">
                                {fieldErrors.goals.join(", ")}
                            </p>
                        )}
                    </div>

                    {/* Skills Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-200">
                            What are your skills? <span className="text-slate-500">(Select 1-5)</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {SKILLS_OPTIONS.map((skill) => (
                                <button
                                    key={skill.id}
                                    onClick={() => toggleSkill(skill.id)}
                                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${selectedSkills.includes(skill.id)
                                        ? "border-blue-600 bg-blue-600/10 text-white"
                                        : "border-slate-700 bg-slate-950/50 text-slate-400 hover:border-slate-600 hover:bg-slate-900/50"
                                        }`}
                                >
                                    {skill.label}
                                </button>
                            ))}
                        </div>
                        {fieldErrors.skills && (
                            <p className="text-xs text-red-400">
                                {fieldErrors.skills.join(", ")}
                            </p>
                        )}
                    </div>

                    {/* Bio Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-200">
                            Bio <span className="text-slate-500">(Optional)</span>
                        </label>
                        <Textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            className="min-h-[100px] bg-slate-950 border-slate-800 focus-visible:ring-blue-600 text-white resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-slate-500 text-right">{bio.length}/500</p>
                        {fieldErrors.bio && (
                            <p className="text-xs text-red-400">
                                {fieldErrors.bio.join(", ")}
                            </p>
                        )}
                    </div>

                    <Button
                        onClick={handleContinue}
                        disabled={loading || selectedGoals.length === 0 || selectedSkills.length === 0}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                    >
                        {loading ? "Saving..." : "Continue"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

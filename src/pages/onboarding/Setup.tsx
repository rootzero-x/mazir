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
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
            {/* Ambient Glows */}
            <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-sky-500/10 blur-[150px] pointer-events-none z-0" />

            <div className="w-full max-w-2xl space-y-8 rounded-[2rem] bg-slate-900/40 p-8 border border-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <OnboardingStepper currentStep={1} />

                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                        Let's Set Up Your Profile
                    </h1>
                    <p className="text-[15px] font-light text-slate-400">
                        Tell us about your goals and skills so we can personalize your experience.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Display Name Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-200">
                            Display Name <span className="text-slate-500 font-normal">(Optional)</span>
                        </label>
                        <Input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
                            placeholder="e.g., Root Zero"
                            className="bg-slate-950/50 border-white/5 text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-violet-500/50 focus:border-violet-500/50 h-12 rounded-xl transition-all"
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
                        <label className="text-sm font-medium text-slate-200">
                            What are your goals? <span className="text-slate-500 font-normal">(Select 1-3)</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {GOALS_OPTIONS.map((goal) => (
                                <button
                                    key={goal.id}
                                    onClick={() => toggleGoal(goal.id)}
                                    className={`flex flex-col items-center gap-2 rounded-[1rem] border-2 p-4 transition-all ${selectedGoals.includes(goal.id)
                                        ? "border-violet-500 bg-violet-600/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                                        : "border-white/5 bg-slate-950/50 text-slate-400 hover:border-white/10 hover:bg-slate-900/50 shadow-inner"
                                        }`}
                                >
                                    <span className="text-3xl drop-shadow-sm group-hover:drop-shadow-md transition-all">{goal.icon}</span>
                                    <span className="text-[13px] font-medium text-center">{goal.label}</span>
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
                        <label className="text-sm font-medium text-slate-200">
                            What are your skills? <span className="text-slate-500 font-normal">(Select 1-5)</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {SKILLS_OPTIONS.map((skill) => (
                                <button
                                    key={skill.id}
                                    onClick={() => toggleSkill(skill.id)}
                                    className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all ${selectedSkills.includes(skill.id)
                                        ? "border-violet-500 bg-violet-600/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                                        : "border-white/5 bg-slate-950/50 text-slate-400 hover:border-white/10 hover:bg-slate-900/50 shadow-inner"
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
                        <label className="text-sm font-medium text-slate-200">
                            Bio <span className="text-slate-500 font-normal">(Optional)</span>
                        </label>
                        <Textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            className="min-h-[100px] bg-slate-950/50 border-white/5 text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-violet-500/50 focus:border-violet-500/50 rounded-xl transition-all resize-none shadow-inner"
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
                        className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border-0 rounded-xl transition-all transform hover:-translate-y-0.5"
                    >
                        {loading ? "Saving..." : "Continue"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

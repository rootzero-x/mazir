import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OnboardingStepper from "@/components/onboarding/OnboardingStepper";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import api from "@/lib/api";

const AVAILABLE_ROOMS = [
    {
        id: "general",
        name: "General Discussion",
        description: "Talk about anything and everything",
        icon: "💬",
        color: "blue",
    },
    {
        id: "frontend",
        name: "Frontend Development",
        description: "React, Vue, UI/UX, and more",
        icon: "🎨",
        color: "purple",
    },
    {
        id: "backend",
        name: "Backend Development",
        description: "APIs, databases, servers",
        icon: "⚙️",
        color: "green",
    },
    {
        id: "mobile",
        name: "Mobile Development",
        description: "iOS, Android, React Native",
        icon: "📱",
        color: "pink",
    },
    {
        id: "ai",
        name: "AI & Machine Learning",
        description: "ML models, AI applications",
        icon: "🤖",
        color: "orange",
    },
];

const COLOR_CLASSES = {
    blue: "border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.2)]",
    purple: "border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]",
    green: "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
    pink: "border-pink-500 bg-pink-500/10 ring-2 ring-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]",
    orange: "border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]",
};

export default function Rooms() {
    const navigate = useNavigate();
    const { checkAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

    const toggleRoom = (roomId: string) => {
        setSelectedRooms((prev) =>
            prev.includes(roomId)
                ? prev.filter((id) => id !== roomId)
                : [...prev, roomId]
        );
    };

    const handleFinish = async () => {
        if (selectedRooms.length < 3) {
            toast.error("Please select at least 3 rooms");
            return;
        }

        setLoading(true);

        try {
            await api.post("/onboarding/rooms", {
                rooms: selectedRooms,
            });

            // CRITICAL: Refresh user state to get updated onboarding_state="DONE"
            // This ensures ProtectedRoute sees the user as DONE and allows access to /feed
            console.log("[OnboardingRooms] Refreshing auth state...");
            const refreshedUser = await checkAuth();

            console.log("[OnboardingRooms] Auth state refreshed:", {
                user: refreshedUser?.username,
                onboarding_state: refreshedUser?.onboarding_state,
                next: refreshedUser?.next,
            });

            // Force navigation to feed after completion
            console.log("[OnboardingRooms] Navigating to /feed");
            toast.success("You're all set! Welcome aboard! 🎉");
            navigate("/feed", { replace: true });

        } catch (error: any) {
            console.error("[OnboardingRooms] Failed:", error);
            toast.error(error.response?.data?.message || "Failed to save rooms");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
            {/* Ambient Glows */}
            <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-sky-500/10 blur-[150px] pointer-events-none z-0" />

            <div className="w-full max-w-3xl space-y-8 rounded-[2rem] bg-slate-900/40 p-8 border border-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <OnboardingStepper currentStep={3} />

                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                        Join Your Communities
                    </h1>
                    <p className="text-[15px] font-light text-slate-400">
                        Select at least 3 rooms to join and start engaging with the community.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Progress Indicator */}
                    <div className="text-center">
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-white">
                            <span className={selectedRooms.length >= 3 ? "text-green-400" : "text-slate-400"}>
                                {selectedRooms.length} / 3 minimum
                            </span>
                        </span>
                    </div>

                    {/* Room Cards */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {AVAILABLE_ROOMS.map((room) => {
                            const isSelected = selectedRooms.includes(room.id);
                            const colorClass = COLOR_CLASSES[room.color as keyof typeof COLOR_CLASSES];

                            return (
                                <button
                                    key={room.id}
                                    onClick={() => toggleRoom(room.id)}
                                    className={`flex flex-col items-start gap-4 rounded-xl border p-5 text-left transition-all ${isSelected
                                        ? `${colorClass}`
                                        : "border-white/5 bg-slate-950/50 hover:border-white/10 hover:bg-slate-900/50 shadow-inner"
                                        }`}
                                >
                                    <div className="flex w-full items-center justify-between">
                                        <span className="text-3xl">{room.icon}</span>
                                        {isSelected && (
                                            <svg
                                                className="h-6 w-6 text-green-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <h3 className="font-semibold text-slate-200">
                                            {room.name}
                                        </h3>
                                        <p className="text-sm text-slate-400 font-light">
                                            {room.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <Button
                        onClick={handleFinish}
                        disabled={loading || selectedRooms.length < 3}
                        className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border-0 rounded-xl transition-all transform hover:-translate-y-0.5"
                    >
                        {loading ? "Finishing..." : "Finish & Enter Community 🚀"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

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
    blue: "border-blue-600 bg-blue-600/10 ring-blue-600/20",
    purple: "border-purple-600 bg-purple-600/10 ring-purple-600/20",
    green: "border-green-600 bg-green-600/10 ring-green-600/20",
    pink: "border-pink-600 bg-pink-600/10 ring-pink-600/20",
    orange: "border-orange-600 bg-orange-600/10 ring-orange-600/20",
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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
            <div className="w-full max-w-3xl space-y-8 rounded-2xl bg-slate-900/50 p-8 border border-slate-800 backdrop-blur-xl">
                <OnboardingStepper currentStep={3} />

                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Join Your Communities
                    </h1>
                    <p className="text-slate-400">
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
                                    className={`flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all ${isSelected
                                        ? `${colorClass} ring-2`
                                        : "border-slate-700 bg-slate-950/50 hover:border-slate-600 hover:bg-slate-900/50"
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
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-white">
                                            {room.name}
                                        </h3>
                                        <p className="text-xs text-slate-400">
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
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold"
                    >
                        {loading ? "Finishing..." : "Finish & Enter Community 🚀"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

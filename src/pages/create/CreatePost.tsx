import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";

const POST_TYPES = [
    { id: "bug", label: "Bug / Error", description: "Get help with a specific issue", color: "from-red-500/20 to-orange-500/20 text-red-400 border-red-500/20 hover:border-red-500/40" },
    { id: "solution", label: "Solution / Guide", description: "Share how you fixed something", color: "from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/20 hover:border-green-500/40" },
    { id: "insight", label: "Insight", description: "Share what you learned", color: "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/20 hover:border-blue-500/40" },
    { id: "update", label: "Project Update", description: "Show off your progress", color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/20 hover:border-purple-500/40" }
];

export default function CreatePost() {
    const navigate = useNavigate();
    const [type, setType] = useState("insight");
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        context: "",
        problem: "",
        attempt: "",
        solution: "",
        result: "",
        tags: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePublish = async () => {
        if (!formData.title.trim() || !formData.context.trim()) {
            toast.error("Title and Context are required");
            return;
        }

        setLoading(true);
        try {
            // Convert comma-separated tags to array
            const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(Boolean);

            await api.post("/posts", {
                ...formData,
                type,
                tags: tagsArray
            });

            toast.success("Post published successfully!");
            navigate("/feed");
        } catch (error) {
            console.error("Failed to create post:", error);
            toast.error("Failed to publish post");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="h-full w-full overflow-y-auto bg-slate-950 pb-20 md:pb-0">
            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Create Post
                    </h1>
                    <p className="text-slate-400 text-lg">Share your knowledge with the community.</p>
                </div>

                {/* Post Type Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {POST_TYPES.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setType(t.id)}
                            className={`group relative p-4 rounded-2xl border text-left transition-all duration-300 ${type === t.id
                                ? `bg-gradient-to-br ${t.color} border-transparent ring-1 ring-white/10 shadow-lg shadow-black/20`
                                : "bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/60 hover:border-slate-700"
                                }`}
                        >
                            <div className="flex flex-col gap-1">
                                <span className={`font-bold text-sm tracking-wide ${type === t.id ? "" : "text-slate-300"}`}>
                                    {t.label}
                                </span>
                                <span className="text-xs opacity-70">
                                    {t.description}
                                </span>
                            </div>
                            {type === t.id && (
                                <div className="absolute top-2 right-2">
                                    <Sparkles className="w-4 h-4 opacity-50" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Form Container */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-xl space-y-8 relative overflow-hidden">
                    {/* Glow effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent blur-sm" />

                    {/* Title */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300 ml-1">Title <span className="text-red-400">*</span></label>
                        <Input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., How I optimized React performance..."
                            className="bg-slate-950/50 border-slate-800 text-lg font-semibold h-12 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300 placeholder:text-slate-600 rounded-xl"
                        />
                    </div>

                    {/* Context */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300 ml-1">Context / Background <span className="text-red-400">*</span></label>
                        <Textarea
                            name="context"
                            value={formData.context}
                            onChange={handleChange}
                            placeholder="Describe the situation..."
                            className="bg-slate-950/50 border-slate-800 min-h-[100px] focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300 placeholder:text-slate-600 rounded-xl resize-none"
                        />
                    </div>

                    {/* Dynamic Fields Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-300 ml-1">Problem</label>
                            <Textarea
                                name="problem"
                                value={formData.problem}
                                onChange={handleChange}
                                placeholder="What went wrong?"
                                className="bg-slate-950/50 border-slate-800 min-h-[140px] focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300 placeholder:text-slate-600 rounded-xl resize-none"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-300 ml-1">Attempted Solution</label>
                            <Textarea
                                name="attempt"
                                value={formData.attempt}
                                onChange={handleChange}
                                placeholder="What did you try?"
                                className="bg-slate-950/50 border-slate-800 min-h-[140px] focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300 placeholder:text-slate-600 rounded-xl resize-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300 ml-1">Final Solution</label>
                        <Textarea
                            name="solution"
                            value={formData.solution}
                            onChange={handleChange}
                            placeholder="The working solution..."
                            className="bg-slate-950/50 border-slate-800 min-h-[100px] focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300 placeholder:text-slate-600 rounded-xl resize-none"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300 ml-1">Result / Impact</label>
                        <Textarea
                            name="result"
                            value={formData.result}
                            onChange={handleChange}
                            placeholder="Metrics, improvements..."
                            className="bg-slate-950/50 border-slate-800 min-h-[80px] focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300 placeholder:text-slate-600 rounded-xl resize-none"
                        />
                    </div>

                    <div className="pt-6 border-t border-slate-800/50">
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-300 ml-1">Tags (comma separated)</label>
                            <Input
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="React, Performance, Optimization..."
                                className="bg-slate-950/50 border-slate-800 h-12 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300 placeholder:text-slate-600 rounded-xl"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 pb-8">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-400 hover:text-white">Cancel</Button>
                    <Button
                        size="lg"
                        className="px-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 border-0 rounded-xl font-bold tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        onClick={handlePublish}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Publishing...
                            </>
                        ) : (
                            "Publish Post"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

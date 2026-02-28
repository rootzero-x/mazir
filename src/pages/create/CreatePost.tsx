import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const POST_TYPES = [
    { id: "bug", label: "Bug / Error", description: "Get help with a specific issue", color: "red", shadow: "rgba(239,68,68,0.2)" },
    { id: "solution", label: "Solution / Guide", description: "Share how you fixed something", color: "emerald", shadow: "rgba(16,185,129,0.2)" },
    { id: "insight", label: "Insight", description: "Share what you learned", color: "blue", shadow: "rgba(59,130,246,0.2)" },
    { id: "update", label: "Project Update", description: "Show off your progress", color: "violet", shadow: "rgba(139,92,246,0.2)" }
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
        <div className="h-full w-full overflow-y-auto pb-20 md:pb-10 relative bg-transparent">
            {/* Ambient Glows */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-sky-500/5 blur-[150px] pointer-events-none z-0" />

            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-10 relative z-10">
                {/* Header */}
                <div>
                    <Button variant="ghost" onClick={() => navigate("/feed")} className="pl-0 text-slate-400 hover:text-white mb-6 group">
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Feed
                    </Button>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 neon-text-glow drop-shadow-sm">Create Post</h1>
                    <p className="text-slate-400 text-lg font-light">Share your knowledge, findings, or questions with the community.</p>
                </div>

                {/* Post Type Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                    {POST_TYPES.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setType(t.id)}
                            className={cn(
                                "group relative flex flex-col p-6 rounded-[1.5rem] border text-left transition-all duration-500 overflow-hidden",
                                type === t.id
                                    ? `bg-${t.color}-500/10 border-${t.color}-500/30 scale-[1.02] shadow-[0_0_30px_${t.shadow}] backdrop-blur-md`
                                    : "bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-800/40 backdrop-blur-sm"
                            )}
                        >
                            {/* Inner active glow */}
                            {type === t.id && (
                                <div className={`absolute inset-0 bg-gradient-to-b from-${t.color}-500/10 to-transparent pointer-events-none`} />
                            )}
                            <div className="flex flex-col gap-2 relative z-10">
                                <span className={cn(
                                    "font-bold text-lg tracking-wide transition-colors",
                                    type === t.id ? "text-white" : "text-slate-300 group-hover:text-white"
                                )}>
                                    {t.label}
                                </span>
                                <span className="text-sm font-light text-slate-500">
                                    {t.description}
                                </span>
                            </div>
                            {type === t.id && (
                                <div className={`absolute top-4 right-4 text-${t.color}-400`}>
                                    <Sparkles className="w-5 h-5 drop-shadow-[0_0_8px_currentColor]" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Form Container */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-8 relative">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-[15px] font-medium text-slate-200 ml-1">Title <span className="text-violet-500">*</span></label>
                        <Input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., How I optimized React performance..."
                            className="bg-slate-950/50 border-white/5 focus:border-violet-500/50 focus-visible:ring-1 focus-visible:ring-violet-500/50 h-12 rounded-xl text-[15px] transition-all shadow-inner placeholder:text-slate-600 font-semibold"
                        />
                    </div>

                    {/* Context */}
                    <div className="space-y-2">
                        <label className="text-[15px] font-medium text-slate-200 ml-1">Context / Background <span className="text-violet-500">*</span></label>
                        <Textarea
                            name="context"
                            value={formData.context}
                            onChange={handleChange}
                            placeholder="Describe the situation..."
                            className="bg-slate-950/50 border-white/5 focus:border-violet-500/50 focus-visible:ring-1 focus-visible:ring-violet-500/50 min-h-[100px] rounded-xl text-[15px] transition-all shadow-inner placeholder:text-slate-600 resize-y"
                        />
                    </div>

                    {/* Dynamic Fields Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[15px] font-medium text-slate-200 ml-1">Problem</label>
                            <Textarea
                                name="problem"
                                value={formData.problem}
                                onChange={handleChange}
                                placeholder="What went wrong?"
                                className="bg-slate-950/50 border-white/5 focus:border-violet-500/50 focus-visible:ring-1 focus-visible:ring-violet-500/50 min-h-[140px] rounded-xl text-[15px] transition-all shadow-inner placeholder:text-slate-600 resize-y"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[15px] font-medium text-slate-200 ml-1">Attempted Solution</label>
                            <Textarea
                                name="attempt"
                                value={formData.attempt}
                                onChange={handleChange}
                                placeholder="What did you try?"
                                className="bg-slate-950/50 border-white/5 focus:border-violet-500/50 focus-visible:ring-1 focus-visible:ring-violet-500/50 min-h-[140px] rounded-xl text-[15px] transition-all shadow-inner placeholder:text-slate-600 resize-y"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[15px] font-medium text-slate-200 ml-1">Final Solution</label>
                        <Textarea
                            name="solution"
                            value={formData.solution}
                            onChange={handleChange}
                            placeholder="The working solution..."
                            className="bg-slate-950/50 border-white/5 focus:border-violet-500/50 focus-visible:ring-1 focus-visible:ring-violet-500/50 min-h-[100px] rounded-xl text-[15px] transition-all shadow-inner placeholder:text-slate-600 resize-y"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[15px] font-medium text-slate-200 ml-1">Result / Impact</label>
                        <Textarea
                            name="result"
                            value={formData.result}
                            onChange={handleChange}
                            placeholder="Metrics, improvements..."
                            className="bg-slate-950/50 border-white/5 focus:border-violet-500/50 focus-visible:ring-1 focus-visible:ring-violet-500/50 min-h-[80px] rounded-xl text-[15px] transition-all shadow-inner placeholder:text-slate-600 resize-y"
                        />
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <div className="space-y-2">
                            <label className="text-[15px] font-medium text-slate-200 ml-1">Tags</label>
                            <Input
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="React, Performance, Optimization (comma separated)"
                                className="bg-slate-950/50 border-white/5 focus:border-violet-500/50 focus-visible:ring-1 focus-visible:ring-violet-500/50 h-12 rounded-xl text-[15px] transition-all shadow-inner placeholder:text-slate-600 font-mono"
                            />
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/5 flex flex-col md:flex-row justify-end gap-4">
                        <Button variant="ghost" onClick={() => navigate("/feed")} className="h-12 px-6 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePublish}
                            disabled={loading}
                            className="h-12 px-8 min-w-[200px] rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border border-violet-500/50 transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                "Publish Post"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

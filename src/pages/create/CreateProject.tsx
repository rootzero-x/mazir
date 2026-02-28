import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FolderGit2, ShoppingBag, Code2, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

export default function CreateProject() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<"SELL" | "COLLAB" | "OPEN_SOURCE">("COLLAB");

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        pitch: "",
        description: "",
        tags: "",
        price: "",
        demo_url: "",
        repo_url: "",
        image_url: "" // V1: Single image URL input
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.title || !formData.pitch) {
            toast.error("Please fill in the required fields (Title, Pitch)");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                type,
                price: formData.price ? parseFloat(formData.price) : undefined,
                tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
                images: formData.image_url ? [formData.image_url] : []
            };

            await api.post("/projects", payload);
            toast.success("Project created successfully!");
            navigate("/projects");
        } catch (error: any) {
            console.error("Failed to create project:", error);
            toast.error(error.response?.data?.message || "Failed to create project");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto pb-20 md:pb-10 relative bg-transparent">
            {/* Ambient Glows */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-sky-500/5 blur-[150px] pointer-events-none z-0" />

            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-10 relative z-10">
                {/* Header */}
                <div>
                    <Button variant="ghost" onClick={() => navigate("/projects")} className="pl-0 text-slate-400 hover:text-white mb-6 group">
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
                    </Button>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 neon-text-glow drop-shadow-sm">Create New Project</h1>
                    <p className="text-slate-400 text-lg font-light">Share your work, find collaborators, or sell your side-projects.</p>
                </div>

                {/* Type Selection */}
                <div className="grid md:grid-cols-3 gap-5">
                    {[
                        { id: "COLLAB", label: "Collaboration", icon: FolderGit2, desc: "Find teammates", color: "blue", shadow: "rgba(59,130,246,0.2)" },
                        { id: "SELL", label: "For Sale", icon: ShoppingBag, desc: "Sell your project", color: "emerald", shadow: "rgba(16,185,129,0.2)" },
                        { id: "OPEN_SOURCE", label: "Open Source", icon: Code2, desc: "Share code", color: "violet", shadow: "rgba(139,92,246,0.2)" }
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setType(t.id as any)}
                            className={cn(
                                "flex flex-col items-center gap-4 p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden group/btn",
                                type === t.id
                                    ? `bg-${t.color}-500/10 border-${t.color}-500/30 scale-[1.02] shadow-[0_0_30px_${t.shadow}] backdrop-blur-md`
                                    : "bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-800/40 backdrop-blur-sm"
                            )}
                        >
                            {/* Inner active glow */}
                            {type === t.id && (
                                <div className={`absolute inset-0 bg-gradient-to-b from-${t.color}-500/10 to-transparent pointer-events-none`} />
                            )}

                            <div className={cn(
                                "h-16 w-16 rounded-[1.5rem] flex items-center justify-center mb-2 transition-colors duration-500 relative z-10 shadow-inner",
                                type === t.id ? `bg-${t.color}-500 text-white shadow-[0_0_15px_${t.shadow}]` : "bg-slate-800/80 text-slate-400 group-hover/btn:text-slate-300"
                            )}>
                                <t.icon className="h-8 w-8" />
                            </div>
                            <div className="text-center relative z-10">
                                <div className={cn("text-xl font-bold tracking-tight mb-1 transition-colors", type === t.id ? "text-white" : "text-slate-300 group-hover/btn:text-white")}>{t.label}</div>
                                <div className="text-[14px] text-slate-500 font-light">{t.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Form */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 md:p-10 space-y-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative">
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <label className="text-[15px] font-medium text-slate-200 ml-1">Project Name <span className="text-violet-500">*</span></label>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Mazir Web App"
                                className="bg-slate-950/50 border-white/5 focus:border-violet-500/50 focus-visible:ring-1 focus-visible:ring-violet-500/50 h-12 rounded-xl text-[15px] transition-all shadow-inner"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-[15px] font-medium text-slate-200 ml-1">Pitch (Short Description) <span className="text-violet-500">*</span></label>
                            <Input
                                name="pitch"
                                value={formData.pitch}
                                onChange={handleChange}
                                placeholder="One-line elevator pitch..."
                                className="bg-slate-950/50 border-white/5 focus:border-violet-500/50 focus-visible:ring-1 focus-visible:ring-violet-500/50 h-12 rounded-xl text-[15px] transition-all shadow-inner"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-[15px] font-medium text-slate-200 ml-1">Detailed Description</label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Tell us more about the project, the tech stack, and what you're looking for..."
                                className="bg-slate-950/50 border-white/5 focus:border-violet-500/50 focus-visible:ring-1 focus-visible:ring-violet-500/50 min-h-[160px] rounded-xl text-[15px] transition-all shadow-inner resize-y"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <label className="text-[15px] font-medium text-slate-200 ml-1">Tech Stack Tags</label>
                                <Input
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="React, TypeScript, Tailwind"
                                    className="bg-slate-950/50 border-white/5 focus:border-violet-500/50 focus-visible:ring-1 focus-visible:ring-violet-500/50 h-12 rounded-xl text-[15px] transition-all shadow-inner"
                                />
                            </div>

                            {type === "SELL" && (
                                <div className="grid gap-2">
                                    <label className="text-[15px] font-medium text-emerald-400 ml-1 flex items-center gap-2">
                                        Asking Price ($) <span className="text-emerald-500">*</span>
                                    </label>
                                    <Input
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className="bg-emerald-950/20 border-emerald-500/20 focus:border-emerald-500/50 focus-visible:ring-1 focus-visible:ring-emerald-500/50 h-12 rounded-xl text-[15px] transition-all shadow-inner font-mono text-emerald-100 placeholder:text-emerald-700"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <label className="text-[15px] font-medium text-slate-200 ml-1">Live Demo URL</label>
                                <Input
                                    name="demo_url"
                                    value={formData.demo_url}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    className="bg-slate-950/50 border-white/5 focus:border-violet-500/50 focus-visible:ring-1 focus-visible:ring-violet-500/50 h-12 rounded-xl text-[15px] transition-all shadow-inner text-blue-200 placeholder:text-slate-600 font-mono"
                                />
                            </div>

                            <div className="grid gap-2">
                                <label className="text-[15px] font-medium text-slate-200 ml-1">Source Code / Repo URL</label>
                                <Input
                                    name="repo_url"
                                    value={formData.repo_url}
                                    onChange={handleChange}
                                    placeholder="https://github.com/..."
                                    className="bg-slate-950/50 border-white/5 focus:border-violet-500/50 focus-visible:ring-1 focus-visible:ring-violet-500/50 h-12 rounded-xl text-[15px] transition-all shadow-inner text-blue-200 placeholder:text-slate-600 font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-[15px] font-medium text-slate-200 ml-1">Cover Image URL</label>
                            <div className="relative group/image">
                                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within/image:text-violet-400 transition-colors" />
                                <Input
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleChange}
                                    placeholder="https://imgur.com/..."
                                    className="bg-slate-950/50 border-white/5 focus:border-violet-500/50 focus-visible:ring-1 focus-visible:ring-violet-500/50 h-12 rounded-xl text-[15px] transition-all shadow-inner pl-11 font-mono text-slate-300"
                                />
                            </div>
                            <p className="text-[13px] text-slate-500 ml-1 font-light mt-1">Provide a direct link to an image (e.g. Imgur, Unsplash).</p>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/5 flex flex-col md:flex-row justify-end gap-4">
                        <Button variant="ghost" onClick={() => navigate("/projects")} className="h-12 px-6 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="h-12 px-8 min-w-[200px] rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border border-violet-500/50 transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Publish Project"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

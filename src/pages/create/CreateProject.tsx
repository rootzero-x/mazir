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
        <div className="h-full overflow-y-auto pb-20 md:pb-10 relative">
            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
                {/* Header */}
                <div>
                    <Button variant="ghost" onClick={() => navigate("/projects")} className="pl-0 text-slate-400 hover:text-white mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create New Project</h1>
                    <p className="text-slate-400">Share your work, find collaborators, or sell your side-projects.</p>
                </div>

                {/* Type Selection */}
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { id: "COLLAB", label: "Collaboration", icon: FolderGit2, desc: "Find teammates", color: "blue" },
                        { id: "SELL", label: "For Sale", icon: ShoppingBag, desc: "Sell your project", color: "emerald" },
                        { id: "OPEN_SOURCE", label: "Open Source", icon: Code2, desc: "Share code", color: "violet" }
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setType(t.id as any)}
                            className={cn(
                                "flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-300",
                                type === t.id
                                    ? `bg-${t.color}-500/10 border-${t.color}-500/50 shadow-lg shadow-${t.color}-500/10 scale-[1.02]`
                                    : "bg-slate-900/40 border-slate-800 hover:bg-slate-800/60"
                            )}
                        >
                            <div className={cn(
                                "h-12 w-12 rounded-full flex items-center justify-center mb-2",
                                type === t.id ? `bg-${t.color}-500 text-white` : "bg-slate-800 text-slate-400"
                            )}>
                                <t.icon className="h-6 w-6" />
                            </div>
                            <div className="text-center">
                                <div className={cn("font-bold", type === t.id ? "text-white" : "text-slate-300")}>{t.label}</div>
                                <div className="text-xs text-slate-500">{t.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Form */}
                <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-slate-200">Project Name *</label>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Mazir Web"
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-slate-200">Pitch (Short Description) *</label>
                            <Input
                                name="pitch"
                                value={formData.pitch}
                                onChange={handleChange}
                                placeholder="One-line elevator pitch..."
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-slate-200">Detailed Description</label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Tell us more about the project, the tech stack, and what you're looking for..."
                                className="bg-slate-950 border-slate-800 min-h-[150px]"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-slate-200">Tech Stack Tags</label>
                                <Input
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="React, TypeScript, Tailwind (comma separated)"
                                    className="bg-slate-950 border-slate-800"
                                />
                            </div>

                            {type === "SELL" && (
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-slate-200">Price ($)</label>
                                    <Input
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className="bg-slate-950 border-slate-800"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-slate-200">Demo URL</label>
                                <Input
                                    name="demo_url"
                                    value={formData.demo_url}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    className="bg-slate-950 border-slate-800"
                                />
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-slate-200">Repo URL</label>
                                <Input
                                    name="repo_url"
                                    value={formData.repo_url}
                                    onChange={handleChange}
                                    placeholder="https://github.com/..."
                                    className="bg-slate-950 border-slate-800"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-slate-200">Cover Image URL</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input
                                        name="image_url"
                                        value={formData.image_url}
                                        onChange={handleChange}
                                        placeholder="https://imgur.com/..."
                                        className="bg-slate-950 border-slate-800 pl-9"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Provide a direct link to an image (e.g. Imgur, Unsplash).</p>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => navigate("/projects")} className="text-slate-400 hover:text-white">Cancel</Button>
                        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-500 min-w-[150px]">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Project"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import type { Project, ProjectType } from "@/lib/types";
import { cn } from "@/lib/utils";
import ProjectCard from "@/components/projects/ProjectCard";
import { getSafeProject } from "@/lib/normalization";

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<ProjectType | "ALL">("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchProjects = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);

            const { data } = await api.get("/projects", {
                params: {
                    type: activeTab === "ALL" ? undefined :
                        activeTab === "SELL" ? "SELL_PROJECT" :
                            activeTab === "COLLAB" ? "LOOKING_FOR_TEAM" :
                                activeTab,
                    q: searchQuery || undefined
                }
            });
            // Handle different possible response structures
            // API returns: { ok: true, data: { projects: [], meta: {} } }
            let rawProjects: any[] = [];
            if (Array.isArray(data)) {
                rawProjects = data;
            } else if (Array.isArray(data.data)) {
                rawProjects = data.data;
            } else if (data.data?.projects && Array.isArray(data.data.projects)) {
                rawProjects = data.data.projects;
            } else if (Array.isArray(data.projects)) {
                rawProjects = data.projects;
            }

            // Normalize backend data to frontend Project interface
            let normalizedProjects: Project[] = rawProjects
                .map((p: any) => getSafeProject(p))
                .filter((p): p is Project => p !== null);

            // STRICT FILTERING: Client-side fallback to ensure type correctness
            if (activeTab !== "ALL") {
                normalizedProjects = normalizedProjects.filter(p => p.type === activeTab);
            }

            setProjects(normalizedProjects);
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            if (!isBackground) setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProjects();

        // Real-time updates: Poll every 10 seconds
        const interval = setInterval(() => {
            fetchProjects(true);
        }, 10000);

        return () => clearInterval(interval);
    }, [activeTab, searchQuery]);

    // Debounced search could be implemented here, simplified for now
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        fetchProjects();
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchProjects();
    };

    const getTypeLabel = (type: string) => {
        switch (type.toUpperCase()) {
            case "SELL": return "For Sale";
            case "COLLAB": return "Collaboration";
            case "OPEN_SOURCE": return "Open Source";
            default: return type;
        }
    };

    return (
        <div className="h-full overflow-y-auto pb-20 md:pb-10 relative overflow-x-hidden bg-transparent">
            {/* Ambient Background Glows */}
            <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[100px] pointer-events-none z-0" />
            <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none z-0" />

            <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 neon-text-glow drop-shadow-sm">Marketplace</h1>
                        <p className="text-slate-400 text-lg font-light">Discover, collaborate, and trade projects.</p>
                    </div>
                    <Link to="/create-project">
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] border border-blue-500/50 text-[15px] font-semibold px-6 py-6 h-auto transition-all duration-300">
                            <Plus className="h-5 w-5" /> Submit Project
                        </Button>
                    </Link>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-slate-900/40 backdrop-blur-xl p-4 rounded-2xl border border-white/5 sticky top-[calc(env(safe-area-inset-top,0px)+1.5rem)] z-30 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300">
                    <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                        {(["ALL", "COLLAB", "SELL", "OPEN_SOURCE"] as const).map((tab) => {
                            let activeClass = "bg-violet-600/20 text-violet-300 border-violet-500/30 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)] drop-shadow-[0_0_8px_rgba(139,92,246,0.2)]"; // default ALL/OPEN_SOURCE
                            if (tab === "COLLAB") activeClass = "bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)] drop-shadow-[0_0_8px_rgba(59,130,246,0.2)]";
                            if (tab === "SELL") activeClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)] drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]";

                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[14px] font-medium transition-all duration-300 border",
                                        activeTab === tab
                                            ? activeClass
                                            : "bg-transparent text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-200"
                                    )}
                                >
                                    {tab === "ALL" ? "All Projects" : getTypeLabel(tab)}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto">
                        <form onSubmit={handleSearch} className="relative flex-1 lg:w-80 group/search">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within/search:text-violet-400 transition-colors" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by title, stack..."
                                className="pl-10 bg-slate-950/50 border-white/5 focus:border-violet-500/50 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-violet-500/50 transition-all shadow-inner text-[15px]"
                            />
                        </form>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleRefresh}
                            className={cn("shrink-0 border-white/5 bg-slate-950/50 hover:bg-white/5 h-11 w-11 rounded-xl transition-colors", refreshing && "animate-spin text-violet-400")}
                        >
                            <RefreshCw className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                {loading && !refreshing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-80 rounded-[2rem] bg-slate-900/40 backdrop-blur-md border border-white/5 shadow-sm animate-pulse flex flex-col p-6">
                                <div className="h-40 w-full bg-slate-800/50 rounded-2xl mb-4" />
                                <div className="space-y-3 flex-1">
                                    <div className="h-6 w-3/4 bg-slate-800/50 rounded-lg" />
                                    <div className="h-4 w-full bg-slate-800/50 rounded-md" />
                                    <div className="h-4 w-5/6 bg-slate-800/50 rounded-md" />
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                                    <div className="h-8 w-8 rounded-full bg-slate-800/50" />
                                    <div className="h-8 w-1/2 bg-slate-800/50 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="glass-card w-full max-w-lg p-10 flex flex-col items-center text-center">
                            <div className="h-24 w-24 rounded-[2rem] bg-slate-900/50 backdrop-blur-md border border-white/5 flex items-center justify-center shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] mb-6 border-dashed">
                                <span className="text-5xl drop-shadow-lg filter grayscale opacity-70">📁</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight mb-2">No projects found</h3>
                            <p className="text-slate-400 max-w-sm mb-8 font-light leading-relaxed">
                                We couldn't find any projects matching your criteria. Be the first to list a new project!
                            </p>
                            <Link to="/create-project">
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] border border-blue-500/50 text-white font-semibold">
                                    <Plus className="h-5 w-5 mr-2" /> Submit a Project
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

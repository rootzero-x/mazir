import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, RefreshCw, FolderGit2 } from "lucide-react";
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
        <div className="h-full overflow-y-auto pb-20 md:pb-10 relative overflow-x-hidden">
            {/* Background Gradient */}
            <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/10 via-slate-900/5 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 relative">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Marketplace</h1>
                        <p className="text-slate-400 text-lg">Discover, collaborate, and trade projects.</p>
                    </div>
                    <Link to="/create-project">
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 text-md px-6 py-6 h-auto">
                            <Plus className="h-5 w-5" /> Submit Project
                        </Button>
                    </Link>
                </div>

                {/* Toolbar */}
                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-800/60 sticky top-[calc(env(safe-area-inset-top,0px)+1.5rem)] z-30 shadow-xl shadow-black/20 transition-all duration-300">
                    <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                        {(["ALL", "COLLAB", "SELL", "OPEN_SOURCE"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border",
                                    activeTab === tab
                                        ? "bg-slate-800 text-white border-slate-700 shadow-lg shadow-slate-900/50"
                                        : "bg-transparent text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200"
                                )}
                            >
                                {tab === "ALL" ? "All Projects" : getTypeLabel(tab)}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto">
                        <form onSubmit={handleSearch} className="relative flex-1 lg:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by title, stack, or tag..."
                                className="pl-10 bg-slate-950/50 border-slate-800 focus:border-blue-500/50 h-10 rounded-xl"
                            />
                        </form>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleRefresh}
                            className={cn("shrink-0 border-slate-800 bg-slate-950/50", refreshing && "animate-spin")}
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                {loading && !refreshing ? (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-80 rounded-3xl bg-slate-900/30 border border-slate-800 animate-pulse" />
                        ))}
                    </div>
                ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800 text-center">
                        <div className="h-24 w-24 rounded-full bg-slate-900 flex items-center justify-center mb-6 border border-slate-800 shadow-xl shadow-black/20">
                            <FolderGit2 className="h-10 w-10 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
                        <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
                            We couldn't find any projects matching your criteria. Try adjusting your filters or be the first to create one!
                        </p>
                        <Link to="/create-project">
                            <Button size="lg" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">
                                <Plus className="h-4 w-4 mr-2" /> Create Project
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

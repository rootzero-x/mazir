import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Globe, Github, ArrowLeft, Loader2, Eye, MessageSquare, ShoppingCart, Layers } from "lucide-react";
import api from "@/lib/api";
import type { Project, ProjectRequest } from "@/lib/types";
import { getSafeProject } from "@/lib/normalization";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import RequestModal from "@/components/projects/RequestModal";
import ProjectRequestsTab from "@/components/projects/ProjectRequestsTab";
import RequestThreadDrawer from "@/components/projects/RequestThreadDrawer";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

export default function ProjectDetail() {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user, isAuthenticated } = useAuth();

    // State
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ views: 0, requests: 0 });
    const [activeTab, setActiveTab] = useState<"overview" | "requests">("overview");

    // Drawer/Modal State
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [activeRequest, setActiveRequest] = useState<ProjectRequest | null>(null);
    const [isThreadOpen, setIsThreadOpen] = useState(false);

    // Initial Fetch & Logic
    useEffect(() => {
        const initProject = async () => {
            if (!id) return;

            try {
                // 1. View Increment
                await api.post(`/projects/${id}/view`).catch(err => console.error("View inc failed", err));

                // 2. Fetch Project Data
                const { data } = await api.get(`/projects/${id}`);
                const rawProject = data.data?.project || data.project || data;
                const safeProject = getSafeProject(rawProject);
                setProject(safeProject);

                // 3. Fetch Real-time Stats
                try {
                    const s = await api.get(`/projects/${id}/stats`);
                    // User requested: state.setStats(s.data.data)
                    // We adapt based on response structure
                    const statsData = s.data?.data || s.data;
                    setStats({
                        views: statsData.view_count ?? statsData.views ?? 0,
                        requests: statsData.request_count ?? statsData.requests ?? 0
                    });
                } catch (e) {
                    console.error("Stats fetch failed", e);
                }

                // 4. Handle Deep Link params (Tab & RID)
                const tab = searchParams.get("tab");
                const rid = searchParams.get("rid");

                if (safeProject && user) {
                    // Check ownership broadly
                    const isOwner = user.id === safeProject.owner.id ||
                        user.id === (safeProject as any).user_id ||
                        user.id === (safeProject as any).author_id;

                    if (tab === "requests" && isOwner) {
                        setActiveTab("requests");

                        if (rid) {
                            // Auto-open drawer
                            try {
                                const reqRes = await api.get(`/project-requests/${rid}`);
                                const req = reqRes.data?.request || reqRes.data;
                                if (req) {
                                    setActiveRequest(req);
                                    setIsThreadOpen(true);
                                }
                            } catch (e) {
                                console.error("Deep link request load failed", e);
                            }
                        }
                    }
                }

            } catch (error) {
                console.error("Failed to load project:", error);
                toast.error("Failed to load project details");
            } finally {
                setLoading(false);
            }
        };

        if (id && user) {
            initProject();
        } else if (id && !isAuthenticated) {
            // Load for non-auth too, just skip owner checks
            initProject();
        }
    }, [id, user, isAuthenticated]); // Removed searchParams to prevent loops, we read it once on mount/user load

    // ... (keep standard polling if needed, or rely on init)
    // Re-implementing simplified polling for stats only
    useEffect(() => {
        if (!id) return;
        const poll = setInterval(async () => {
            try {
                const s = await api.get(`/projects/${id}/stats`);
                const statsData = s.data?.data || s.data;
                setStats({
                    views: statsData.view_count ?? statsData.views ?? 0,
                    requests: statsData.request_count ?? statsData.requests ?? 0
                });
            } catch { }
        }, 10000);
        return () => clearInterval(poll);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold text-white">Project not found</h1>
                <Link to="/projects">
                    <Button variant="outline">Back to Marketplace</Button>
                </Link>
            </div>
        );
    }

    // Robust Owner Check
    const ownerId = project.owner.id || (project as any).owner_id || (project as any).user_id;
    const isOwner = user?.id === ownerId;

    const handleActionClick = () => {
        if (!isAuthenticated) {
            toast.error("Please login to contact the owner");
            return;
        }
        setIsRequestModalOpen(true);
    };

    const handleRequestClick = (request: ProjectRequest) => {
        setActiveRequest(request);
        setIsThreadOpen(true);
        setSearchParams({ tab: "requests", rid: request.id });
    };

    const closeThread = () => {
        setIsThreadOpen(false);
        setActiveRequest(null);
        setSearchParams({ tab: "requests" });
    };

    return (
        <div className="h-full overflow-y-auto pb-20 relative overflow-x-hidden bg-transparent">
            {/* Ambient Base Glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-[20%] w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px]" />
                <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[150px]" />
            </div>

            {/* Hero Section */}
            <div className="relative w-full border-b border-white/5 pb-8 z-10">
                {/* Cover Image Background */}
                <div className="absolute inset-0 overflow-hidden h-64 md:h-80 opacity-60 mix-blend-screen pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/80 to-[#020617] z-10" />
                    {project.images && project.images.length > 0 ? (
                        <img
                            src={project.images[0]}
                            alt="Cover"
                            className="w-full h-full object-cover blur-2xl scale-110 saturate-150"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-900/40 to-violet-900/20" />
                    )}
                </div>

                <div className="relative z-20 max-w-7xl mx-auto px-4 pt-24 md:pt-32">
                    <Link to="/projects" className="absolute top-6 left-4 md:left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors z-30 group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
                    </Link>

                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
                        {/* Project Icon/Image */}
                        <div className="relative group/icon shrink-0">
                            <div className="absolute -inset-1 bg-gradient-to-br from-violet-600/30 to-sky-500/30 rounded-[2rem] blur-xl opacity-0 group-hover/icon:opacity-100 transition-opacity duration-500" />
                            <div className="h-32 w-32 md:h-40 md:w-40 rounded-[2rem] overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative z-10 flex items-center justify-center">
                                {project.images && project.images.length > 0 ? (
                                    <img src={project.images[0]} alt="Icon" className="w-full h-full object-cover" />
                                ) : (
                                    <Layers className="h-16 w-16 text-slate-500/50" />
                                )}
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[12px] font-bold border backdrop-blur-md shadow-lg",
                                    project.type === "SELL" ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]" :
                                        project.type === "COLLAB" ? "bg-blue-500/20 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]" :
                                            "bg-violet-500/20 border-violet-500/30 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                                )}>
                                    {project.type === "SELL" ? "FOR SALE" : project.type === "COLLAB" ? "COLLABORATION" : "OPEN SOURCE"}
                                </span>

                                <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-slate-800/50 border border-white/5 text-slate-400">
                                    {project.created_at ? formatDistanceToNow(new Date(project.created_at), { addSuffix: true }) : "Recently"}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow-sm neon-text-glow">{project.title}</h1>
                            <p className="text-xl text-slate-300 max-w-2xl font-light leading-relaxed">{project.pitch}</p>

                            <div className="flex items-center gap-6 text-[14px]">
                                <Link to={`/profile/${project.owner.username}`} className="flex items-center gap-2 group">
                                    <div className="h-7 w-7 rounded-full bg-slate-800 overflow-hidden ring-1 ring-white/10 group-hover:ring-violet-500/50 transition-all">
                                        {project.owner.avatarUrl ? (
                                            <img src={project.owner.avatarUrl} alt={project.owner.username} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full bg-slate-700 flex items-center justify-center text-xs font-bold">{project.owner.username[0]?.toUpperCase()}</div>
                                        )}
                                    </div>
                                    <span className="font-medium text-slate-300 group-hover:text-violet-300 transition-colors">
                                        by {project.owner.displayName || project.owner.username}
                                    </span>
                                </Link>
                                <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/50 px-3 py-1 rounded-lg border border-white/5">
                                    <Eye className="h-4 w-4 text-sky-400" /> <span className="font-medium text-white">{stats.views}</span> views
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/50 px-3 py-1 rounded-lg border border-white/5">
                                    <MessageSquare className="h-4 w-4 text-violet-400" /> <span className="font-medium text-white">{stats.requests}</span> requests
                                </div>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
                            {!isOwner && (
                                <Button
                                    onClick={handleActionClick}
                                    size="lg"
                                    className={cn(
                                        "w-full md:w-auto text-[15px] font-semibold gap-2 border transition-all duration-300",
                                        project.type === "SELL"
                                            ? "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] border-emerald-500/50 text-white"
                                            : "bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] border-blue-500/50 text-white"
                                    )}
                                >
                                    {project.type === "SELL" ? <ShoppingCart className="h-5 w-5 drop-shadow-md" /> : <MessageSquare className="h-5 w-5 drop-shadow-md" />}
                                    {project.type === "SELL" ? "Purchase Offer" : "Contact Creator"}
                                </Button>
                            )}

                            <div className="flex gap-2">
                                {project.demo_url && (
                                    <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                        <Button variant="outline" className="w-full bg-slate-900/40 backdrop-blur-md border-[0.5px] border-white/10 hover:bg-white/5 text-slate-300 hover:text-white transition-all">
                                            <Globe className="h-4 w-4 mr-2" /> Live Demo
                                        </Button>
                                    </a>
                                )}
                                {project.repo_url && (
                                    <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                        <Button variant="outline" className="w-full bg-slate-900/40 backdrop-blur-md border-[0.5px] border-white/10 hover:bg-white/5 text-slate-300 hover:text-white transition-all">
                                            <Github className="h-4 w-4 mr-2" /> Source
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 border-b border-white/5 mt-8">
                        <button
                            onClick={() => { setActiveTab("overview"); setSearchParams({}); }}
                            className={cn(
                                "px-6 py-4 text-[15px] font-medium border-b-2 transition-all duration-300 relative",
                                activeTab === "overview"
                                    ? "border-violet-500 text-white drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                            )}
                        >
                            Overview
                        </button>
                        {isOwner && (
                            <button
                                onClick={() => { setActiveTab("requests"); setSearchParams({ tab: "requests" }); }}
                                className={cn(
                                    "px-6 py-4 text-[15px] font-medium border-b-2 transition-all duration-300 flex items-center gap-2 relative",
                                    activeTab === "requests"
                                        ? "border-violet-500 text-white drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                                        : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                )}
                            >
                                Requests
                                {stats.requests > 0 && (
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[11px] font-bold shadow-sm transition-colors",
                                        activeTab === "requests" ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]" : "bg-slate-800 text-slate-300"
                                    )}>
                                        {stats.requests}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 min-h-[500px]">
                {activeTab === "overview" ? (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Gallery Carousel */}
                        {project.images && project.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-none">
                                {project.images.map((img, idx) => (
                                    <div key={idx} className="snap-center shrink-0 w-[400px] aspect-video rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-md shadow-lg">
                                        <img src={img} alt={`Slide ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="grid lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-sm relative overflow-hidden">
                                    {/* Ambient card glow */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 blur-[80px] rounded-full pointer-events-none" />

                                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                        About the Project
                                    </h3>
                                    <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-line leading-loose font-light text-[16px]">
                                        {project.description}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 md:p-8 shadow-sm">
                                    <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-5">Tech Stack</h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {project.tags.map(tag => (
                                            <span key={tag} className="px-3.5 py-1.5 rounded-xl bg-slate-950/50 border border-white/5 text-slate-300 font-mono text-[13px] hover:border-violet-500/50 hover:text-white transition-all shadow-inner hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] cursor-default">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {project.price && project.type === "SELL" && (
                                    <div className="p-8 rounded-[2rem] bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative z-10">
                                            <div className="text-[13px] font-bold text-emerald-400/80 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <ShoppingCart className="h-4 w-4" /> Asking Price
                                            </div>
                                            <div className="text-5xl font-bold text-white tracking-tight drop-shadow-md">${project.price}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-sm min-h-[400px]">
                        <ProjectRequestsTab
                            projectId={project.id}
                            onRequestClick={handleRequestClick}
                            isOwner={isOwner}
                        />
                    </div>
                )}
            </div>

            {/* Modals & Drawers */}
            <RequestModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                projectId={project.id}
                projectTitle={project.title}
            />

            <RequestThreadDrawer
                isOpen={isThreadOpen}
                onClose={closeThread}
                request={activeRequest}
            />
        </div>
    );
}

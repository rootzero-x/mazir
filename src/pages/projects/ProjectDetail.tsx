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
        <div className="h-full overflow-y-auto pb-20 relative overflow-x-hidden">
            {/* Hero Section */}
            <div className="relative w-full bg-slate-900 border-b border-slate-800 pb-8">
                {/* Cover Image Background */}
                <div className="absolute inset-0 overflow-hidden h-64 md:h-80">
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900 z-10" />
                    {project.images && project.images.length > 0 ? (
                        <img
                            src={project.images[0]}
                            alt="Cover"
                            className="w-full h-full object-cover opacity-50 blur-sm scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-900" />
                    )}
                </div>

                <div className="relative z-20 max-w-7xl mx-auto px-4 pt-24 md:pt-32">
                    <Link to="/projects" className="absolute top-6 left-4 md:left-8 text-slate-300 hover:text-white flex items-center gap-2 transition-colors z-30">
                        <ArrowLeft className="h-4 w-4" /> Back to Projects
                    </Link>

                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
                        {/* Project Icon/Image */}
                        <div className="h-32 w-32 md:h-40 md:w-40 rounded-3xl overflow-hidden border-4 border-slate-900 shadow-2xl shrink-0 bg-slate-800">
                            {project.images && project.images.length > 0 ? (
                                <img src={project.images[0]} alt="Icon" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
                                    <Layers className="h-16 w-16 text-white/50" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md",
                                    project.type === "SELL" ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" :
                                        project.type === "COLLAB" ? "bg-blue-500/20 border-blue-500/30 text-blue-400" :
                                            "bg-violet-500/20 border-violet-500/30 text-violet-400"
                                )}>
                                    {project.type === "SELL" ? "FOR SALE" : project.type === "COLLAB" ? "COLLABORATION" : "OPEN SOURCE"}
                                </span>

                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800/50 border border-slate-700 text-slate-300">
                                    {project.created_at ? formatDistanceToNow(new Date(project.created_at), { addSuffix: true }) : "Recently"}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{project.title}</h1>
                            <p className="text-xl text-slate-300 max-w-2xl font-light">{project.pitch}</p>

                            <div className="flex items-center gap-6 text-sm">
                                <Link to={`/profile/${project.owner.username}`} className="flex items-center gap-2 group">
                                    <div className="h-6 w-6 rounded-full bg-slate-700 overflow-hidden">
                                        {project.owner.avatarUrl ? (
                                            <img src={project.owner.avatarUrl} alt={project.owner.username} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full bg-slate-600" />
                                        )}
                                    </div>
                                    <span className="font-medium text-slate-300 group-hover:text-blue-400 transition-colors">
                                        By {project.owner.displayName || project.owner.username}
                                    </span>
                                </Link>
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Eye className="h-4 w-4" /> {stats.views} views
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <MessageSquare className="h-4 w-4" /> {stats.requests} requests
                                </div>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
                            {!isOwner && (
                                <Button
                                    onClick={handleActionClick}
                                    size="lg"
                                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 font-semibold gap-2"
                                >
                                    {project.type === "SELL" ? <ShoppingCart className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                                    {project.type === "SELL" ? "Purchase Offer" : "Contact Creator"}
                                </Button>
                            )}

                            <div className="flex gap-2">
                                {project.demo_url && (
                                    <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                        <Button variant="outline" className="w-full bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-slate-200">
                                            <Globe className="h-4 w-4 mr-2" /> Demo
                                        </Button>
                                    </a>
                                )}
                                {project.repo_url && (
                                    <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                        <Button variant="outline" className="w-full bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-slate-200">
                                            <Github className="h-4 w-4 mr-2" /> Code
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 border-b border-slate-800">
                        <button
                            onClick={() => { setActiveTab("overview"); setSearchParams({}); }}
                            className={cn(
                                "px-6 py-3 text-sm font-medium border-b-2 transition-all",
                                activeTab === "overview"
                                    ? "border-blue-500 text-white"
                                    : "border-transparent text-slate-400 hover:text-slate-200"
                            )}
                        >
                            Overview
                        </button>
                        {isOwner && (
                            <button
                                onClick={() => { setActiveTab("requests"); setSearchParams({ tab: "requests" }); }}
                                className={cn(
                                    "px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2",
                                    activeTab === "requests"
                                        ? "border-blue-500 text-white"
                                        : "border-transparent text-slate-400 hover:text-slate-200"
                                )}
                            >
                                Requests
                                {stats.requests > 0 && (
                                    <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded textxs font-bold">
                                        {stats.requests}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 py-8 min-h-[500px]">
                {activeTab === "overview" ? (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Gallery Carousel (if multiple images) */}
                        {project.images && project.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                                {project.images.map((img, idx) => (
                                    <div key={idx} className="snap-center shrink-0 w-80 aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                                        <img src={img} alt={`Slide ${idx}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="grid md:grid-cols-3 gap-10">
                            <div className="md:col-span-2 space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4">About the Project</h3>
                                    <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-line leading-relaxed">
                                        {project.description}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Tech Stack</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-blue-300 font-mono text-sm">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {project.price && project.type === "SELL" && (
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                                        <div className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1">Asking Price</div>
                                        <div className="text-4xl font-bold text-white">${project.price}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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

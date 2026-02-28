import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Globe, User as UserIcon } from "lucide-react";
import api from "@/lib/api";
import type { User, Post, Project } from "@/lib/types";
import PostCard from "@/components/feed/PostCard";
import ProjectCard from "@/components/projects/ProjectCard";
import LevelBadge from "@/components/ui/LevelBadge";
import { getSafeUser, getSafePost, getSafeProject } from "@/lib/normalization";
import { toast } from "react-hot-toast";

// Safe date formatting
function formatJoinDate(dateStr: string): string {
    if (!dateStr) return "Recently";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "Recently";
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${month} ${year}`;
    } catch {
        return "Recently";
    }
}

export default function PublicProfile() {
    const { handle } = useParams();
    const navigate = useNavigate();

    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'posts' | 'projects'>('posts');

    useEffect(() => {
        const fetchPublicProfile = async () => {
            if (!handle) return;

            setLoading(true);
            setError(null);

            try {
                const [userRes, postsRes, projectsRes] = await Promise.all([
                    api.get(`/users/${handle}`),
                    api.get(`/users/${handle}/posts?limit=20`),
                    api.get(`/users/${handle}/projects`) // Fetch only this user's projects
                ]);

                console.log("[PublicProfile] User data:", userRes.data);
                console.log("[PublicProfile] Posts data:", postsRes.data);
                console.log("[PublicProfile] Projects data:", projectsRes.data);

                // Parse user
                const rawUser = userRes.data.user || userRes.data.data?.user || userRes.data.data || userRes.data;
                setProfileUser(rawUser);

                // Parse posts
                let rawPosts: any[] = [];
                if (Array.isArray(postsRes.data)) {
                    rawPosts = postsRes.data;
                } else if (Array.isArray(postsRes.data.posts)) {
                    rawPosts = postsRes.data.posts;
                } else if (Array.isArray(postsRes.data.data)) {
                    rawPosts = postsRes.data.data;
                } else if (Array.isArray(postsRes.data.data?.posts)) {
                    rawPosts = postsRes.data.data.posts;
                }

                const normalizedPosts = rawPosts.map(p => getSafePost(p));
                setPosts(normalizedPosts);

                // Parse projects
                let rawProjects: any[] = [];
                if (Array.isArray(projectsRes.data)) {
                    rawProjects = projectsRes.data;
                } else if (Array.isArray(projectsRes.data.data)) {
                    rawProjects = projectsRes.data.data;
                } else if (projectsRes.data.data?.projects && Array.isArray(projectsRes.data.data.projects)) {
                    rawProjects = projectsRes.data.data.projects;
                } else if (Array.isArray(projectsRes.data.projects)) {
                    rawProjects = projectsRes.data.projects;
                }

                const normalizedProjects = rawProjects
                    .map((p: any) => getSafeProject(p))
                    .filter((p): p is Project => p !== null);
                setProjects(normalizedProjects);

            } catch (error: any) {
                console.error("[PublicProfile] Failed to fetch:", error);

                // Better error message
                const msg = error.response?.status === 404
                    ? "User not found"
                    : "Failed to load profile";

                setError(msg);
                if (error.response?.status !== 404) {
                    toast.error(msg);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPublicProfile();
    }, [handle]);

    if (loading) {
        return (
            <div className="h-full overflow-y-auto pb-20 md:pb-0 relative bg-transparent">
                {/* Ambient Glow */}
                <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none z-0" />
                <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                    <div className="h-64 bg-slate-900/40 backdrop-blur-md animate-pulse border-b border-white/5" />
                    <div className="px-4 md:px-8 space-y-4 -mt-16">
                        <div className="h-32 w-32 rounded-2xl bg-slate-800 animate-pulse border border-white/5 shadow-xl" />
                        <div className="space-y-3">
                            <div className="h-8 w-48 bg-slate-800/50 rounded animate-pulse" />
                            <div className="h-4 w-32 bg-slate-800/50 rounded animate-pulse" />
                            <div className="h-4 w-64 bg-slate-800/50 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !profileUser) {
        return (
            <div className="h-full flex items-center justify-center p-4 relative bg-transparent">
                <div className="fixed inset-0 bg-slate-950 pointer-events-none -z-10" />
                <div className="text-center max-w-md bg-slate-900/40 backdrop-blur-xl border border-white/5 p-10 rounded-[2rem] shadow-2xl relative">
                    <div className="mb-4">
                        <div className="absolute -inset-1 bg-red-500/20 rounded-[2rem] blur-xl" />
                        <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20 relative">
                            <UserIcon className="h-8 w-8 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 relative">{error || "User not found"}</h2>
                        <p className="text-slate-400 font-light mb-6 relative">
                            The profile you are looking for does not exist or has been removed.
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/feed')}
                        className="bg-slate-800 hover:bg-slate-700 text-white shadow-sm border border-white/10 rounded-xl px-8 relative z-10"
                    >
                        Return to Feed
                    </Button>
                </div>
            </div>
        );
    }

    const safeUser = getSafeUser(profileUser);

    return (
        <div className="h-full overflow-y-auto pb-20 md:pb-0 relative bg-transparent">
            {/* Ambient Glows */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-sky-500/5 blur-[150px] pointer-events-none z-0" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Cover Image */}
                <div className="relative h-64 bg-slate-900 group">
                    {safeUser.coverUrl && (
                        <img
                            src={safeUser.coverUrl}
                            alt="Cover"
                            className="w-full h-full object-cover mix-blend-screen opacity-60 pointer-events-none"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Profile Content */}
                <div className="px-4 md:px-8 pb-10 relative">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 mb-8 relative z-20">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-br from-violet-600/30 to-sky-500/30 rounded-[1.2rem] blur-xl opacity-100" />
                            <div className="h-32 w-32 shrink-0 rounded-[1.2rem] bg-slate-900 flex items-center justify-center text-4xl font-bold text-white overflow-hidden border border-white/10 ring-4 ring-slate-950 relative shadow-2xl">
                                {safeUser.avatarUrl ? (
                                    <img
                                        src={safeUser.avatarUrl}
                                        alt={safeUser.username}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="bg-gradient-to-br from-violet-400 to-sky-400 bg-clip-text text-transparent">
                                        {safeUser.username[0]?.toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Name & Stats */}
                        <div className="flex-1 pb-2 relative z-10">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                                    {safeUser.displayName}
                                </h1>
                                {(profileUser.level !== undefined && profileUser.level !== null) && (
                                    <LevelBadge level={profileUser.level} />
                                )}
                            </div>
                            <p className="text-[15px] font-mono text-violet-400/80">@{safeUser.username}</p>
                        </div>
                    </div>

                    {/* Bio & Details Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-10 relative z-10">
                        {/* Left: Bio & Info */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Bio */}
                            {profileUser.bio && (
                                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                                    <p className="text-[15px] font-light text-slate-300 leading-relaxed drop-shadow-sm">
                                        {profileUser.bio}
                                    </p>
                                </div>
                            )}

                            {/* Skills */}
                            {profileUser.skills && profileUser.skills.length > 0 && (
                                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Skills</h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {profileUser.skills.map(skill => (
                                            <span key={skill} className="px-3.5 py-1.5 rounded-xl bg-slate-950/50 border border-white/5 text-slate-300 font-mono text-[13px] hover:border-violet-500/50 hover:text-white transition-all shadow-inner hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] cursor-default">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Posts & Projects Area */}
                            <div className="space-y-4">
                                {/* Tab Navigation */}
                                <div className="flex items-center gap-6 border-b border-white/5">
                                    <button
                                        onClick={() => setActiveTab('posts')}
                                        className={`pb-4 text-[15px] font-medium transition-colors relative ${activeTab === 'posts'
                                            ? 'text-white'
                                            : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        Posts
                                        {activeTab === 'posts' && (
                                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-500 rounded-t-full drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('projects')}
                                        className={`pb-4 text-[15px] font-medium transition-colors relative ${activeTab === 'projects'
                                            ? 'text-white'
                                            : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        Projects
                                        {activeTab === 'projects' && (
                                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-500 rounded-t-full drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                                        )}
                                    </button>
                                </div>

                                {/* Tab Content */}
                                <div className="pt-4">
                                    {activeTab === 'posts' ? (
                                        <div className="space-y-4">
                                            {posts && posts.length > 0 ? (
                                                posts.map(post => (
                                                    <PostCard
                                                        key={post.id}
                                                        post={post}
                                                    />
                                                ))
                                            ) : (
                                                <div className="text-center py-16 text-slate-500 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                                                    <p className="font-light">No posts yet</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {projects && projects.length > 0 ? (
                                                projects.map(project => (
                                                    <ProjectCard key={project.id} project={project} />
                                                ))
                                            ) : (
                                                <div className="col-span-full text-center py-16 text-slate-500 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                                                    <p className="font-light">No projects yet</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Meta Details */}
                        <div className="space-y-6">
                            <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] space-y-5">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">About</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Calendar className="w-5 h-5 text-slate-500" />
                                        <div>
                                            <p className="text-[11px] text-slate-500 uppercase font-semibold">Joined</p>
                                            <p className="text-[14px] font-medium text-slate-300">{formatJoinDate(profileUser.createdAt || '')}</p>
                                        </div>
                                    </div>

                                    {(profileUser as any).location && (
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <MapPin className="w-5 h-5 text-slate-500" />
                                            <div>
                                                <p className="text-[11px] text-slate-500 uppercase font-semibold">Location</p>
                                                <p className="text-[14px] font-medium text-slate-300">{(profileUser as any).location}</p>
                                            </div>
                                        </div>
                                    )}

                                    {(profileUser as any).website && (
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Globe className="w-5 h-5 text-violet-500" />
                                            <div className="w-full overflow-hidden">
                                                <p className="text-[11px] text-slate-500 uppercase font-semibold">Website</p>
                                                <a
                                                    href={(profileUser as any).website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[14px] font-medium text-blue-400 hover:text-blue-300 transition-colors truncate block"
                                                >
                                                    {(profileUser as any).website.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Goals */}
                            {profileUser.goals && profileUser.goals.length > 0 && (
                                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">Goals</h3>
                                    <ul className="space-y-3.5">
                                        {profileUser.goals.map((goal, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-[14px] text-slate-300 font-light">
                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 shrink-0 drop-shadow-[0_0_5px_rgba(139,92,246,0.8)]" />
                                                <span className="leading-relaxed">{goal}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

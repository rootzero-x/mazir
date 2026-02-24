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
            <div className="h-full overflow-y-auto pb-20 md:pb-0 bg-slate-950">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Cover skeleton */}
                    <div className="h-64 bg-slate-900 animate-pulse rounded-b-2xl" />
                    {/* Profile info skeleton */}
                    <div className="px-4 space-y-4 -mt-16">
                        <div className="h-32 w-32 rounded-2xl bg-slate-900 animate-pulse border-4 border-slate-950" />
                        <div className="space-y-2">
                            <div className="h-8 w-48 bg-slate-900 rounded animate-pulse" />
                            <div className="h-4 w-32 bg-slate-900 rounded animate-pulse" />
                            <div className="h-4 w-64 bg-slate-900 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !profileUser) {
        return (
            <div className="h-full flex items-center justify-center p-4 bg-slate-950">
                <div className="text-center max-w-md">
                    <div className="mb-6">
                        <div className="h-20 w-20 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-slate-800">
                            <UserIcon className="h-10 w-10 text-slate-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">{error || "User not found"}</h2>
                        <p className="text-slate-400">
                            The profile you are looking for does not exist or has been removed.
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/feed')}
                        variant="secondary"
                    >
                        Return to Feed
                    </Button>
                </div>
            </div>
        );
    }

    const safeUser = getSafeUser(profileUser);

    return (
        <div className="h-full overflow-y-auto pb-20 md:pb-0 bg-slate-950">
            <div className="max-w-4xl mx-auto">
                {/* Cover Image */}
                <div className="relative h-64 bg-gradient-to-br from-slate-800 to-slate-900">
                    {safeUser.coverUrl && (
                        <img
                            src={safeUser.coverUrl}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                </div>

                {/* Profile Content */}
                <div className="px-4 md:px-8 pb-10 relative">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 mb-8">
                        {/* Avatar */}
                        <div className="h-32 w-32 shrink-0 rounded-2xl bg-slate-900 p-1 ring-4 ring-slate-950 shadow-2xl">
                            {safeUser.avatarUrl ? (
                                <img
                                    src={safeUser.avatarUrl}
                                    alt={safeUser.username}
                                    className="h-full w-full object-cover rounded-xl"
                                />
                            ) : (
                                <div className="h-full w-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-4xl font-bold text-white">
                                    {safeUser.username[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Name & Stats */}
                        <div className="flex-1 pb-2">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-white tracking-tight">
                                    {safeUser.displayName}
                                </h1>
                                {(profileUser.level !== undefined && profileUser.level !== null) && (
                                    <LevelBadge level={profileUser.level} />
                                )}
                            </div>
                            <p className="text-slate-400 font-medium">@{safeUser.username}</p>
                        </div>
                    </div>

                    {/* Bio & Details Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-10">
                        {/* Left: Bio & Info */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Bio */}
                            {profileUser.bio && (
                                <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50">
                                    <p className="text-slate-300 leading-relaxed text-lg">
                                        {profileUser.bio}
                                    </p>
                                </div>
                            )}

                            {/* Skills */}
                            {profileUser.skills && profileUser.skills.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profileUser.skills.map(skill => (
                                            <span key={skill} className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 text-sm border border-slate-800 font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Posts */}
                            <div className="space-y-4">
                                {/* Tab Navigation */}
                                <div className="flex items-center gap-2 border-b border-slate-800">
                                    <button
                                        onClick={() => setActiveTab('posts')}
                                        className={`px-6 py-3 font-semibold text-sm transition-all relative ${activeTab === 'posts'
                                            ? 'text-white'
                                            : 'text-slate-400 hover:text-slate-300'
                                            }`}
                                    >
                                        Posts
                                        {activeTab === 'posts' && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('projects')}
                                        className={`px-6 py-3 font-semibold text-sm transition-all relative ${activeTab === 'projects'
                                            ? 'text-white'
                                            : 'text-slate-400 hover:text-slate-300'
                                            }`}
                                    >
                                        Projects
                                        {activeTab === 'projects' && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
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
                                                <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                                                    <p>No posts yet</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-6">
                                            {projects && projects.length > 0 ? (
                                                projects.map(project => (
                                                    <ProjectCard key={project.id} project={project} />
                                                ))
                                            ) : (
                                                <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                                                    <p>No projects yet</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Meta Details */}
                        <div className="space-y-6">
                            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50 space-y-4">
                                <h3 className="text-sm font-semibold text-white mb-4">About</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Calendar className="w-5 h-5 text-slate-500" />
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-semibold">Joined</p>
                                            <p className="text-sm font-medium text-slate-300">{formatJoinDate(profileUser.createdAt || '')}</p>
                                        </div>
                                    </div>

                                    {(profileUser as any).location && (
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <MapPin className="w-5 h-5 text-slate-500" />
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-semibold">Location</p>
                                                <p className="text-sm font-medium text-slate-300">{(profileUser as any).location}</p>
                                            </div>
                                        </div>
                                    )}

                                    {(profileUser as any).website && (
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Globe className="w-5 h-5 text-slate-500" />
                                            <div className="w-full overflow-hidden">
                                                <p className="text-xs text-slate-500 uppercase font-semibold">Website</p>
                                                <a
                                                    href={(profileUser as any).website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-medium text-blue-400 hover:underline truncate block"
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
                                <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50">
                                    <h3 className="text-sm font-semibold text-white mb-4">Goals</h3>
                                    <ul className="space-y-3">
                                        {profileUser.goals.map((goal, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
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

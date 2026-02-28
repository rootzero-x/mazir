import { Link } from "react-router-dom";
import { FolderGit2, Globe, Code2, ShoppingBag } from "lucide-react";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const getTypeIcon = (type: string) => {
        switch (type.toUpperCase()) {
            case "SELL": return <ShoppingBag className="h-4 w-4 text-emerald-400" />;
            case "COLLAB": return <FolderGit2 className="h-4 w-4 text-blue-400" />;
            case "OPEN_SOURCE": return <Code2 className="h-4 w-4 text-violet-400" />;
            default: return <Globe className="h-4 w-4 text-slate-400" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type.toUpperCase()) {
            case "SELL": return "For Sale";
            case "COLLAB": return "Collaboration";
            case "OPEN_SOURCE": return "Open Source";
            default: return type;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type.toUpperCase()) {
            case "SELL": return "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
            case "COLLAB": return "border-blue-500/50 bg-blue-500/20 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]";
            case "OPEN_SOURCE": return "border-violet-500/50 bg-violet-500/20 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.2)]";
            default: return "border-slate-600/50 bg-slate-800/50 text-slate-300 shadow-[0_0_15px_rgba(148,163,184,0.1)]";
        }
    };

    const getHoverShadow = (type: string) => {
        switch (type.toUpperCase()) {
            case "SELL": return "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:border-emerald-500/30";
            case "COLLAB": return "hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:border-blue-500/30";
            case "OPEN_SOURCE": return "hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:border-violet-500/30";
            default: return "hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:border-white/10";
        }
    };

    return (
        <Link
            to={`/projects/${project.id || project.slug}`}
            className="group block h-full"
        >
            <article className={cn(
                "bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 h-full flex flex-col w-full relative isolation-auto",
                getHoverShadow(project.type)
            )}>
                {/* Project Image/Gradient */}
                <div className="h-48 w-full bg-slate-950 relative overflow-hidden shrink-0 border-b border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                    {project.images && project.images.length > 0 ? (
                        <img
                            src={project.images[0]}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center p-8 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-violet-900/20 pointer-events-none" />
                            <div className="text-center opacity-30 group-hover:opacity-60 transition-opacity z-10 drop-shadow-md">
                                <Code2 className="h-16 w-16 mx-auto mb-2" />
                            </div>
                        </div>
                    )}

                    {/* Type Badge */}
                    <div className={cn(
                        "absolute top-4 left-4 px-3 py-1 rounded-full text-[12px] font-bold border flex items-center gap-1.5 transition-all",
                        getTypeColor(project.type)
                    )}>
                        {getTypeIcon(project.type)}
                        {getTypeLabel(project.type)}
                    </div>
                </div>

                <div className="p-6 flex flex-col flex-1 bg-gradient-to-b from-transparent to-slate-900/20">
                    <div className="flex justify-between items-start gap-4 mb-3">
                        <h3 className="text-[20px] font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 tracking-tight drop-shadow-sm">
                            {project.title}
                        </h3>
                        {project.price && project.type === "SELL" && (
                            <span className="shrink-0 font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)] text-sm">
                                ${project.price}
                            </span>
                        )}
                    </div>

                    <p className="text-slate-400 text-[14px] line-clamp-2 mb-5 leading-relaxed font-light">
                        {project.pitch}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {project.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[12px] px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-300 font-mono transition-colors group-hover:border-violet-500/30 group-hover:text-violet-200">
                                {tag}
                            </span>
                        ))}
                        {project.tags.length > 3 && (
                            <span className="text-[12px] px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400 font-mono">
                                +{project.tags.length - 3}
                            </span>
                        )}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-800/50">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-slate-800 overflow-hidden ring-2 ring-slate-950">
                                {project.owner.avatarUrl ? (
                                    <img src={project.owner.avatarUrl} alt={project.owner.username} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-slate-700 text-xs font-bold text-slate-300">
                                        {project.owner.username[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-300 hover:underline">@{project.owner.username}</span>
                                <span className="text-[10px] text-slate-500">{formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</span>
                            </div>
                        </div>

                        <div className="text-xs font-medium text-slate-500 flex items-center gap-1 group-hover:text-white transition-colors">
                            View Details <Globe className="h-3 w-3" />
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}

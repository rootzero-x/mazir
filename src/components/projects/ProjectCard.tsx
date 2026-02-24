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
            case "SELL": return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
            case "COLLAB": return "border-blue-500/30 bg-blue-500/10 text-blue-300";
            case "OPEN_SOURCE": return "border-violet-500/30 bg-violet-500/10 text-violet-300";
            default: return "border-slate-700 bg-slate-800 text-slate-300";
        }
    };

    return (
        <Link
            to={`/projects/${project.id || project.slug}`}
            className="group block h-full"
        >
            <article className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-3xl overflow-hidden hover:border-slate-700 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10 h-full flex flex-col">
                {/* Project Image/Gradient */}
                <div className="h-48 w-full bg-slate-950 relative overflow-hidden">
                    {project.images && project.images.length > 0 ? (
                        <img
                            src={project.images[0]}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
                            <div className="text-center opacity-30 group-hover:opacity-50 transition-opacity">
                                <Code2 className="h-16 w-16 mx-auto mb-2" />
                            </div>
                        </div>
                    )}

                    {/* Type Badge */}
                    <div className={cn(
                        "absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md flex items-center gap-1.5 shadow-lg",
                        getTypeColor(project.type)
                    )}>
                        {getTypeIcon(project.type)}
                        {getTypeLabel(project.type)}
                    </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start gap-4 mb-3">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                            {project.title}
                        </h3>
                        {project.price && project.type === "SELL" && (
                            <span className="shrink-0 font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                                ${project.price}
                            </span>
                        )}
                    </div>

                    <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {project.pitch}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {project.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs px-2 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-500 font-mono">
                                #{tag}
                            </span>
                        ))}
                        {project.tags.length > 3 && (
                            <span className="text-xs px-2 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-500 font-mono">
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

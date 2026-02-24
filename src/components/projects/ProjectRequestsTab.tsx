import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ShoppingCart, Users, Check, X, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectRequest } from "@/lib/types";
import { toast } from "react-hot-toast";
import { getProjectRequests } from "@/lib/projectRequestsApi";
import { useAuth } from "@/context/AuthContext";

interface ProjectRequestsTabProps {
    projectId: string;
    onRequestClick: (request: ProjectRequest) => void;
    isOwner?: boolean;
}

export default function ProjectRequestsTab({ projectId, onRequestClick, isOwner }: ProjectRequestsTabProps) {
    const { user } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRestricted, setIsRestricted] = useState(false);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Use mode parameter: owner sees all requests, requester sees their own
                const mode = isOwner ? "owner" : "requester";
                console.log(`[ProjectRequestsTab] Fetching requests for project ${projectId}, mode: ${mode}`);

                const rawRequests = await getProjectRequests(projectId, { mode });
                console.log(`[ProjectRequestsTab] Received ${rawRequests.length} requests`, rawRequests);

                setRequests(rawRequests || []);
            } catch (error: any) {
                console.error("[ProjectRequestsTab] Failed to fetch requests:", error);
                if (error.response?.status === 403) {
                    setIsRestricted(true);
                } else {
                    toast.error("Failed to load requests");
                }
            } finally {
                setLoading(false);
            }
        };

        if (projectId) fetchRequests();
    }, [projectId, user, isOwner]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACCEPTED":
                return <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold uppercase tracking-wider"><Check className="h-3 w-3" /> Accepted</span>;
            case "REJECTED":
                return <span className="flex items-center gap-1 text-rose-400 text-xs font-bold uppercase tracking-wider"><X className="h-3 w-3" /> Rejected</span>;
            default:
                return <span className="flex items-center gap-1 text-amber-400 text-xs font-bold uppercase tracking-wider"><Clock className="h-3 w-3" /> Pending</span>;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "OFFER": return <ShoppingCart className="h-4 w-4 text-emerald-400" />;
            case "COLLAB": return <Users className="h-4 w-4 text-blue-400" />;
            default: return <MessageSquare className="h-4 w-4 text-violet-400" />;
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
                ))}
            </div>
        );
    }

    if (isRestricted) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-rose-900/10 rounded-3xl border border-dashed border-rose-800/30">
                <div className="h-16 w-16 rounded-full bg-rose-900/20 flex items-center justify-center border border-rose-800/30">
                    <X className="h-6 w-6 text-rose-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Access Denied</h3>
                    <p className="text-rose-300/80">Only the project creator can view requests.</p>
                </div>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                <div className="h-16 w-16 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                    <MessageSquare className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">No requests yet</h3>
                    <p className="text-slate-500">Wait for interested people to contact you.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((request: any) => {
                // Fallback for user data
                const sender = request.from_user || request.sender || request.user || { username: "User", avatarUrl: null };
                const username = sender.username || request.username || "User";
                const avatarUrl = sender.avatarUrl || sender.avatar_url;

                return (
                    <div
                        key={request.id}
                        onClick={() => onRequestClick(request)}
                        className="group relative flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800 hover:bg-slate-800/60 hover:border-slate-700 transition-all cursor-pointer"
                    >
                        {/* Avatar */}
                        <div className="shrink-0 h-12 w-12 rounded-full bg-slate-800 overflow-hidden ring-2 ring-slate-800 group-hover:ring-slate-700 transition-all">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={username} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-slate-700 text-white font-bold text-sm">
                                    {username[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white truncate">{sender.displayName || username}</span>
                                    <span className="text-slate-500 text-xs">@{username}</span>
                                </div>
                                <span className="text-xs text-slate-500 font-medium">
                                    {request.created_at ? formatDistanceToNow(new Date(request.created_at), { addSuffix: true }) : "Recently"}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wide border",
                                    request.type === "OFFER" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                        request.type === "COLLAB" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                            "bg-violet-500/10 text-violet-400 border-violet-500/20"
                                )}>
                                    {getTypeIcon(request.type)}
                                    {request.type === "OFFER" ? "Purchase Offer" : request.type === "COLLAB" ? "Collaboration" : "Question"}
                                </span>
                            </div>

                            <p className="text-sm text-slate-300 line-clamp-1">{request.message}</p>
                        </div>

                        {/* Status & Arrow */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                            {getStatusBadge(request.status)}
                            <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                )
            })}
        </div>
    );
}

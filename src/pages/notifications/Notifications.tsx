import { useMemo } from "react";
import { Bell, MessageSquare, UserPlus, Heart, CheckCheck, ArrowRight, ShoppingCart, Bot, ShieldAlert, ShieldCheck, Globe, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { isToday, isYesterday, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

// --- Types & Helpers ---

type NotificationType = "like" | "comment" | "follow" | "POST_HELPFUL" | "POST_COMMENT" | "USER_FOLLOW" | "PROJECT_REQUEST" | "PROJECT_REQUEST_REPLY" | "AI_REPORT";

interface GroupedNotifications {
    title: string;
    items: any[];
}

// Helper to parse date safely
function parseDate(dateStr: string | undefined | null): Date {
    if (!dateStr) return new Date();
    try {
        if (dateStr.includes("T")) return new Date(dateStr);
        if (dateStr.includes(" ")) return new Date(dateStr.replace(" ", "T"));
        return new Date(dateStr);
    } catch {
        return new Date();
    }
}

// Get icon and color based on type and status
function getNotificationStyle(type: NotificationType, status?: string) {
    const s = status?.toUpperCase();

    // Override colors based on status if applicable
    if (s === 'ACCEPTED' || s === 'PUBLISHED') {
        return {
            icon: ShieldCheck,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        };
    }
    if (s === 'REJECTED' || s === 'HIDDEN') {
        return {
            icon: ShieldAlert,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20"
        };
    }

    switch (type) {
        case "POST_HELPFUL":
        case "like":
            return {
                icon: Heart,
                color: "text-rose-500",
                bg: "bg-rose-500/10",
                border: "border-rose-500/20"
            };
        case "POST_COMMENT":
        case "comment":
        case "PROJECT_REQUEST_REPLY":
            return {
                icon: MessageSquare,
                color: "text-blue-500",
                bg: "bg-blue-500/10",
                border: "border-blue-500/20"
            };
        case "USER_FOLLOW":
        case "follow":
            return {
                icon: UserPlus,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20"
            };
        case "PROJECT_REQUEST":
            return {
                icon: ShoppingCart,
                color: "text-amber-500",
                bg: "bg-amber-500/10",
                border: "border-amber-500/20"
            };
        case "AI_REPORT":
            return {
                icon: Bot,
                color: "text-violet-500",
                bg: "bg-violet-500/10",
                border: "border-violet-500/20"
            };
        default:
            return {
                icon: Bell,
                color: "text-violet-500",
                bg: "bg-violet-500/10",
                border: "border-violet-500/20"
            };
    }
}

// --- Components ---

const NotificationItem = ({ notification, onClick }: { notification: any, onClick: () => void }) => {
    const isUnread = notification.is_read === false;

    // Parse payload safely
    const payload = useMemo(() => {
        if (!notification.payload_json) return null;
        try {
            return typeof notification.payload_json === 'string'
                ? JSON.parse(notification.payload_json)
                : notification.payload_json;
        } catch {
            return null;
        }
    }, [notification.payload_json]);

    const status = payload?.status || notification.request?.status || payload?.request?.status;
    const style = getNotificationStyle(notification.type, status);
    const date = parseDate(notification.createdAt || notification.created_at);
    const actor = notification.actor || { username: "User", avatarUrl: null };
    const postSnippet = notification.post?.content;
    const projectTitle = notification.project?.title || "Project";

    // Construct message
    let message = "";
    let subMessage = "";

    switch (notification.type) {
        case "POST_HELPFUL":
        case "like":
            message = `${actor.username} liked your post`;
            break;
        case "POST_COMMENT":
        case "comment":
            message = `${actor.username} commented on your post`;
            subMessage = `"${notification.content || 'Nice post!'}"`;
            break;
        case "USER_FOLLOW":
        case "follow":
            message = `${actor.username} started following you`;
            break;
        case "PROJECT_REQUEST":
            message = `${actor.username} sent a request for ${projectTitle}`;
            subMessage = "Check the request details";
            break;
        case "PROJECT_REQUEST_REPLY": {
            const s = status?.toUpperCase();
            if (s === 'ACCEPTED') {
                message = `Request Accepted: ${projectTitle}`;
                subMessage = `${actor.username} accepted your request. You can now start collaborating!`;
            } else if (s === 'REJECTED') {
                message = `Request Declined: ${projectTitle}`;
                subMessage = `${actor.username} declined this request. Check for details.`;
            } else {
                message = `${actor.username} replied to your request on ${projectTitle}`;
                subMessage = "New message in thread";
            }
            break;
        }
        case "AI_REPORT": {
            const s = status?.toLowerCase();
            const entity = payload?.entity_type?.toLowerCase() || 'content';

            if (s === 'published') {
                message = `AI Report: Content Accepted ✅`;
                subMessage = `Your ${entity} has been approved and is now live.`;
            } else if (s === 'hidden') {
                message = `AI Report: Content Rejected ❌`;
                subMessage = payload?.reason || `Your ${entity} was hidden due to policy violations.`;
            } else if (s === 'review') {
                message = `AI Report: Under Review 🔍`;
                subMessage = `Your ${entity} is flagged for manual moderator check.`;
            } else {
                message = "AI System Notification";
                subMessage = payload?.reason || "Evaluation update for your content.";
            }
            break;
        }
        default:
            message = `${actor.username} interacted with you`;
    }

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative flex gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
                "hover:scale-[1.01] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
                isUnread
                    ? "bg-slate-800/40 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)] backdrop-blur-md"
                    : "bg-slate-900/40 border-white/5 hover:bg-slate-800/40 hover:border-white/10 backdrop-blur-sm"
            )}
        >
            {/* Unread Indicator */}
            {isUnread && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
            )}

            {/* Icon / Avatar */}
            <div className="relative shrink-0">
                <div className={cn(
                    "h-12 w-12 rounded-[1.2rem] flex items-center justify-center ring-2 ring-slate-900/50 shadow-inner",
                    style.bg,
                    style.color
                )}>
                    {actor.avatarUrl ? (
                        <img
                            src={actor.avatarUrl}
                            alt={actor.username}
                            className="h-full w-full rounded-[1.2rem] object-cover"
                        />
                    ) : (
                        <style.icon className="h-6 w-6 drop-shadow-[0_0_8px_currentColor]" />
                    )}
                </div>
                {/* Mini Type Icon Badge */}
                {actor.avatarUrl && (
                    <div className={cn(
                        "absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-slate-950 shadow-sm",
                        "bg-slate-900 text-white"
                    )}>
                        <style.icon className={cn("h-3 w-3", style.color)} />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-start gap-2">
                    <p className={cn("text-[15px] font-medium leading-normal drop-shadow-sm", isUnread ? "text-white" : "text-slate-200")}>
                        {message}
                    </p>
                    <span className="text-[10px] sm:text-xs text-slate-500 whitespace-nowrap font-medium tracking-wide">
                        {formatDistanceToNow(date, { addSuffix: true })}
                    </span>
                </div>

                {subMessage && (
                    <p className="text-[14px] text-blue-400/90 mt-0.5 font-medium line-clamp-1">
                        {subMessage}
                    </p>
                )}

                {postSnippet && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-950/50 border border-white/5 group-hover:border-white/10 transition-colors shadow-inner">
                        <p className="text-[13px] text-slate-400 line-clamp-2 font-light italic">
                            "{postSnippet}"
                        </p>
                    </div>
                )}

                {notification.type === "AI_REPORT" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {(() => {
                            const s = status?.toLowerCase();

                            if (s === 'published') return (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                    <Globe className="w-3.5 h-3.5" /> Approved
                                </span>
                            );
                            if (s === 'hidden') return (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                                    <EyeOff className="w-3.5 h-3.5" /> Rejected
                                </span>
                            );
                            if (s === 'review') return (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                    <Search className="w-3.5 h-3.5" /> In Review
                                </span>
                            );
                            return null;
                        })()}
                    </div>
                )}
            </div>

            {/* Arrow */}
            <div className="self-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <ArrowRight className="h-5 w-5 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
            </div>
        </div>
    );
};

export default function Notifications() {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
    const navigate = useNavigate();

    // Group notifications by date
    const groupedNotifications = useMemo(() => {
        const groups: GroupedNotifications[] = [
            { title: "New", items: [] },
            { title: "Today", items: [] },
            { title: "Yesterday", items: [] },
            { title: "Previous", items: [] },
        ];

        notifications.forEach(n => {
            if (n.is_read === false) {
                groups[0].items.push(n);
                return;
            }

            const date = parseDate(n.createdAt || n.created_at);
            if (isToday(date)) {
                groups[1].items.push(n);
            } else if (isYesterday(date)) {
                groups[2].items.push(n);
            } else {
                groups[3].items.push(n);
            }
        });

        // Filter out empty groups
        return groups.filter(g => g.items.length > 0);
    }, [notifications]);

    const handleNotificationClick = async (n: any) => {
        // Immediate UI update for read status
        if (n.is_read === false) {
            markAsRead(n.id); // This should update local context state immediately ideally
        }

        let deepLink = n.deep_link;

        // Try to extract from payload_json
        if (!deepLink && n.payload_json) {
            try {
                const payload = typeof n.payload_json === 'string' ? JSON.parse(n.payload_json) : n.payload_json;
                deepLink = payload.deep_link || payload.deepLink;
            } catch (e) {
                console.error("Failed to parse payload_json", e);
            }
        }

        console.log("Notification Click DeepLink:", deepLink, "Notification:", n);

        if (deepLink) {
            navigate(deepLink);
            return;
        }

        // AI Report handling
        if (n.type === "AI_REPORT") {
            const payload = typeof n.payload_json === 'string' ? JSON.parse(n.payload_json) : n.payload_json;
            const entityType = payload?.entity_type;
            const entityId = payload?.entity_id;

            if (entityType === 'POST' && entityId) {
                navigate(`/thread/${entityId}`);
                return;
            }
            if (entityType === 'PROJECT' && entityId) {
                navigate(`/projects/${entityId}`);
                return;
            }
        }

        // Fallback Logic
        if (n.type === "PROJECT_REQUEST" || n.type === "PROJECT_REQUEST_REPLY") {
            const projectId = n.project_id || n.project?.id;
            const requestId = n.request_id || n.request?.id; // Try top level first

            if (projectId) {
                let url = `/projects/${projectId}?tab=requests`;
                if (requestId) url += `&rid=${requestId}`;
                navigate(url);
                return;
            }
        }

        const postId = n.post_id || n.post?.id;
        if (postId) {
            navigate(`/thread/${postId}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 pb-24 px-4 md:px-8 max-w-4xl mx-auto space-y-6 relative bg-transparent">
                <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none z-0" />

                {/* Skeleton Header */}
                <div className="h-24 w-full bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] animate-pulse" />

                {/* Skeleton Items */}
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-28 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/5 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full relative overflow-x-hidden bg-transparent">
            {/* Ambient Glows */}
            <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-sky-500/10 blur-[150px] pointer-events-none z-0" />

            <div className="relative pb-24 md:pt-[calc(env(safe-area-inset-top,0px)+1rem)] max-w-4xl mx-auto z-10 px-4 md:px-0">
                {/* Glass Header */}
                <div className="sticky top-[calc(env(safe-area-inset-top,0px)+1rem)] z-30 bg-slate-900/40 backdrop-blur-xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-3xl p-5 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3 drop-shadow-sm">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="inline-flex items-center justify-center h-7 min-w-[1.75rem] px-2.5 text-[13px] font-bold text-white bg-violet-600 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.6)]">
                                        {unreadCount}
                                    </span>
                                )}
                            </h1>
                            <p className="text-[15px] font-light text-slate-300 mt-1">Stay updated with your community interactions</p>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                            className={cn(
                                "group bg-slate-950/50 border-white/10 text-slate-300 hover:text-white hover:border-violet-500/50 hover:bg-violet-600/20 transition-all rounded-xl h-11 px-5 shadow-inner",
                                unreadCount === 0 && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <CheckCheck className="h-4 w-4 mr-2 text-violet-400 group-hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)] transition-all" />
                            <span className="font-medium tracking-wide">Mark all as read</span>
                        </Button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-10">
                    {groupedNotifications.length > 0 ? (
                        groupedNotifications.map((group, groupIndex) => (
                            <div key={group.title} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards" style={{ animationDelay: `${groupIndex * 100}ms` }}>
                                <div className="flex items-center gap-4 px-2">
                                    <h2 className={cn(
                                        "text-sm font-bold uppercase tracking-widest",
                                        group.title === "New" ? "text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" : "text-slate-400"
                                    )}>
                                        {group.title}
                                    </h2>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                </div>
                                <div className="space-y-3">
                                    {group.items.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onClick={() => handleNotificationClick(notification)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                            <div className="relative">
                                <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
                                <div className="h-24 w-24 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center relative shadow-inner">
                                    <Bell className="h-10 w-10 text-violet-400 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white drop-shadow-sm">All caught up!</h3>
                                <p className="text-[15px] font-light text-slate-300 max-w-sm mx-auto leading-relaxed">
                                    You have no new notifications. Interact with the community to get updates.
                                </p>
                            </div>
                            <Button
                                onClick={() => navigate('/feed')}
                                className="mt-4 bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border-0 rounded-xl px-8 h-12 font-bold transition-all transform hover:-translate-y-0.5"
                            >
                                Browse Feed
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

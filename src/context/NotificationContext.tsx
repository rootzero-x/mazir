import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "@/lib/api";

interface Notification {
    id: string;
    type: string; // POST_HELPFUL, POST_COMMENT, USER_FOLLOW, etc.
    actor: { username: string; displayName?: string; avatarUrl?: string };
    content?: string; // Comment text for POST_COMMENT
    post?: {
        id: string;
        content: string; // Post snippet
        author?: { username: string };
    };
    post_id?: string; // For navigation
    createdAt: string;
    created_at?: string; // Backend might use snake_case
    is_read: boolean; // STRICT: always use is_read from backend
    read_at?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // GLOBAL RULE: Always fetch from backend, never cache
    const fetchNotifications = async () => {
        try {
            const res = await api.get<any>("/notifications");
            const data = res.data;

            let loadedNotifs: Notification[] = [];
            if (Array.isArray(data)) {
                loadedNotifs = data;
            } else if (data?.notifications && Array.isArray(data.notifications)) {
                loadedNotifs = data.notifications;
            } else if (data?.data) {
                if (Array.isArray(data.data)) {
                    loadedNotifs = data.data;
                } else if (data.data.notifications && Array.isArray(data.data.notifications)) {
                    loadedNotifs = data.data.notifications;
                }
            }

            console.log("[NotificationContext] Fetched notifications:", loadedNotifs.length);

            // STRICT: Count only where is_read === false (not undefined, not truthy check)
            const unread = loadedNotifs.filter((n: any) => n.is_read === false).length;

            console.log("[NotificationContext] Unread count from backend:", unread);

            setNotifications(loadedNotifs);
            setUnreadCount(unread);
        } catch (error) {
            console.error("[NotificationContext] Failed to fetch:", error);
        } finally {
            setLoading(false);
        }
    };

    // CRITICAL: After marking as read, ALWAYS refetch from backend
    const markAsRead = async (id: string) => {
        try {
            console.log("[NotificationContext] Marking notification as read:", id);

            // Optimistic UI update
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));

            // Send to backend
            await api.post(`/notifications/${id}/read`);

            // CRITICAL: Refetch to get backend truth
            console.log("[NotificationContext] Refetching after mark as read...");
            await fetchNotifications();
        } catch (error) {
            console.error("[NotificationContext] Failed to mark as read:", error);
            // Revert optimistic update by refetching
            await fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
        try {
            console.log("[NotificationContext] Marking all as read");

            // Optimistic UI update
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);

            // Send to backend
            await api.post("/notifications/read-all");

            // CRITICAL: Refetch to get backend truth
            console.log("[NotificationContext] Refetching after mark all as read...");
            await fetchNotifications();
        } catch (error) {
            console.error("[NotificationContext] Failed to mark all as read:", error);
            // Revert by refetching
            await fetchNotifications();
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchNotifications();

        // Auto-refresh every 10 seconds to stay in sync with backend
        const interval = setInterval(fetchNotifications, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                fetchNotifications,
                markAsRead,
                markAllAsRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within NotificationProvider");
    }
    return context;
}

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import api from "@/lib/api";
import type { Room } from "@/lib/types";
import RoomsList from "./RoomsList";
import RoomChat from "./RoomChat";
import RoomInfoDrawer from "./RoomInfoDrawer";
import ErrorState from "@/components/ui/ErrorState";

export default function RoomsLayout() {
    const { slug } = useParams<{ slug: string }>();

    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    // Fetch Rooms List
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await api.get("/rooms");
                // Normalize data
                console.log("[RoomsLayout] Raw API response:", res);
                const data = res.data;

                let items: any[] = [];
                if (Array.isArray(data)) {
                    items = data;
                } else if (data?.rooms && Array.isArray(data.rooms)) {
                    items = data.rooms;
                } else if (data?.data) {
                    // Check if data.data is the array
                    if (Array.isArray(data.data)) {
                        items = data.data;
                    }
                    // Check if data.data is an object containing rooms
                    else if (data.data.rooms && Array.isArray(data.data.rooms)) {
                        items = data.data.rooms;
                    }
                }

                if (items.length === 0) {
                    // Last ditch effort: check if data itself is the wrapper but keys are unknown, 
                    // but likely "rooms" is the key inside data.data if it's not "rooms" inside data directly.
                    // It is already covered above.
                    console.warn("[RoomsLayout] No items found. data.data type:", typeof data?.data);
                    if (typeof data?.data === 'object') {
                        console.log("[RoomsLayout] Keys in data.data:", Object.keys(data.data));
                    }
                }

                console.log("[RoomsLayout] Extracted items:", items);
                if (items.length === 0) {
                    console.warn("[RoomsLayout] No items found in response. Check API structure.");
                    console.log("[RoomsLayout] Keys in data:", Object.keys(data));
                }

                // Map items to Room interface to handle snake_case
                const mappedRooms: Room[] = items.map((item: any) => ({
                    slug: item.slug,
                    name: item.name,
                    description: item.description,
                    memberCount: item.memberCount || item.members_count || 0,
                    activeThreads: item.activeThreads || item.active_threads || 0,
                    icon: item.icon,
                    unreadCount: item.unreadCount || item.unread_count || 0,
                    onlineCount: item.onlineCount || item.online_count || 0,
                    lastMessage: item.lastMessage || item.last_message
                }));

                setRooms(mappedRooms);
            } catch (err: any) {
                console.error("Failed to load rooms:", err);
                setError("Failed to load rooms list.");
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
        // Poll for rooms list updates (online counts etc)
        const interval = setInterval(fetchRooms, 15000);
        return () => clearInterval(interval);
    }, []);

    // Get Active Room
    const activeRoom = slug ? rooms.find((r) => r.slug === slug) : null;

    // Toggle Info Drawer
    const handleToggleInfo = () => setIsInfoOpen(!isInfoOpen);

    if (error) {
        return <ErrorState message={error} onRetry={() => window.location.reload()} />;
    }

    return (
        <div className="flex h-full w-full overflow-hidden bg-transparent">
            {/* Left Panel: Rooms List */}
            {/* Hidden on mobile if room is selected */}
            <div
                className={`${slug ? "hidden" : "flex"
                    } w-full flex-col border-r border-white/5 bg-slate-900/40 backdrop-blur-md md:flex md:w-80 lg:w-96 shrink-0 h-full relative z-10`}
            >
                <RoomsList
                    rooms={rooms}
                    loading={loading}
                    currentSlug={slug}
                    onRoomSelect={() => {
                        // On mobile, navigation handles view switch
                        if (window.innerWidth < 768) {
                            // potentially handle mobile logic if needed, usually router handles it
                        }
                    }}
                />
            </div>

            {/* Center Panel: Chat */}
            {/* Full width on mobile if room selected, else hidden */}
            <div className={`flex-1 flex flex-col min-h-0 bg-slate-950/20 backdrop-blur-sm relative z-0 ${!slug ? "hidden md:flex" : "flex"}`}>
                {activeRoom ? (
                    <RoomChat room={activeRoom} onToggleInfo={handleToggleInfo} />
                ) : (
                    // Empty State (Desktop only)
                    <div className="hidden h-full flex-col items-center justify-center md:flex p-6 group">
                        <div className="mb-6 h-24 w-24 rounded-[2rem] bg-slate-900/50 backdrop-blur-md border border-white/5 flex items-center justify-center shadow-[inset_0_0_20px_rgba(139,92,246,0.1)] transition-transform group-hover:scale-105 duration-500">
                            <span className="text-5xl drop-shadow-lg filter">💬</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Select a community</h2>
                        <p className="max-w-xs text-center text-slate-400 font-light leading-relaxed">
                            Choose a room from the sidebar to join the conversation and share your insights.
                        </p>
                    </div>
                )}
            </div>

            {/* Room Info Drawer - Conditional Render or Overlay */}
            <RoomInfoDrawer
                room={activeRoom || null}
                isOpen={isInfoOpen}
                onClose={() => setIsInfoOpen(false)}
            />
        </div>
    );
}

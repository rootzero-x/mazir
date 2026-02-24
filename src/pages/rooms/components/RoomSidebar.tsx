import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Hash, Search } from "lucide-react";
import api from "@/lib/api";
import type { Room } from "@/lib/types";

export function RoomSidebar() {
    const { slug } = useParams<{ slug: string }>();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await api.get("/rooms");
                // Normalize data (same logic as Rooms.tsx)
                const payload = res.data;
                let items: Room[] = [];
                if (Array.isArray(payload)) items = payload;
                else if (payload?.rooms) items = payload.rooms;
                else if (payload?.data?.rooms) items = payload.data.rooms;
                else if (payload?.data) items = payload.data;

                setRooms(items);
            } catch (err) {
                console.error("Failed to load sidebar rooms", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    if (loading) return <div className="w-80 bg-[#060910] border-r border-white/5 hidden md:flex flex-col p-4"><div className="animate-pulse bg-white/5 h-10 w-full rounded-lg" /></div>;

    return (
        <div className="hidden md:flex w-80 shrink-0 flex-col border-r border-white/5 bg-[#060910]">
            <div className="p-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-slate-100 mb-4 px-2">Rooms</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Filter rooms..."
                        className="w-full bg-[#121826] border border-white/5 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-600"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {rooms.map(room => (
                    <Link
                        key={room.slug}
                        to={`/rooms/${room.slug}`}
                        className={`group flex items-center gap-3 rounded-xl p-2.5 transition-all
                            ${slug === room.slug
                                ? "bg-blue-600/10 text-blue-400"
                                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                            }
                        `}
                    >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors
                             ${slug === room.slug ? "bg-blue-600/20 text-blue-400" : "bg-slate-800/50 text-slate-500 group-hover:bg-slate-700/50"}
                         `}>
                            {room.icon ? <span className="text-lg">{room.icon}</span> : <Hash className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className="font-medium truncate">{room.name}</span>
                                {room.unreadCount && room.unreadCount > 0 && (
                                    <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                                        {room.unreadCount}
                                    </span>
                                )}
                            </div>
                            <p className="truncate text-xs text-slate-500 opacity-70">
                                {room.memberCount} members
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

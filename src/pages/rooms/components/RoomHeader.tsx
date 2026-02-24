import { ArrowLeft, MoreVertical, Hash, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Room } from "@/lib/types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RoomHeaderProps {
    room: Room;
    onOpenInfo: () => void;
}

export function RoomHeader({ room, onOpenInfo }: RoomHeaderProps) {
    const isVerified = false;

    return (
        <div className="sticky top-0 z-20 flex h-16 min-h-[64px] items-center justify-between border-b border-white/5 bg-[#070A12]/80 px-4 backdrop-blur-md transition-all">
            <div className="flex items-center gap-3 overflow-hidden">
                <Link
                    to="/rooms"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/5 hover:text-white md:hidden"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 text-blue-400 border border-blue-500/10">
                    {room.icon ? <span className="text-xl">{room.icon}</span> : <Hash className="h-5 w-5" />}
                </div>

                <div
                    className="flex flex-col overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={onOpenInfo}
                >
                    <h1 className="flex items-center gap-1.5 text-base font-bold text-slate-100 truncate">
                        {room.name}
                        {isVerified && <ShieldCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                    </h1>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 truncate">
                        {room.memberCount !== undefined && (
                            <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {room.memberCount} members
                            </span>
                        )}
                        {room.onlineCount !== undefined && room.onlineCount > 0 && (
                            <>
                                <span className="h-1 w-1 rounded-full bg-slate-700 mx-1" />
                                <span className="text-green-400">{room.onlineCount} online</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-white/5 hover:text-white shrink-0">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#0B1220] border-white/10 text-slate-200">
                    <DropdownMenuItem onClick={onOpenInfo} className="cursor-pointer hover:bg-white/5 focus:bg-white/5">
                        Room Info
                    </DropdownMenuItem>
                    {/* Placeholder action */}
                    <DropdownMenuItem className="cursor-pointer text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 hover:text-red-300 focus:text-red-300">
                        Leave Room
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

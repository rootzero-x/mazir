import { NavLink } from "react-router-dom";
import { Home, Hash, PlusSquare, Bell, User } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useNotifications } from "@/context/NotificationContext";
import { cn } from "@/lib/utils";

export default function BottomNav() {
    const { openCreatePost } = useSidebar();
    const { unreadCount } = useNotifications();

    const navItems = [
        { to: "/feed", icon: Home, label: "Feed" },
        { to: "/rooms", icon: Hash, label: "Rooms" },
        // Post handled separately
        { to: "/notifications", icon: Bell, label: "Alerts", badge: unreadCount },
        { to: "/profile/me", icon: User, label: "Me" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/60 backdrop-blur-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.5)] lg:hidden h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)]">
            <div className="flex items-center justify-between px-4 h-full max-w-lg mx-auto">
                {/* Left side items */}
                {navItems.slice(0, 2).map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all duration-300",
                                isActive ? "text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)] scale-110" : "text-slate-500 hover:text-slate-300"
                            )
                        }
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-[10px] font-bold tracking-tight uppercase">{item.label}</span>
                    </NavLink>
                ))}

                {/* Center Action Button */}
                <div className="flex-1 flex justify-center">
                    <button
                        onClick={openCreatePost}
                        className="flex flex-col items-center justify-center -mt-8 transition-transform active:scale-90 group"
                        title="New Post"
                    >
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] ring-4 ring-slate-950/80 backdrop-blur-xl border border-white/20 group-hover:scale-105 transition-all">
                            <PlusSquare className="h-7 w-7 drop-shadow-md" />
                        </div>
                    </button>
                </div>

                {/* Right side items */}
                {navItems.slice(2).map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all duration-300",
                                isActive ? "text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)] scale-110" : "text-slate-500 hover:text-slate-300"
                            )
                        }
                    >
                        <div className="relative">
                            <item.icon className="h-5 w-5" />
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full border border-slate-950 shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                                    {item.badge > 99 ? '99+' : item.badge}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-bold tracking-tight uppercase">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}

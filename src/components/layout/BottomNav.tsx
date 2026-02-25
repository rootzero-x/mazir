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
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/80 backdrop-blur-xl lg:hidden h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)]">
            <div className="flex items-center justify-between px-4 h-full max-w-lg mx-auto">
                {/* Left side items */}
                {navItems.slice(0, 2).map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all duration-300",
                                isActive ? "text-blue-500 scale-110" : "text-slate-500 hover:text-slate-300"
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
                        className="flex flex-col items-center justify-center -mt-8 transition-transform active:scale-90"
                        title="New Post"
                    >
                        <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/50 ring-4 ring-slate-950">
                            <PlusSquare className="h-8 w-8" />
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
                                isActive ? "text-blue-500 scale-110" : "text-slate-500 hover:text-slate-300"
                            )
                        }
                    >
                        <div className="relative">
                            <item.icon className="h-5 w-5" />
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full border border-slate-950">
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

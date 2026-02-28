import { Home, Hash, FolderGit2, Bell, User, Settings, LogOut, PlusSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

export default function Sidebar() {
    const { logout } = useAuth();
    const { unreadCount } = useNotifications();
    const { isOpen, toggle, openCreatePost } = useSidebar();

    const navItems = [
        { to: "/feed", icon: Home, label: "Feed" },
        { to: "/rooms", icon: Hash, label: "Rooms" },
        { to: "/projects", icon: FolderGit2, label: "Projects" },
        { to: "/notifications", icon: Bell, label: "Notifications", badge: unreadCount },
        { to: "/profile/me", icon: User, label: "Profile" },
        { to: "/settings", icon: Settings, label: "Settings" },
    ];

    return (
        <aside
            className={cn(
                "hidden lg:flex flex-col border-r border-white/5 bg-slate-950/40 backdrop-blur-2xl shadow-[8px_0_32px_rgba(0,0,0,0.3)] h-full transition-all duration-300 relative sticky top-0 z-40",
                isOpen ? "w-64" : "w-[72px]"
            )}
        >
            {/* Desktop Toggle */}
            <button
                onClick={toggle}
                className="absolute -right-3 top-9 z-[60] flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 backdrop-blur-md text-slate-400 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:text-white hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all hover:scale-110 active:scale-95"
            >
                {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>

            {/* Content */}
            <div className="flex flex-col h-full overflow-hidden w-full">
                {/* Header */}
                <div className={cn("p-6 border-b border-white/5 flex items-center shrink-0 h-20 transition-all", isOpen ? "justify-start px-6" : "justify-center px-0")}>
                    <Link to="/feed" className="flex items-center gap-3 overflow-hidden group">
                        <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(139,92,246,0.4)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] group-hover:scale-105 transition-all">
                            M
                        </div>
                        <span className={cn("text-xl font-bold tracking-tight text-white transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0 w-0 hidden")}>
                            MAZIR
                        </span>
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 scrollbar-none">
                    <div className="mb-6">
                        <button
                            onClick={openCreatePost}
                            className={cn(
                                "w-full flex items-center gap-3 bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:bg-violet-500 border-0 h-11 rounded-xl font-bold transition-all duration-300 active:scale-95",
                                isOpen ? "px-4 justify-start" : "px-0 justify-center w-11 mx-auto"
                            )}
                            title="New Post"
                        >
                            <PlusSquare className="w-5 h-5 shrink-0" />
                            <span className={cn("transition-all duration-300", isOpen ? "opacity-100" : "opacity-0 w-0 hidden")}>
                                New Post
                            </span>
                        </button>
                    </div>

                    {navItems.map(({ to, icon: Icon, label, badge }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 py-3 rounded-xl transition-all group relative duration-200",
                                    isOpen ? "px-4" : "justify-center px-0 w-11 mx-auto",
                                    isActive
                                        ? "bg-violet-600/20 text-white font-semibold shadow-inner border border-white/10"
                                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                )
                            }
                            title={!isOpen ? label : undefined}
                        >
                            <div className="relative">
                                <Icon className="h-5 w-5 shrink-0" />
                                {badge !== undefined && badge > 0 && (
                                    <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                                        {badge > 99 ? '99+' : badge}
                                    </span>
                                )}
                            </div>
                            <span className={cn("transition-all duration-300 whitespace-nowrap", isOpen ? "opacity-100" : "opacity-0 w-0 hidden")}>
                                {label}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 shrink-0">
                    <button
                        onClick={() => logout()}
                        className={cn(
                            "flex w-full items-center gap-3 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors",
                            isOpen ? "px-4" : "justify-center px-0 w-11 mx-auto"
                        )}
                        title={!isOpen ? "Log Out" : undefined}
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className={cn("transition-all duration-300 whitespace-nowrap", isOpen ? "opacity-100" : "opacity-0 w-0 hidden")}>
                            Log Out
                        </span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

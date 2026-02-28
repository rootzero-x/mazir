import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AuthLayout() {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (isAuthenticated && user) {
        return <Navigate to="/feed" replace />;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
            {/* Ambient Glows */}
            <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-violet-600/15 blur-[150px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-sky-500/10 blur-[150px] pointer-events-none z-0" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Outlet />
            </div>
        </div>
    );
}

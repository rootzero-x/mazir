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
        <div className="flex min-h-screen items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
            {/* Background Gradient Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md">
                <Outlet />
            </div>
        </div>
    );
}

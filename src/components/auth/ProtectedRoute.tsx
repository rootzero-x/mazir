import { isPublicAuthRoute } from "@/lib/navigation";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { PermissionLevel } from "@/lib/types";

interface ProtectedRouteProps {
    requiredLevel?: PermissionLevel;
}

/**
 * Map onboarding_state to the correct route
 */
const getRouteByOnboardingState = (state: string | undefined): string | null => {
    switch (state) {
        case "NOT_STARTED":
        case "PROFILE_SETUP":
            return "/onboarding/setup";
        case "RULES":
            return "/onboarding/rules";
        case "ROOMS_PICK":
            return "/onboarding/rooms";
        case "DONE":
            return null; // Allow access to protected routes
        default:
            return null;
    }
};

export default function ProtectedRoute({ requiredLevel }: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const location = useLocation();

    // Suppress unused warning
    void requiredLevel;

    // CRITICAL: Public auth/onboarding routes should NEVER be protected
    // This prevents forced redirects on /auth/* and /onboarding/* pages
    if (isPublicAuthRoute(location.pathname)) {
        return <Outlet />;
    }

    // 1) Loading State
    if (isLoading) {
        console.log("[ProtectedRoute] Loading...");
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    // 2) Unauthenticated State
    if (!isAuthenticated || !user) {
        console.log("[ProtectedRoute] User not authenticated, redirecting to /auth/welcome");
        return <Navigate to="/auth/welcome" state={{ from: location }} replace />;
    }

    // 3) Onboarding State Check
    // "DONE" means user can access the app (feed, etc.)
    const onboardingState = user.onboarding_state;
    console.log("[ProtectedRoute] State Check:", {
        user: user.username,
        onboarding_state: onboardingState,
        next: user.next,
        path: location.pathname
    });

    if (onboardingState !== "DONE") {
        const targetPath = getRouteByOnboardingState(onboardingState);
        console.log("[ProtectedRoute] Incomplete onboarding. State:", onboardingState, "Target:", targetPath);

        if (targetPath && location.pathname !== targetPath) {
            return <Navigate to={targetPath} replace />;
        }
    }

    // 4) Access Granted
    console.log("[ProtectedRoute] Access granted to:", location.pathname);
    return <Outlet />;
}

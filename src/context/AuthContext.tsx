import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";
import { tokenStorage } from "../lib/tokenStorage";
import type { AuthState, User } from "../lib/types";
import toast from "react-hot-toast";

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            console.log("[AuthContext] Checking authentication...");
            const { data } = await api.get<{ user: User }>("/auth/me");

            // Normalize user data if needed (some backends wrap it differently)
            const rawUser = data.user || (data as any).data?.user;

            // Strict mapping as requested
            const safeRawUser = rawUser as any;

            const mappedUser: User = {
                id: safeRawUser.id,
                username: safeRawUser.username || "User",
                email: safeRawUser.email,
                avatarUrl: safeRawUser.avatar_url || safeRawUser.avatarUrl || null,
                coverUrl: safeRawUser.cover_url || safeRawUser.coverUrl || null,
                onboarding_state: safeRawUser.onboarding_state || "DONE", // Default to DONE if missing/null to avoid blocking
                next: safeRawUser.next,
                // Optional fields
                level: safeRawUser.level,
                skills: safeRawUser.skills || [],
                goals: safeRawUser.goals || [],
                createdAt: safeRawUser.created_at || safeRawUser.createdAt
            };

            console.log("[AuthContext] Auth check successful:", {
                username: mappedUser.username,
                onboarding_state: mappedUser.onboarding_state,
            });

            setUser(mappedUser);
            return mappedUser;
        } catch (error) {
            // Silent catch for 401/403
            console.log("[AuthContext] Auth check failed (401/403), user not authenticated");
            setUser(null);
            // tokenStorage.remove(); // REMOVED per instruction: keep token even if 401
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();

        const handleAuthLogout = () => {
            setUser(null);
            tokenStorage.remove();
            delete api.defaults.headers.common['Authorization'];
        };

        window.addEventListener("auth:logout", handleAuthLogout);
        return () => window.removeEventListener("auth:logout", handleAuthLogout);
    }, []);

    const login = async (credentials: any) => {
        try {
            console.log("[AuthContext] Attempting login...");
            const response = await api.post("/auth/login", credentials);
            console.log("[AuthContext] Login API call successful:", response.data);

            // Extract token from response (check multiple possible locations)
            const token = response.data?.token || response.data?.data?.token;
            if (token) {
                console.log("[AuthContext] Token received, storing...");
                tokenStorage.set(token);
            } else {
                console.warn("[AuthContext] No token in login response");
            }

            console.log("[AuthContext] Refreshing auth state...");
            await checkAuth();
            console.log("[AuthContext] Login complete");
            return true;
        } catch (error) {
            console.error("[AuthContext] Login failed:", error);
            throw error;
        }
    };

    const register = async (data: any) => {
        try {
            const response = await api.post("/auth/register", data);

            // Extract token if present (some backends return token immediately)
            const token = response.data?.token || response.data?.data?.token;
            if (token) {
                console.log("[AuthContext] Token received from register, storing...");
                tokenStorage.set(token);
            }

            // Don't auto-login or checkAuth here if we need to verify email first
            // Just return the response so the component can decide where to go
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            console.log("[AuthContext] Logging out...");

            // Try to call logout endpoint (don't fail if it errors)
            try {
                await api.post("/auth/logout");
            } catch (error) {
                console.warn("[AuthContext] Logout API call failed, continuing with local cleanup:", error);
            }

            // CRITICAL: Clear token from storage
            tokenStorage.remove();

            // CRITICAL: Remove Authorization header from axios instance
            delete api.defaults.headers.common['Authorization'];

            // Clear user state
            setUser(null);

            console.log("[AuthContext] Logout complete, redirecting to welcome...");
            toast.success("Logged out successfully");

            // Navigate to welcome page
            window.location.href = "/auth/welcome";
        } catch (error) {
            console.error("[AuthContext] Logout error:", error);
            // Even if there's an error, still clear local state
            tokenStorage.remove();
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            window.location.href = "/auth/welcome";
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            checkAuth,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

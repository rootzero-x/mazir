/**
 * Token storage utilities for localStorage-based auth
 */

const TOKEN_KEY = "token";

export const tokenStorage = {
    get: (): string | null => {
        // 1) localStorage token
        const ls = localStorage.getItem(TOKEN_KEY);
        if (ls) return ls;

        // 2) cookie token (localhost:5173 da "token=" bor)
        if (typeof document !== "undefined") {
            const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
            if (match) return decodeURIComponent(match[1]);
        }

        return null;
    },

    set: (token: string): void => {
        try {
            localStorage.setItem(TOKEN_KEY, token);
            if (typeof document !== "undefined") {
                document.cookie = `token=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
            }
            console.log("[TokenStorage] Token stored successfully");
        } catch (error) {
            console.error("[TokenStorage] Failed to store token:", error);
        }
    },

    remove: (): void => {
        try {
            localStorage.removeItem(TOKEN_KEY);
            if (typeof document !== "undefined") {
                document.cookie = "token=; Max-Age=0; path=/";
            }
            console.log("[TokenStorage] Token removed");
        } catch (error) {
            console.error("[TokenStorage] Failed to remove token:", error);
        }
    },
};

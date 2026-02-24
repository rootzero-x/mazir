import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { tokenStorage } from "./tokenStorage";

export const API_URL = import.meta.env.VITE_API_BASE_URL || "https://694fc8f1e1918.myxvest1.ru/mazir/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Request interceptor: Add Bearer token to all requests
 */
api.interceptors.request.use(
    (config) => {
        const token = tokenStorage.get();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error("[API] Request interceptor error:", error);
        return Promise.reject(error);
    }
);

/**
 * Normalize double-wrapped responses from backend.
 * Sometimes backend returns: { ok:true, data:{ ok:true, data:{...} } }
 * We need to unwrap to get the inner data.
 */
const normalizeResponse = (response: any) => {
    // Check if response is double-wrapped
    if (
        response.data?.ok === true &&
        response.data?.data &&
        typeof response.data.data === 'object' &&
        response.data.data.ok === true
    ) {
        // Return unwrapped version with inner data
        return {
            ...response,
            data: response.data.data
        };
    }
    // Return as-is if not double-wrapped
    return response;
};

/**
 * Response interceptor: Normalize responses and handle errors
 */
api.interceptors.response.use(
    (response) => normalizeResponse(response),
    (error: AxiosError<{ message: string; errors?: Record<string, string[]> }>) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || "Something went wrong";

        // 401 Unauthorized: Redirect to welcome (but avoid infinite loops)
        if (status === 401) {
            // SKIP global logout for change-password (often returns 401 for wrong password)
            if (error.config?.url?.includes("/auth/change-password")) {
                return Promise.reject(error);
            }

            console.log("[API] 401 Unauthorized - clearing auth state");

            // Only redirect if not already on auth pages
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith('/auth/')) {
                // Clear token and redirect
                tokenStorage.remove();
                delete api.defaults.headers.common['Authorization'];

                // Dispatch logout event so AuthContext can update state immediately
                window.dispatchEvent(new Event("auth:logout"));

                // Use replace to avoid back button issues
                window.location.replace('/auth/welcome');
            }

            return Promise.reject(error);
        }

        // 403 Forbidden: Silent handling (let component decide)
        if (status === 403) {
            console.log("[API] 403 Forbidden");
            return Promise.reject(error);
        }

        // 500 Server Error: Show toast but don't break UI
        if (status === 500) {
            console.error("[API] 500 Server Error:", message);
            toast.error("Server error - please try again");
            return Promise.reject(error);
        }

        // Other errors: Show toast
        toast.error(message);
        return Promise.reject(error);
    }
);

export default api;

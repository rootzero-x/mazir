import React, { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextType {
    isOpen: boolean;
    isMobile: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
    setOpen: (open: boolean) => void;
    isCreatePostModalOpen: boolean;
    openCreatePost: () => void;
    closeCreatePost: () => void;
    lastPostAt: number;
    triggerPostRefresh: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    // Initialize state from localStorage or default to true
    const [isOpen, setIsOpenState] = useState(() => {
        if (typeof window === 'undefined') return true;
        const stored = localStorage.getItem("mazir_sidebar_open");
        return stored === null ? true : stored === "true";
    });

    const [isMobile, setIsMobile] = useState(false);
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [lastPostAt, setLastPostAt] = useState(0);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem("mazir_sidebar_open", String(isOpen));
    }, [isOpen]);

    // Handle Resize for Mobile detection
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024; // lg breakpoint
            setIsMobile(mobile);
            // Optional: Auto-close on mobile if needed, or keep persistent state
            // standard UX: mobile usually starts closed, desktop persistent
            // but user asked for "Sidebar default OPEN" - adhering to that but logic usually implies mobile drawer is closed initially or overlay.
            // Let's stick to persistent state but mobile might need special handling if it overlaps.
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const toggle = () => setIsOpenState(prev => !prev);
    const open = () => setIsOpenState(true);
    const close = () => setIsOpenState(false);
    const setOpen = (val: boolean) => setIsOpenState(val);

    const openCreatePost = () => setIsCreatePostModalOpen(true);
    const closeCreatePost = () => setIsCreatePostModalOpen(false);
    const triggerPostRefresh = () => setLastPostAt(Date.now());

    return (
        <SidebarContext.Provider value={{
            isOpen,
            isMobile,
            toggle,
            open,
            close,
            setOpen,
            isCreatePostModalOpen,
            openCreatePost,
            closeCreatePost,
            lastPostAt,
            triggerPostRefresh
        }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}

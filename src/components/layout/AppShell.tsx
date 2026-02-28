import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import CreatePostModal from "@/components/feed/CreatePostModal";

function ShellContent() {
    const { isCreatePostModalOpen, closeCreatePost, triggerPostRefresh } = useSidebar();

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-primary)] text-foreground relative">
            {/* Ambient Background Glows - Global */}
            <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-violet-600/20 blur-[140px] pointer-events-none z-0 mix-blend-screen" />
            <div className="fixed bottom-[-10%] right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-sky-500/15 blur-[120px] pointer-events-none z-0 mix-blend-screen" />

            {/* Sidebar (Fixed/Sticky handling inside Sidebar component) */}
            <Sidebar />

            {/* Main Content Area - Independent Scroll */}
            <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-transparent pb-16 lg:pb-0 z-10">
                <Outlet />
            </main>

            <div className="lg:hidden">
                <BottomNav />
            </div>

            {/* Global Create Post Modal */}
            <CreatePostModal
                isOpen={isCreatePostModalOpen}
                onClose={closeCreatePost}
                onPostCreated={() => {
                    triggerPostRefresh();
                    closeCreatePost();
                }}
            />
        </div>
    );
}

export default function AppShell() {
    return (
        <SidebarProvider>
            <ShellContent />
        </SidebarProvider>
    );
}

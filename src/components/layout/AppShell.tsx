import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import CreatePostModal from "@/components/feed/CreatePostModal";

function ShellContent() {
    const { isCreatePostModalOpen, closeCreatePost, triggerPostRefresh } = useSidebar();

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground relative">
            {/* Sidebar (Fixed/Sticky handling inside Sidebar component) */}
            <Sidebar />

            {/* Main Content Area - Independent Scroll */}
            <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-slate-950 pb-16 lg:pb-0">
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

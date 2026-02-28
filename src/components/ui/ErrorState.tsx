import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    retryLabel?: string;
}

export default function ErrorState({
    title = "Something went wrong",
    message = "We couldn't load the data. Please try again.",
    onRetry,
    retryLabel = "Try Again"
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 rounded-[2rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto w-full">
            <div className="h-24 w-24 rounded-full bg-red-500/10 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 rounded-full animate-ping bg-red-500/10 opacity-50"></div>
                <AlertCircle className="h-12 w-12 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] relative z-10" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3 drop-shadow-sm">{title}</h2>
            <p className="text-[15px] font-light text-slate-400 max-w-sm mb-10">{message}</p>

            <div className="flex gap-4">
                {onRetry && (
                    <Button onClick={onRetry} className="gap-2">
                        <RefreshCcw className="h-4 w-4" /> {retryLabel}
                    </Button>
                )}
                <Link to="/feed">
                    <Button variant="outline" className="gap-2">
                        <Home className="h-4 w-4" /> Back to Feed
                    </Button>
                </Link>
            </div>
        </div>
    );
}

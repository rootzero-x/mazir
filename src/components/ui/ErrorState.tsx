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
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="h-20 w-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                <AlertCircle className="h-10 w-10 text-red-500" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
            <p className="text-slate-400 max-w-md mb-8">{message}</p>

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

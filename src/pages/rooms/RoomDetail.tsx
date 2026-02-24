import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Hash, Users, PlusSquare, ArrowLeft } from "lucide-react";

export default function RoomDetail() {
    const { slug } = useParams();

    // Mock logic to handle room detail view
    return (
        <div className="space-y-6">
            {/* Room Header */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-900/50 to-slate-900/50 relative">
                    <Link to="/rooms" className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </div>
                <div className="px-6 pb-6 -mt-10 relative">
                    <div className="h-20 w-20 rounded-2xl bg-slate-900 border-4 border-card flex items-center justify-center shadow-xl">
                        <Hash className="h-10 w-10 text-blue-500" />
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight capitalize">{slug?.replace("-", " ")}</h1>
                            <p className="text-slate-400 mt-1 max-w-xl">
                                Discussion space for {slug}. Share insights, ask questions, and collaborate with others in the field.
                            </p>

                            <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <Users className="h-4 w-4" /> 12.5k Members
                                </span>
                                <span className="flex items-center gap-1.5 text-green-500">
                                    <span className="h-2 w-2 rounded-full bg-green-500" /> 342 Online
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline">Joined</Button>
                            <Button className="gap-2">
                                <PlusSquare className="h-4 w-4" />
                                New Thread
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Threads List (Placeholder) */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Recent Discussions</h2>
                {/* Reuse Feed items logic here later */}
                <div className="py-12 text-center border border-dashed border-border rounded-xl bg-card/50">
                    <p className="text-slate-500 mb-4">No threads yet. Be the first to post!</p>
                    <Button variant="secondary">Create Thread</Button>
                </div>
            </div>
        </div>
    );
}

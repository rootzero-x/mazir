import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Welcome() {
    return (
        <div className="text-center space-y-8">
            <div className="space-y-2">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="text-3xl font-bold text-white">M</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white">MAZIR</h1>
                <p className="text-slate-400 text-lg">
                    The premium knowledge network for elite developers.
                </p>
            </div>

            <div className="space-y-4 pt-4">
                <Button asChild size="lg" className="w-full text-base h-12 bg-white text-slate-900 hover:bg-slate-100">
                    <Link to="/auth/login">Log in</Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="w-full text-base h-12 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white">
                    <Link to="/auth/register">Create account</Link>
                </Button>
            </div>

            <p className="text-xs text-slate-600 pt-8">
                By continuing, you agree to our Terms & Conditions.
            </p>
        </div>
    );
}

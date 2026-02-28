import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Welcome() {
    return (
        <div className="text-center space-y-8">
            <div className="space-y-4">
                <div className="mx-auto h-20 w-20 rounded-[1.5rem] bg-gradient-to-br from-violet-600 to-sky-500 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)] ring-1 ring-white/20 relative group cursor-default">
                    {/* Inner glow */}
                    <div className="absolute inset-0 rounded-[1.5rem] shadow-inner bg-white/10 pointer-events-none" />
                    <span className="text-4xl font-bold text-white drop-shadow-md group-hover:scale-105 transition-transform duration-300">M</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-sm">MAZIR</h1>
                <p className="text-slate-400 text-[17px] font-light max-w-sm mx-auto leading-relaxed">
                    The premium knowledge network for elite developers.
                </p>
            </div>

            <div className="space-y-4 pt-6 max-w-sm mx-auto">
                <Button asChild size="lg" className="w-full h-14 bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] border-0 rounded-xl transition-all transform hover:-translate-y-0.5 text-lg">
                    <Link to="/auth/login">Log in</Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="w-full h-14 border-white/10 bg-slate-950/50 text-slate-300 hover:text-white hover:border-violet-500/50 hover:bg-violet-600/20 transition-all rounded-xl shadow-inner text-lg font-medium">
                    <Link to="/auth/register">Create account</Link>
                </Button>
            </div>

            <p className="text-xs text-slate-600 pt-8">
                By continuing, you agree to our Terms & Conditions.
            </p>
        </div>
    );
}

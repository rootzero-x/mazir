import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Moon, Sun, Monitor } from "lucide-react";
import { SectionTitle } from "./ui/SectionTitle";
import { SettingRow } from "./ui/SettingRow";

export default function PreferencesSettings() {
    return (
        <div className="p-4 sm:p-6 pb-8">
            <SectionTitle
                title="App Preferences"
                description="Customize your notification and appearance settings to suit your workflow."
                icon={<Bell className="h-6 w-6" />}
            />

            <div className="space-y-8 mt-8">
                {/* --- Notifications Section --- */}
                <div className="space-y-4">
                    <h3 className="text-[13px] font-medium text-violet-400 uppercase tracking-widest px-2">Notifications</h3>

                    <div className="panel-container border border-white/5 bg-slate-900/20 rounded-2xl overflow-hidden shadow-inner flex flex-col divide-y divide-white/5">
                        <SettingRow
                            title="Email Digest"
                            description="Receive a weekly summary of activity on your account."
                            control={<Checkbox defaultChecked className="border-slate-600 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600 rounded-md h-5 w-5 neon-focus" />}
                            className="bg-transparent hover:bg-white/[0.02]"
                        />
                        <SettingRow
                            title="New Mentions"
                            description="Get notified when someone replies to you or mentions you."
                            control={<Checkbox defaultChecked className="border-slate-600 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600 rounded-md h-5 w-5 neon-focus" />}
                            className="bg-transparent hover:bg-white/[0.02]"
                        />
                        <SettingRow
                            title="Room Updates"
                            description="Notifications from rooms and communities you joined."
                            control={<Checkbox className="border-slate-600 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600 rounded-md h-5 w-5 neon-focus" />}
                            className="bg-transparent hover:bg-white/[0.02]"
                        />
                    </div>
                </div>

                {/* --- Appearance Section --- */}
                <div className="space-y-4">
                    <h3 className="text-[13px] font-medium text-violet-400 uppercase tracking-widest px-2">Appearance</h3>

                    <div className="panel-container border border-white/5 bg-slate-900/20 rounded-2xl overflow-hidden shadow-inner p-5 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <button className="flex flex-col items-center gap-3 p-5 rounded-xl border border-violet-500/50 bg-violet-500/10 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)] transition-all neon-focus group relative overflow-hidden">
                                <Moon className="h-6 w-6 text-violet-400 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                                <span className="text-[14px] font-medium text-violet-200 relative z-10">Dark Mode</span>
                                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/0 to-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>

                            <button className="flex flex-col items-center gap-3 p-5 rounded-xl border border-slate-800 bg-slate-900/50 opacity-60 hover:bg-slate-800 transition-colors cursor-not-allowed">
                                <Sun className="h-6 w-6 text-slate-500" />
                                <span className="text-[14px] font-medium text-slate-500">Light (Soon)</span>
                            </button>

                            <button className="flex flex-col items-center gap-3 p-5 rounded-xl border border-slate-800 bg-slate-900/50 opacity-60 hover:bg-slate-800 transition-colors cursor-not-allowed">
                                <Monitor className="h-6 w-6 text-slate-500" />
                                <span className="text-[14px] font-medium text-slate-500">System (Soon)</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button
                        className="bg-violet-600/90 hover:bg-violet-500 text-white rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-violet-500/50 transition-all font-medium py-2 px-6"
                    >
                        Save Preferences
                    </Button>
                </div>
            </div>
        </div>
    );
}

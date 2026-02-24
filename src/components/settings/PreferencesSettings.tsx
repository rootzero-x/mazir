import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Moon, Sun } from "lucide-react";

export default function PreferencesSettings() {
    return (
        <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                    <Bell className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-white">Preferences</h2>
            </div>

            <div className="space-y-6">
                {/* Notifications */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Notifications</h3>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-slate-200">Email Digest</label>
                                <p className="text-xs text-slate-500">Receive a weekly summary of activity</p>
                            </div>
                            <Checkbox defaultChecked className="border-slate-700 data-[state=checked]:bg-blue-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-slate-200">New Mentions</label>
                                <p className="text-xs text-slate-500">Get notified when someone likely you</p>
                            </div>
                            <Checkbox defaultChecked className="border-slate-700 data-[state=checked]:bg-blue-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-slate-200">Room Updates</label>
                                <p className="text-xs text-slate-500">Notifications from rooms you joined</p>
                            </div>
                            <Checkbox className="border-slate-700 data-[state=checked]:bg-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div className="space-y-4 pt-4 border-t border-slate-800/50">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Appearance</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-800 bg-slate-950 hover:border-slate-700 transition-colors">
                            <Moon className="h-6 w-6 text-slate-400" />
                            <span className="text-sm font-medium text-slate-300">Dark Mode</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-800 bg-slate-900/50 opacity-50 cursor-not-allowed">
                            <Sun className="h-6 w-6 text-slate-500" />
                            <span className="text-sm font-medium text-slate-500">Light Mode (Soon)</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"

                >
                    Save Preferences
                </Button>
            </div>
        </section>
    );
}

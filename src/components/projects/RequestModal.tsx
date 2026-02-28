import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectTitle: string;
}

export default function RequestModal({ isOpen, onClose, projectId, projectTitle }: RequestModalProps) {
    const navigate = useNavigate();
    const [type, setType] = useState<"OFFER" | "COLLAB" | "QUESTION">("COLLAB");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) {
            toast.error("Please enter a message");
            return;
        }

        setSending(true);
        try {
            const { data } = await api.post(`/projects/${projectId}/requests`, {
                type,
                message
            });

            // Extract request ID from response
            const requestId = data.request?.id || data.id;

            toast.success("Request sent successfully!");
            setMessage(""); // Reset
            onClose();

            // Navigate to the thread with deep link
            if (requestId) {
                navigate(`/projects/${projectId}?tab=requests&rid=${requestId}`);
            }
        } catch (error: any) {
            console.error("Failed to send request:", error);
            toast.error(error.response?.data?.message || "Failed to send request");
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-slate-900/40 backdrop-blur-2xl border border-white/5 text-slate-200 rounded-[2.5rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/5 overflow-hidden relative">
                {/* Decorative glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/10 blur-[60px] rounded-full pointer-events-none" />

                <DialogHeader className="relative z-10">
                    <DialogTitle className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">Contact Project Owner</DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-4 relative z-10">
                    <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-200 text-sm shadow-inner backdrop-blur-sm">
                        You are sending a request for <span className="font-bold text-white tracking-wide">{projectTitle}</span>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-300 font-medium ml-1">Request Type</Label>
                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                            <SelectTrigger className="bg-slate-950/50 backdrop-blur-sm border-white/5 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 h-12 rounded-xl text-white transition-all shadow-inner">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/10 text-slate-200 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                                <SelectItem value="COLLAB" className="focus:bg-violet-500/20 focus:text-white cursor-pointer rounded-lg m-1">Collaboration Proposal</SelectItem>
                                <SelectItem value="OFFER" className="focus:bg-violet-500/20 focus:text-white cursor-pointer rounded-lg m-1">Purchase Offer</SelectItem>
                                <SelectItem value="QUESTION" className="focus:bg-violet-500/20 focus:text-white cursor-pointer rounded-lg m-1">General Question</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-300 font-medium ml-1">Message</Label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={
                                type === "COLLAB" ? "I'd like to help with..." :
                                    type === "OFFER" ? "I'm interested in buying this because..." :
                                        "I have a question about..."
                            }
                            className="bg-slate-950/50 backdrop-blur-sm border-white/5 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 min-h-[140px] rounded-xl text-white p-4 transition-all shadow-inner resize-none text-[15px]"
                        />
                    </div>
                </div>

                <DialogFooter className="relative z-10 pt-2 sm:justify-between border-t border-white/5 mt-2 flex flex-row gap-3">
                    <Button variant="outline" onClick={onClose} disabled={sending} className="flex-1 bg-transparent border-white/5 hover:bg-white/5 text-slate-300 hover:text-white rounded-xl h-11 transition-all">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={sending} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white gap-2 font-medium rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] border-0 h-11 transition-all relative overflow-hidden group">
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        {sending ? <Loader2 className="h-4 w-4 animate-spin relative z-10" /> : <Send className="h-4 w-4 relative z-10" />}
                        <span className="relative z-10">Send Request</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

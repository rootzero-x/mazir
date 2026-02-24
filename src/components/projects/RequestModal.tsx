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
            <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">Contact Project Owner</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
                        You are sending a request for <span className="font-bold text-white">{projectTitle}</span>
                    </div>

                    <div className="space-y-2">
                        <Label>Request Type</Label>
                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                            <SelectTrigger className="bg-slate-950 border-slate-800">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                <SelectItem value="COLLAB">Collaboration Proposal</SelectItem>
                                <SelectItem value="OFFER">Purchase Offer</SelectItem>
                                <SelectItem value="QUESTION">General Question</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={
                                type === "COLLAB" ? "I'd like to help with..." :
                                    type === "OFFER" ? "I'm interested in buying this because..." :
                                        "I have a question about..."
                            }
                            className="bg-slate-950 border-slate-800 min-h-[120px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={sending} className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={sending} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Send Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

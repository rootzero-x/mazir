import { Badge } from "@/components/ui/badge";

export type PostType = "BUG" | "SOLUTION" | "INSIGHT" | "PROJECT_UPDATE" | "bug" | "solution" | "insight" | "update";

interface PostTypeBadgeProps {
    type: PostType;
    className?: string;
}

const TYPE_CONFIG: Record<string, { label: string; className: string }> = {
    BUG: {
        label: "Bug",
        className: "bg-red-950/50 text-red-400 border-red-500/30 hover:bg-red-950/70"
    },
    bug: {
        label: "Bug",
        className: "bg-red-950/50 text-red-400 border-red-500/30 hover:bg-red-950/70"
    },
    SOLUTION: {
        label: "Solution",
        className: "bg-green-950/50 text-green-400 border-green-500/30 hover:bg-green-950/70"
    },
    solution: {
        label: "Solution",
        className: "bg-green-950/50 text-green-400 border-green-500/30 hover:bg-green-950/70"
    },
    INSIGHT: {
        label: "Insight",
        className: "bg-blue-950/50 text-blue-400 border-blue-500/30 hover:bg-blue-950/70"
    },
    insight: {
        label: "Insight",
        className: "bg-blue-950/50 text-blue-400 border-blue-500/30 hover:bg-blue-950/70"
    },
    PROJECT_UPDATE: {
        label: "Update",
        className: "bg-purple-950/50 text-purple-400 border-purple-500/30 hover:bg-purple-950/70"
    },
    update: {
        label: "Update",
        className: "bg-purple-950/50 text-purple-400 border-purple-500/30 hover:bg-purple-950/70"
    }
};

export default function PostTypeBadge({ type, className = "" }: PostTypeBadgeProps) {
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.INSIGHT;

    return (
        <Badge
            variant="outline"
            className={`${config.className} ${className} font-semibold text-xs uppercase tracking-wide`}
        >
            {config.label}
        </Badge>
    );
}

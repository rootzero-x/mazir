import { formatDistanceToNow, parseISO, format } from "date-fns";

/**
 * Safely formats a date string or object.
 * @param input Date object or string (ISO or MySQL format)
 * @param variant "relative" (e.g. "5 mins ago") or "absolute" (e.g. "21:45") or "full" (e.g. "Feb 13, 2026")
 */
export function formatTimeSafe(input: string | Date | undefined | null, variant: "relative" | "absolute" | "full" = "relative"): string {
    if (!input) return "—";

    try {
        let dateObj: Date;

        if (input instanceof Date) {
            dateObj = input;
        } else if (typeof input === 'string') {
            // Handle MySQL format "YYYY-MM-DD HH:mm:ss" by replacing space with T
            const isoString = input.trim().replace(" ", "T");
            dateObj = parseISO(isoString);
        } else {
            return "—";
        }

        if (isNaN(dateObj.getTime())) {
            return "—";
        }

        if (variant === "absolute") {
            return format(dateObj, "HH:mm");
        } else if (variant === "full") {
            return format(dateObj, "MMM d, yyyy");
        }

        return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
        console.warn("formatTimeSafe failed for:", input, error);
        return "—";
    }
}

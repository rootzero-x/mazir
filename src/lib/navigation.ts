/**
 * Check if a route is a public auth or onboarding route.
 * These routes should NEVER be protected or redirected.
 */
export const isPublicAuthRoute = (pathname: string): boolean => {
    return pathname.startsWith("/auth") || pathname.startsWith("/onboarding");
};

/**
 * Normalize API response data that may be double-wrapped.
 * Handles: { ok:true, data:{ ok:true, data:{...} } }
 * Returns: standardized envelope { ok, data, message? }
 */
export const normalizeApi = (resData: any): any => {
    if (!resData) return resData;

    // Check for double-wrap: response.ok=true AND response.data.ok=true AND response.data.data exists
    if (
        resData.ok === true &&
        resData.data &&
        typeof resData.data === 'object' &&
        resData.data.ok === true &&
        resData.data.data
    ) {
        // Return the inner envelope
        return resData.data;
    }

    // Return as-is if not double-wrapped
    return resData;
};

/**
 * Extract 'next' field from normalized response, checking multiple possible locations.
 */
export const getNextFromResponse = (normalized: any): string | null => {
    if (!normalized) return null;

    // Try direct access first
    if (normalized.next) return normalized.next;
    if (normalized.data?.next) return normalized.data.next;
    if (normalized.data?.data?.next) return normalized.data.data.next;

    return null;
};

/**
 * Extract email from response or fallback to provided email.
 */
export const getEmailFromResponse = (normalized: any, fallbackEmail?: string): string | null => {
    if (!normalized) return fallbackEmail || null;

    if (normalized.email) return normalized.email;
    if (normalized.data?.email) return normalized.data.email;
    if (normalized.data?.data?.email) return normalized.data.data.email;

    return fallbackEmail || null;
};

export const navigateByNext = (next: string | undefined, email?: string): string => {
    // Store email for verify_email flow
    if (next === "verify_email" && email) {
        sessionStorage.setItem("pending_verify_email", email);
    }

    switch (next) {
        case "verify_email":
            return "/auth/verify-email";
        case "onboarding_setup":
            return "/onboarding/setup";
        case "onboarding_rules":
            return "/onboarding/rules";
        case "onboarding_rooms":
            return "/onboarding/rooms";
        case "feed":
            return "/feed";
        default:
            return "/feed";
    }
};

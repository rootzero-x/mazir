/**
 * localStorage utility for tracking helpful/liked posts
 * This ensures the helpful state persists across page refreshes
 */

const STORAGE_KEY = "mazir_helpful_posts";

export const helpfulStorage = {
    /**
     * Get all helpful post IDs
     */
    get(): Set<string> {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return new Set();
            const array = JSON.parse(stored);
            return new Set(Array.isArray(array) ? array : []);
        } catch (error) {
            console.error("[helpfulStorage] Failed to read:", error);
            return new Set();
        }
    },

    /**
     * Check if a post is marked as helpful
     */
    isHelpful(postId: string): boolean {
        const helpful = this.get();
        return helpful.has(String(postId));
    },

    /**
     * Mark a post as helpful
     */
    add(postId: string): void {
        try {
            const helpful = this.get();
            helpful.add(String(postId));
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...helpful]));
            console.log(`[helpfulStorage] Added post ${postId}, total: ${helpful.size}`);
        } catch (error) {
            console.error("[helpfulStorage] Failed to add:", error);
        }
    },

    /**
     * Remove helpful mark from a post
     */
    remove(postId: string): void {
        try {
            const helpful = this.get();
            helpful.delete(String(postId));
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...helpful]));
            console.log(`[helpfulStorage] Removed post ${postId}, total: ${helpful.size}`);
        } catch (error) {
            console.error("[helpfulStorage] Failed to remove:", error);
        }
    },

    /**
     * Toggle helpful state for a post
     */
    toggle(postId: string): boolean {
        const isNowHelpful = !this.isHelpful(postId);
        if (isNowHelpful) {
            this.add(postId);
        } else {
            this.remove(postId);
        }
        return isNowHelpful;
    },

    /**
     * Clear all helpful posts (for debugging)
     */
    clear(): void {
        localStorage.removeItem(STORAGE_KEY);
        console.log("[helpfulStorage] Cleared all helpful posts");
    }
};

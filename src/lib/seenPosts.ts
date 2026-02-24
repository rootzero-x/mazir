export const seenPostsStorage = {
    get: (): string[] => {
        try {
            const seen = localStorage.getItem("seen_posts");
            return seen ? JSON.parse(seen) : [];
        } catch {
            return [];
        }
    },

    add: (postIds: string[]) => {
        try {
            const current = seenPostsStorage.get();
            const unique = new Set([...current, ...postIds]);
            localStorage.setItem("seen_posts", JSON.stringify(Array.from(unique)));
        } catch (e) {
            console.error("Failed to save seen posts", e);
        }
    },

    has: (postId: string): boolean => {
        const seen = seenPostsStorage.get();
        return seen.includes(postId);
    }
};

/**
 * Event emitter for notification updates
 * Allows real-time sync between Notifications page and Sidebar badge
 */

const NOTIFICATION_UPDATE_EVENT = "mazir_notification_update";

export const notificationEvents = {
    /**
     * Emit notification update event
     * Call this when notifications are marked as read
     */
    emit(): void {
        // Use localStorage to trigger storage event across components
        const timestamp = Date.now();
        localStorage.setItem(NOTIFICATION_UPDATE_EVENT, String(timestamp));

        // Also dispatch custom event for same-window updates
        window.dispatchEvent(new CustomEvent(NOTIFICATION_UPDATE_EVENT));

        console.log("[notificationEvents] Emitted update event");
    },

    /**
     * Listen for notification update events
     * @param callback Function to call when notifications are updated
     * @returns Cleanup function to remove listener
     */
    listen(callback: () => void): () => void {
        const handleStorageEvent = (e: StorageEvent) => {
            if (e.key === NOTIFICATION_UPDATE_EVENT) {
                callback();
            }
        };

        const handleCustomEvent = () => {
            callback();
        };

        // Listen for storage events (cross-tab)
        window.addEventListener("storage", handleStorageEvent);

        // Listen for custom events (same window)
        window.addEventListener(NOTIFICATION_UPDATE_EVENT, handleCustomEvent);

        // Return cleanup function
        return () => {
            window.removeEventListener("storage", handleStorageEvent);
            window.removeEventListener(NOTIFICATION_UPDATE_EVENT, handleCustomEvent);
        };
    }
};

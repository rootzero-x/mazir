import api from "@/lib/api";

/**
 * Image upload utilities for avatar and cover
 */

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

/**
 * Validate image file
 */
function validateImageFile(file: File): string | null {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)';
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return 'Image size must be less than 5MB';
    }

    return null;
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(
    file: File,
    onProgress?: (progress: UploadProgress) => void
): Promise<string> {
    // Validate file
    const error = validateImageFile(file);
    if (error) {
        throw new Error(error);
    }

    // Create form data
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const { data } = await api.post('/users/me/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress({
                        loaded: progressEvent.loaded,
                        total: progressEvent.total,
                        percentage
                    });
                }
            }
        });

        // Return new avatar URL
        return data.avatar_url || data.avatarUrl || data.url || '';
    } catch (error: any) {
        console.error('[uploadAvatar] Failed:', error);
        throw new Error(error.response?.data?.message || 'Failed to upload avatar');
    }
}

/**
 * Upload cover image
 */
export async function uploadCover(
    file: File,
    onProgress?: (progress: UploadProgress) => void
): Promise<string> {
    // Validate file
    const error = validateImageFile(file);
    if (error) {
        throw new Error(error);
    }

    // Create form data
    const formData = new FormData();
    formData.append('cover', file);

    try {
        const { data } = await api.post('/users/me/cover', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress({
                        loaded: progressEvent.loaded,
                        total: progressEvent.total,
                        percentage
                    });
                }
            }
        });

        // Return new cover URL
        return data.cover_url || data.coverUrl || data.url || '';
    } catch (error: any) {
        console.error('[uploadCover] Failed:', error);
        throw new Error(error.response?.data?.message || 'Failed to upload cover');
    }
}

/**
 * Trigger file picker and upload
 */
export function pickAndUploadImage(
    type: 'avatar' | 'cover',
    onProgress?: (progress: UploadProgress) => void
): Promise<string> {
    return new Promise((resolve, reject) => {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) {
                reject(new Error('No file selected'));
                return;
            }

            try {
                const uploadFn = type === 'avatar' ? uploadAvatar : uploadCover;
                const url = await uploadFn(file, onProgress);
                resolve(url);
            } catch (error) {
                reject(error);
            }
        };

        input.click();
    });
}

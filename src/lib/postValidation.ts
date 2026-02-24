/**
 * Post validation utilities
 * Validates post data based on type and returns errors
 */

export type PostType = "BUG" | "SOLUTION" | "INSIGHT" | "PROJECT_UPDATE";

export interface PostFormData {
    type: PostType;
    room_id?: string;
    title: string;
    context?: string;
    problem?: string;
    attempt?: string;
    solution?: string;
    result?: string;
    result_text?: string;
    tags: string[];
    attachments: Array<{ kind: string; url: string }>;
}

export interface ValidationErrors {
    [key: string]: string;
}

/**
 * Get required fields for a post type
 */
export function getRequiredFields(type: PostType): string[] {
    switch (type) {
        case "BUG":
            return ["title", "problem", "solution"];
        case "SOLUTION":
            return ["title", "problem", "solution"];
        case "INSIGHT":
            return ["title", "result_text"];
        case "PROJECT_UPDATE":
            return ["title", "context"];
        default:
            return ["title"];
    }
}

/**
 * Validate post data by type
 */
export function validatePostByType(data: Partial<PostFormData>): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!data.type) {
        errors.type = "Post type is required";
        return errors;
    }

    const requiredFields = getRequiredFields(data.type);

    // Check required fields
    requiredFields.forEach(field => {
        const value = (data as any)[field];
        if (!value || (typeof value === 'string' && !value.trim())) {
            errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        }
    });

    // Validate title length
    if (data.title && data.title.length > 160) {
        errors.title = "Title must be 160 characters or less";
    }

    // Validate context length
    if (data.context && data.context.length > 160) {
        errors.context = "Context must be 160 characters or less";
    }

    return errors;
}

/**
 * Format post data for API submission
 */
export function formatPostForAPI(formData: PostFormData): any {
    const base = {
        type: formData.type,
        title: formData.title.trim(),
        tags: formData.tags,
        attachments: formData.attachments
    };

    // Add optional room
    if (formData.room_id) {
        (base as any).room_id = formData.room_id;
    }

    // Add type-specific fields
    switch (formData.type) {
        case "BUG":
            return {
                ...base,
                context: formData.context?.trim() || undefined,
                problem: formData.problem?.trim(),
                attempt: formData.attempt?.trim() || undefined,
                solution: formData.solution?.trim(),
                result: formData.result?.trim() || undefined
            };

        case "SOLUTION":
            return {
                ...base,
                context: formData.context?.trim() || undefined,
                problem: formData.problem?.trim(),
                solution: formData.solution?.trim(),
                result: formData.result?.trim() || undefined
            };

        case "INSIGHT":
            return {
                ...base,
                context: formData.context?.trim() || undefined,
                result_text: formData.result_text?.trim()
            };

        case "PROJECT_UPDATE":
            return {
                ...base,
                context: formData.context?.trim(),
                result_text: formData.result_text?.trim() || undefined
            };

        default:
            return base;
    }
}

/**
 * Get placeholder text for fields based on post type
 */
export function getFieldPlaceholder(type: PostType, field: string): string {
    const placeholders: Record<PostType, Record<string, string>> = {
        BUG: {
            title: "Brief description of the bug",
            context: "Where did this happen? (optional)",
            problem: "What went wrong?",
            attempt: "What did you try? (optional)",
            solution: "How did you fix it?",
            result: "What was the outcome? (optional)"
        },
        SOLUTION: {
            title: "Solution title",
            context: "Background context (optional)",
            problem: "What problem does this solve?",
            solution: "Your solution",
            result: "Results or benefits (optional)"
        },
        INSIGHT: {
            title: "Insight title",
            context: "Context or background (optional)",
            result_text: "Share your insight..."
        },
        PROJECT_UPDATE: {
            title: "Update title",
            context: "What changed?",
            result_text: "Details about the update (optional)"
        }
    };

    return placeholders[type]?.[field] || "";
}

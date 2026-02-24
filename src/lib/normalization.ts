import type { User, Post, Project, ProjectType } from "./types";

/**
 * Convert relative image URL to absolute URL
 * Backend returns: /mazir/uploads/... or /uploads/...
 * We need: https://694fc8f1e1918.myxvest1.ru/mazir/uploads/...
 */
export function getFullImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    // Already absolute URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Blob URL (for preview)
    if (url.startsWith('blob:')) {
        return url;
    }

    // Relative URL - convert to absolute
    const baseUrl = 'https://694fc8f1e1918.myxvest1.ru';

    // Remove leading slash if exists to avoid double slashes
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;

    return `${baseUrl}${cleanUrl}`;
}

/**
 * STRICT: Never return "Unknown" - always use "User" as fallback
 * Safely extracts user information from various potential API shapes.
 * Handles: user, author, actor, sender, etc.
 */
export function getSafeUser(entity: any): {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    coverUrl: string | null;
    id: string;
} {
    if (!entity) {
        return {
            username: "User",
            displayName: "User",
            avatarUrl: null,
            coverUrl: null,
            id: ""
        };
    }

    // Try to find the user object within the entity
    let userObj = entity;

    // If entity has a 'user' property that looks like a user object, use it
    if (entity.user && typeof entity.user === 'object') userObj = entity.user;
    else if (entity.author && typeof entity.author === 'object') userObj = entity.author;
    else if (entity.actor && typeof entity.actor === 'object') userObj = entity.actor;
    else if (entity.sender && typeof entity.sender === 'object') userObj = entity.sender;

    // STRICT: Never "Unknown", always "User" as fallback
    const username = userObj.username || userObj.handle || "User";
    const displayName = userObj.displayName || userObj.display_name || userObj.name || username;
    const id = userObj.id || userObj._id || "";

    // Avatar Logic: try all possible field names
    let avatarUrl: string | null = null;
    if (userObj.avatarUrl) avatarUrl = userObj.avatarUrl;
    else if (userObj.avatar_url) avatarUrl = userObj.avatar_url;
    else if (userObj.avatar) avatarUrl = userObj.avatar;
    else if (userObj.profilePicture) avatarUrl = userObj.profilePicture;
    else if (userObj.profile_picture) avatarUrl = userObj.profile_picture;

    // Cover Logic: try all possible field names
    let coverUrl: string | null = null;
    if (userObj.coverUrl) coverUrl = userObj.coverUrl;
    else if (userObj.cover_url) coverUrl = userObj.cover_url;
    else if (userObj.cover) coverUrl = userObj.cover;
    else if (userObj.coverImage) coverUrl = userObj.coverImage;
    else if (userObj.cover_image) coverUrl = userObj.cover_image;

    return {
        username,
        displayName,
        avatarUrl: getFullImageUrl(avatarUrl),
        coverUrl: getFullImageUrl(coverUrl),
        id
    };
}

/**
 * Normalize comment from backend response
 * Handles various field name variations
 */
export function getSafeComment(comment: any): {
    id: string;
    content: string;
    author: ReturnType<typeof getSafeUser>;
    createdAt: string;
    likes: number;
} {
    if (!comment) {
        return {
            id: "",
            content: "",
            author: getSafeUser(null),
            createdAt: new Date().toISOString(),
            likes: 0
        };
    }

    return {
        id: comment.id || comment._id || "",
        content: comment.content || comment.text || comment.body || "",
        author: getSafeUser(comment.author || comment.user || comment.commenter),
        createdAt: comment.createdAt || comment.created_at || comment.timestamp || new Date().toISOString(),
        likes: comment.likes || comment.likes_count || comment.helpful_count || 0
    };
}

/**
 * Normalize post from backend response
 * CRITICAL: Maps all possible content field variations
 */
export function getSafePost(post: any): Post {
    if (!post) {
        return {
            id: "",
            title: "",
            content: "",
            author: getSafeUser(null) as unknown as User,
            createdAt: new Date().toISOString(),
            tags: [],
            helpfulCount: 0,
            commentsCount: 0,
            isHelpfulByMe: false,
            likes: 0,
            attachments: [],
            type: "discussion"
        } as Post;
    }

    // Content mapping: try all possible fields
    let content = "";
    if (post.content) content = post.content;
    else if (post.body) content = post.body;
    else if (post.text) content = post.text;
    else if (post.description) content = post.description;
    else if (post.context) content = post.context; // Fallback to context

    // Author mapping: try all possible fields
    const author = getSafeUser(
        post.author || post.user || post.creator || post.owner
    );

    // Helpful/Like count mapping
    const helpfulCount =
        post.helpfulCount ||
        post.helpful_count ||
        post.likes ||
        post.likes_count ||
        post.like_count ||
        0;

    // Comments count mapping
    const commentsCount =
        post.commentsCount ||
        post.comments_count ||
        post.comment_count ||
        post.replies_count ||
        0;

    // Is helpful by me mapping
    const isHelpfulByMe =
        post.isHelpfulByMe ||
        post.is_helpful_by_me ||
        post.liked_by_me ||
        post.i_liked ||
        post.viewer_has_liked ||
        false;

    console.log(`[normalization] Post ${post.id} isHelpfulByMe:`, {
        raw: post.isHelpfulByMe,
        is_helpful_by_me: post.is_helpful_by_me,
        liked_by_me: post.liked_by_me,
        final: isHelpfulByMe
    });

    return {
        ...post,
        id: post.id || post._id || "",
        title: post.title || "",
        content,
        author: author as unknown as User,
        createdAt: post.createdAt || post.created_at || post.timestamp || new Date().toISOString(),
        tags: Array.isArray(post.tags) ? post.tags : [],
        helpfulCount,
        commentsCount,
        isHelpfulByMe,
        likes: helpfulCount,
        attachments: Array.isArray(post.attachments) ? post.attachments : [],
        type: post.type || "discussion",
        // Preserve additional fields if they exist
        context: post.context,
        problem: post.problem,
        attempt: post.attempt,
        solution: post.solution,
    };
}

/**
 * Normalize project from backend response
 */
export function getSafeProject(project: any): Project | null {
    if (!project) return null;

    // Handle project type mapping
    let type: ProjectType = "COLLAB";
    if (project.type === "SELL_PROJECT" || project.type === "SELL") type = "SELL";
    else if (project.type === "COLLAB_PROJECT" || project.type === "COLLAB" || project.type === "LOOKING_FOR_TEAM") type = "COLLAB";
    else if (project.type === "OPEN_SOURCE_PROJECT" || project.type === "OPEN_SOURCE") type = "OPEN_SOURCE";

    // Handle tags mapping
    const tags = Array.isArray(project.stack_tags) ? project.stack_tags :
        Array.isArray(project.tags) ? project.tags : [];

    // Handle images mapping
    const images = Array.isArray(project.screenshots) ? project.screenshots :
        Array.isArray(project.images) ? project.images : [];

    // Construct owner object
    // Often the project list returns flat user fields mixed with project fields
    const owner = {
        id: project.user_id || project.owner_id || "",
        username: project.username || "User",
        avatarUrl: getFullImageUrl(project.avatar_url || project.avatarUrl) || undefined,
        displayName: project.display_name || project.displayName,
        level: project.level,
        email: "" // Usually not public
    };

    // If there is an explicit owner object, merge/override
    if (project.owner && typeof project.owner === 'object') {
        Object.assign(owner, getSafeUser(project.owner));
    }

    return {
        id: project.id,
        title: project.title,
        slug: project.slug || project.id,
        pitch: project.pitch || "",
        description: project.description || "",
        type,
        status: project.status || "ACTIVE",
        tags,
        price: project.price ? parseFloat(project.price) : undefined,
        currency: project.currency || "USD",
        demo_url: project.demo_url,
        repo_url: project.repo_url,
        images: images.map((img: string) => getFullImageUrl(img) || img),
        owner,
        stats: {
            views: project.views || 0,
            likes: project.likes || 0,
            requests: project.requests_count || project.requests || 0
        },
        created_at: project.created_at || new Date().toISOString(),
        is_owner: !!project.is_owner
    };
}

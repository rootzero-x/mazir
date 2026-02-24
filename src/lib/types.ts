export type PermissionLevel = "L0" | "L1" | "L2" | "L3"; // Guest, User, Full Access, Admin

export interface User {
    id: string;
    username: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
    coverUrl?: string;
    bio?: string;
    level?: PermissionLevel;
    skills?: string[];
    goals?: string[];
    createdAt?: string;
    onboarding_state?: "NOT_STARTED" | "PROFILE_SETUP" | "RULES" | "ROOMS_PICK" | "DONE"; // Optional if backend doesn't send it sometimes
    next?: string; // Backend driven navigation
    display_name_changed_at?: string;
    next_allowed_change?: string;
}

export type PostType = "BUG" | "SOLUTION" | "INSIGHT" | "PROJECT_UPDATE" | "bug" | "solution" | "insight" | "update" | "discussion";

export interface Post {
    id: string;
    title: string;
    content: string;
    type: PostType;
    context?: string;
    problem?: string;
    attempt?: string;
    solution?: string;
    result?: string;
    tags: string[];
    attachments: string[];
    author: User;
    createdAt: string;
    likes: number;
    helpfulCount: number;
    commentsCount: number;
    isHelpfulByMe: boolean;
}

export interface Comment {
    id: string;
    content: string;
    author: User;
    createdAt: string;
    likes: number;
    replies?: Comment[];
}

export interface Room {
    slug: string;
    name: string;
    description: string;
    memberCount: number;
    activeThreads: number;
    icon?: string;
    unreadCount?: number;
    onlineCount?: number;
    lastMessage?: Message;
}

export interface Message {
    id: number | string;
    content: string;
    user_id: number | string;
    username: string;
    created_at: string; // ISO or MySQL datetime
    sender?: User; // Keeping for potential backward compatibility or detailed user info if needed
    status?: "sending" | "sent" | "failed" | "read";
    client_id?: string;
    readBy?: string[];
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    checkAuth: () => Promise<User | null>;
    login: (credentials: any) => Promise<boolean>;
    register: (data: any) => Promise<any>;
    logout: () => Promise<void>;
}

export type ProjectType = "SELL" | "COLLAB" | "OPEN_SOURCE" | "sell" | "collab" | "open_source";
export type ProjectStatus = "ACTIVE" | "CLOSED" | "active" | "closed";

export interface Project {
    id: string;
    title: string;
    slug: string;
    pitch: string;
    description: string;
    type: ProjectType;
    status: ProjectStatus;
    tags: string[];
    price?: number;
    currency?: string;
    demo_url?: string;
    repo_url?: string;
    images: string[];
    owner: User;
    stats: {
        views: number;
        likes: number;
        requests: number;
    };
    created_at: string;
    is_owner?: boolean;
}

export type RequestType = "OFFER" | "COLLAB" | "QUESTION";
export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface Notification {
    id: string;
    type: "like" | "comment" | "follow" | "POST_HELPFUL" | "POST_COMMENT" | "USER_FOLLOW" | "PROJECT_REQUEST" | "PROJECT_REQUEST_REPLY";
    actor: User;
    user_id: string;
    is_read: boolean;
    created_at: string;
    createdAt?: string;
    post?: Post;
    post_id?: string;
    project?: Project;
    project_id?: string;
    request?: ProjectRequest;
    request_id?: string;
    content?: string;
}

export interface ProjectRequestMessage {
    id: string;
    request_id: string;
    sender: User;
    content: string;
    created_at: string;
    is_read: boolean;
}

export interface ProjectRequest {
    id: string;
    project_id: string;
    project?: Project;
    sender: User;
    type: RequestType;
    message: string; // Initial message
    status: RequestStatus;
    created_at: string;
    updated_at: string;
    messages?: ProjectRequestMessage[];
}

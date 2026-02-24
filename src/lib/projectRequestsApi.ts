import api from "./api";

/**
 * Centralized API functions for Project Requests
 * All endpoints use /mazir/api prefix (configured in api.ts)
 */

export interface ProjectRequestsParams {
    mode?: "owner" | "requester";
}

/**
 * Get project requests (owner inbox or requester's own requests)
 * @param projectId - Project ID
 * @param params - Query params (mode: owner|requester)
 */
export async function getProjectRequests(projectId: string, params?: ProjectRequestsParams) {
    const { data } = await api.get(`/projects/${projectId}/requests`, { params });
    // Handle different response structures
    return data.requests || data.data?.requests || (Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []);
}

/**
 * Get request thread (request details + messages)
 * @param requestId - Request ID
 */
export async function getRequestThread(requestId: string) {
    const { data } = await api.get(`/requests/${requestId}`);
    return {
        request: data.request || data,
        messages: data.messages || data.data?.messages || []
    };
}

/**
 * Send a message to a request thread
 * @param requestId - Request ID
 * @param content - Message content
 */
export async function sendRequestMessage(requestId: string, content: string) {
    const { data } = await api.post(`/requests/${requestId}/messages`, { content });
    return data.message || data;
}

/**
 * Create a new project request
 * @param projectId - Project ID
 * @param payload - Request payload (type, message)
 */
export async function createProjectRequest(projectId: string, payload: { type: string; message: string }) {
    const { data } = await api.post(`/projects/${projectId}/requests`, payload);
    return data.request || data;
}

/**
 * Get project views count
 * @param projectId - Project ID
 */
export async function getProjectViewsCount(projectId: string) {
    const { data } = await api.get(`/projects/${projectId}/views/count`);
    return data.count || data.views || data.data?.count || 0;
}

/**
 * Increment project view count
 * @param projectId - Project ID
 */
export async function incrementProjectView(projectId: string) {
    await api.post(`/projects/${projectId}/view`);
}

/**
 * Get project stats (views + requests count)
 * @param projectId - Project ID
 */
export async function getProjectStats(projectId: string) {
    const { data } = await api.get(`/projects/${projectId}/stats`);
    const statsData = data.data || data;
    return {
        views: statsData.view_count ?? statsData.views ?? 0,
        requests: statsData.request_count ?? statsData.requests ?? 0
    };
}

import config from '../config/config';

const API_BASE_URL = config.API_BASE_URL;

// Get auth headers helper (mimicking apiService.js)
const getToken = () => localStorage.getItem(config.TOKEN_KEY);
const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const getConversations = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        return response.ok ? { success: true, data: data.data } : { success: false, error: data.message };
    } catch (error) {
        return { success: false, error: 'Network error' };
    }
};

export const getMessages = async (conversationId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        return response.ok ? { success: true, data: data.data } : { success: false, error: data.message };
    } catch (error) {
        return { success: false, error: 'Network error' };
    }
};

export const createOrGetConversation = async (receiverId) => {
    try {
        console.log('🌐 [DEBUG] API Call: createOrGetConversation', { receiverId });
        const response = await fetch(`${API_BASE_URL}/conversations`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ receiverId })
        });
        const data = await response.json();
        console.log('🌐 [DEBUG] API Response: createOrGetConversation', { status: response.status, data });
        return response.ok ? { success: true, data: data.data } : { success: false, error: data.message };
    } catch (error) {
        console.error('🌐 [DEBUG] API Error: createOrGetConversation', error);
        return { success: false, error: 'Network error' };
    }
};

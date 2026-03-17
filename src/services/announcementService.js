import config from '../config/config';

const API_URL = `${config.API_BASE_URL}/announcements`;
const TOKEN_KEY = config.TOKEN_KEY;

const getAnnouncements = async () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return { success: false, error: 'No token found' };

    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message || 'Failed to fetch announcements' };
    }
  } catch (error) {
    console.error('getAnnouncements error:', error);
    return { success: false, error: 'Failed to fetch announcements' };
  }
};

const getUnreadCount = async () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return { success: false, error: 'No token found' };

    const response = await fetch(`${API_URL}/unread/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message || 'Failed to fetch unread count' };
    }
  } catch (error) {
    console.error('getUnreadCount error:', error);
    return { success: false, error: 'Failed to fetch unread count' };
  }
};

const markAllAsRead = async () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return { success: false, error: 'No token found' };

    const response = await fetch(`${API_URL}/unread/mark-all-read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message || 'Failed to mark all as read' };
    }
  } catch (error) {
    console.error('markAllAsRead error:', error);
    return { success: false, error: 'Failed to mark all as read' };
  }
};

export default {
  getAnnouncements,
  getUnreadCount,
  markAllAsRead
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const authAPI = {
  async syncUser(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync user');
    }
    
    return response.json();
  },

  async getUser(clerkId) {
    const response = await fetch(`${API_BASE_URL}/auth/user/${clerkId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    
    return response.json();
  },

  async getProfile(clerkId) {
    const response = await fetch(`${API_BASE_URL}/auth/profile/${clerkId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    return response.json();
  },

  async updateProfile(clerkId, profileData) {
    const response = await fetch(`${API_BASE_URL}/auth/profile/${clerkId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    return response.json();
  },
};

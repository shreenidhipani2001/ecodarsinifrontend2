const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getUserProfile(userId: string) {
  try {
    const res = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, updates: {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}) {
  try {
    const res = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to update user profile:', error);
    throw error;
  }
}

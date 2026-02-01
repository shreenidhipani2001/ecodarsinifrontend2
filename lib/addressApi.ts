const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createAddress(
  userId: string,
  addressLine1: string,
  city: string,
  state: string,
  pincode: string,
  country?: string
) {
  try {
    const res = await fetch(`${API_URL}/api/addresses`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        address_line1: addressLine1,
        city,
        state,
        pincode,
        country: country || 'India',
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to create address:', error);
    throw error;
  }
}

export async function getUserAddresses(userId: string) {
  try {
    const res = await fetch(`${API_URL}/api/addresses/user/${userId}`, {
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
    console.error('Failed to fetch user addresses:', error);
    throw error;
  }
}

export async function getAddressById(addressId: string) {
  try {
    const res = await fetch(`${API_URL}/api/addresses/${addressId}`, {
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
    console.error('Failed to fetch address:', error);
    throw error;
  }
}

export async function updateAddress(
  addressId: string,
  updates: {
    address_line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  }
) {
  try {
    const res = await fetch(`${API_URL}/api/addresses/${addressId}`, {
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
    console.error('Failed to update address:', error);
    throw error;
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const res = await fetch(`${API_URL}/api/addresses/${addressId}`, {
      method: 'DELETE',
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
    console.error('Failed to delete address:', error);
    throw error;
  }
}

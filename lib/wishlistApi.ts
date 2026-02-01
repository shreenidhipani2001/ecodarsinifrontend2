const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getWishlist(userId: string) {
  try {
    const res = await fetch(`${API_URL}/api/wishes/unique/${userId}`, {
    // const res = await fetch(`${API_URL}/api/wishes`, {
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
    console.log('Wishlist data fetched:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch wishlist:', error);
    throw error;
  }
}

export async function addToWishlist(userId: string, productId: string) {
  try {
    const res = await fetch(`${API_URL}/api/wishes/add`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        product_id: productId,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to add to wishlist:', error);
    throw error;
  }
}

export async function removeFromWishlist(wishlistItemId: number,userId: string) {
  try {
    const res = await fetch(`${API_URL}/api/wishes/${wishlistItemId}?userId=${userId}`, {
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
    console.error('Failed to remove from wishlist:', error);
    throw error;
  }
}

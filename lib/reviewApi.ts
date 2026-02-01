const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createReview(userId: string, productId: string, rating: number, comment?: string) {
  try {
    const res = await fetch(`${API_URL}/api/reviews`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        product_id: productId,
        rating,
        comment,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to create review:', error);
    throw error;
  }
}

export async function getProductReviews(productId: string) {
  try {
    const res = await fetch(`${API_URL}/api/reviews/product/${productId}`, {
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
    console.error('Failed to fetch reviews:', error);
    throw error;
  }
}

export async function getUserReviews(userId: string) {
  try {
    const res = await fetch(`${API_URL}/api/reviews/user/${userId}`, {
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
    console.error('Failed to fetch user reviews:', error);
    throw error;
  }
}

export async function updateReview(reviewId: string, rating?: number, comment?: string) {
  try {
    const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...(rating && { rating }),
        ...(comment !== undefined && { comment }),
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to update review:', error);
    throw error;
  }
}

export async function deleteReview(reviewId: string) {
  try {
    const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
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
    console.error('Failed to delete review:', error);
    throw error;
  }
}

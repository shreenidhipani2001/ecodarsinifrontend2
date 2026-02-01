const API_URL = process.env.NEXT_PUBLIC_API_URL;

// export async function getCart() {
//   try {
//     const res = await fetch(`${API_URL}/api/cart`, {
//       method: 'GET',
//       credentials: 'include',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
// console.log('Fetching cart from:', `${API_URL}/api/cart`);
//     if (!res.ok) {
//       throw new Error(`HTTP ${res.status}`);
//     }

//     const data = await res.json();
//     return data;
//   } catch (error) {
//     console.error('Failed to fetch cart:', error);
//     throw error;
//   }
// }

export async function getCart(userId: string) {
  try {
    console.log('Fetching cart for user: 1111', userId);
    const res = await fetch(`${API_URL}/api/cart/user/${userId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('Response not ok:', res.status, res.statusText);
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log('Cart data fetched:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    throw error;
  }
}
export async function addToCart(userId: string, productId: string, quantity: number = 1) {
  try {
    const res = await fetch(`${API_URL}/api/cart/add`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        product_id: productId,
        quantity,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log('Added to cart:', data);
    return data;
  } catch (error) {
    console.error('Failed to add to cart:', error);
    throw error;
  }
}

export async function updateCartQuantity(cartItemId: number, quantity: number) {
  try {
    const res = await fetch(`${API_URL}/api/cart/${cartItemId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to update cart:', error);
    throw error;
  }
}

export async function removeFromCart(cartItemId: string, userId?: string) {
  try {
    console.log('Removing cart item:', cartItemId, 'for user:', userId);
    const res = await fetch(`${API_URL}/api/cart/${cartItemId}?userId=${userId}`, {
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
    console.log('Removed from cart:', data);
    return data;
  } catch (error) {
    console.error('Failed to remove from cart:', error);
    throw error;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createOrder(
  userId: string,
  totalAmount: number,
  productId?: string,
  paymentId?: string
) {
  try {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        total_amount: totalAmount,
        status: 'CREATED',
        ...(productId && { product_id: productId }),
        ...(paymentId && { payment_id: paymentId }),
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
}

export async function getUserOrders(userId: string) {
  try {
    const res = await fetch(`${API_URL}/api/orders/user/${userId}`, {
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
    console.error('Failed to fetch user orders:', error);
    throw error;
  }
}

export async function getOrderById(orderId: string) {
  try {
    const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
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
    console.error('Failed to fetch order:', error);
    throw error;
  }
}

export async function getAllOrders() {
  try {
    const res = await fetch(`${API_URL}/api/orders`, {
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
    console.error('Failed to fetch all orders:', error);
    throw error;
  }
}

export async function updateOrder(
  orderId: string,
  updates: {
    status?: string;
    total_amount?: number;
    payment_id?: string;
    product_id?: string;
  }
) {
  try {
    const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
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
    console.error('Failed to update order:', error);
    throw error;
  }
}

export async function deleteOrder(orderId: string) {
  try {
    const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
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
    console.error('Failed to delete order:', error);
    throw error;
  }
}

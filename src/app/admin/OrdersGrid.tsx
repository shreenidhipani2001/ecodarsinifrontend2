'use client';

import { useEffect, useMemo, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ================= TYPES ================= */

type ProductImage = {
  id: string;
  url: string;
  thumbnail: string | null;
  card: string | null;
  full: string | null;
  alt: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  cms_image_ids: string[];
  images?: ProductImage[];
};

type Order = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  total_amount: number;
  created_at: string;
};

/* ================= IMAGE HELPER ================= */

const getProductImageUrl = (
  product?: Product,
  size: 'thumbnail' | 'card' | 'full' | 'url' = 'card'
): string => {
  if (!product?.images || product.images.length === 0) return '';
  const image = product.images[0];
  return image[size] || image.url || '';
};

/* ================= COMPONENT ================= */

export default function OrdersGrid() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!API_URL) throw new Error('API URL not configured');

        const [ordersRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/api/orders/`, {
            credentials: 'include',
            cache: 'no-store',
          }),
          fetch(`${API_URL}/api/products/`, {
            credentials: 'include',
            cache: 'no-store',
          }),
        ]);

        if (!ordersRes.ok) {
          throw new Error(`Orders: HTTP ${ordersRes.status}`);
        }
        if (!productsRes.ok) {
          throw new Error(`Products: HTTP ${productsRes.status}`);
        }

        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();

        const ordersList = Array.isArray(ordersData)
          ? ordersData
          : ordersData?.orders || ordersData?.data || [];

        const productsList = Array.isArray(productsData)
          ? productsData
          : productsData?.products || productsData?.data || [];

        setOrders(ordersList);
        setProducts(productsList);
      } catch (err: any) {
        console.error('Failed to load orders:', err);
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================= PRODUCT LOOKUP ================= */

  const productMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {} as Record<string, Product>);
  }, [products]);

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 py-20">
        {error}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center text-gray-400 py-20">
        No orders found
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {orders.map((order) => {
        const product = productMap[order.product_id];
        const imageUrl = getProductImageUrl(product, 'card');

        return (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden"
          >
            {/* Product Image */}
            {/* <div className="h-36 w-full bg-gray-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product?.name || 'Product image'}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}
            </div> */}
            <div className="h-52 w-full bg-gray-100 flex items-center justify-center">
  {imageUrl ? (
    <img
      src={imageUrl}
      alt={product?.name || 'Product image'}
      className="max-w-full max-h-full object-contain p-2 transition-transform duration-300 hover:scale-105"
    />
  ) : (
    <div className="text-gray-400 text-sm">
      No Image
    </div>
  )}
</div>


            {/* Order Info */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-green-600 truncate">
                {product?.name || 'Unknown Product'}
              </h3>

              <p className="text-sm text-black mt-1">
                Qty: {order.quantity}
              </p>

              <p className="text-sm text-black">
                Unit: ₹{product?.price ?? '--'}
              </p>

              <p className="mt-2 text-black font-bold">
                ₹{order.total_amount}
              </p>

              <p className="text-xs text-black mt-2">
                Ordered on{' '}
                {new Date(order.created_at).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

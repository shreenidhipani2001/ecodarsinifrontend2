'use client';

import { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { removeFromCart } from '../../lib/cartApi';
import toast from 'react-hot-toast';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type ProductImage = {
  id: string;
  url: string;
  thumbnail: string | null;
  card: string | null;
  full: string | null;
  alt: string;
};

export type Product = {
  id: string;
  name: string;
  price: number | string;
  cms_image_ids: string[];
  images?: ProductImage[];
  slug: string;
  description?: string;
  stock: number;
  category_id: string;
  category_name?: string;
  artist_name?: string;
  is_active: boolean;
  created_at?: string;
};

export type CartItem = {
  id: string;
  quantity: number;
  product_id: string;
  name: string;
  price: string;
  total_price: string;
  cms_image_ids?: string[];
  slug: string;
  created_at: string;
  image?: string;
};

interface CartModalProps {
  items: CartItem[];
  products: Product[];
  loading: boolean;
  onClose: () => void;
  onItemRemoved: (itemId: string) => void;
}

// Helper to get product image URL by matching product_id
// function getImageForCartItem(cartItem: CartItem, products: Product[]): string {
//   console.log('Getting image for cart item:', cartItem);  
//   const product = products.find((p) => p.id === cartItem.product_id);
//   if (product && product.images && product.images.length > 0) {
//     return product.images[0].url || product.images[0].card || '';
//   }
//   return '';
// }
function getImageForCartItem(cartItem: CartItem, products: Product[]): string {
  if (!cartItem?.product_id || products.length === 0) return '';

  const product = products.find(p => p.id === cartItem.product_id);
  if (!product?.images?.length) return '';

  return product.images[0].url || product.images[0].card || '';
}

export default function CartModal({
  items,
  products,
  loading,
  onClose,
  onItemRemoved,
}: CartModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [removing, setRemoving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { user } = useAuthStore();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleRemoveItem = async () => {
    if (!items[currentIndex]) return;
    
    setRemoving(true);
    try {
      console.log('Removing cart item id:', items[currentIndex].id, 'for user id:', user?.id);  
      await removeFromCart(items[currentIndex].id, user?.id);
      toast.success('Item removed from cart');

      // Notify parent to update cart state
      onItemRemoved(items[currentIndex].id);

      // Adjust current index if needed
      if (currentIndex >= items.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
      toast.error('Failed to remove item');
    } finally {
      setRemoving(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user?.id) {
      toast.error('Please login to continue');
      return;
    }

    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.total_price), 0);

    setProcessing(true);

    try {
      // Step 1: Create Razorpay order
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            user_id: user.id,
            items_count: items.length,
          },
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Eco Darsini',
        description: `Payment for ${items.length} item(s)`,
        order_id: orderData.order_id,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // Step 3: Verify payment
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: totalAmount,
                user_id: user.id,
                cart_items: items.map(item => ({
                  product_id: item.product_id,
                  quantity: item.quantity,
                  price: item.price,
                })),
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // Step 4: Create orders for each cart item
              const orderPromises = items.map(item =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/add`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    user_id: user.id,
                    total_amount: parseFloat(item.total_price),
                    status: 'CREATED',
                    payment_id: response.razorpay_payment_id,
                    product_id: item.product_id,
                  }),
                })
              );

              await Promise.all(orderPromises);

              toast.success('Payment successful! Order placed.');
              onClose();
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            toast.error('Payment verification failed');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
        },
        theme: {
          color: '#166534',
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast('Payment cancelled', { icon: '❌' });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(err instanceof Error ? err.message : 'Payment failed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <BaseModal title="My Cart" onClose={onClose}>
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
        </div>
      </BaseModal>
    );
  }

  if (!items || items.length === 0) {
    return (
      <BaseModal title="My Cart" onClose={onClose}>
        <div className="text-center text-gray-700 py-10">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-lg">Your cart is empty.</p>
        </div>
      </BaseModal>
    );
  }

  const item = items[currentIndex];
  if (!item ) {
  return (
    <BaseModal title="My Cart" onClose={onClose}>
      <div className="flex justify-center items-center h-64 text-gray-500">
        Cart Is Empty
      </div>
    </BaseModal>
  );
}
  const itemImage = getImageForCartItem(item, products);
  // const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
  const totalAmount = Array.isArray(items)
  ? items.reduce((sum, item) => {
      const price = parseFloat(item?.total_price ?? '0');
      return sum + (isNaN(price) ? 0 : price);
    }, 0)
  : 0;

  return (
    <BaseModal title="My Cart" onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Left - Product Image */}
          <div className="w-64 h-64 md:w-80 md:h-80 bg-gray-100 rounded-xl relative overflow-hidden flex-shrink-0">
            <img
              src={itemImage}
              alt={item?.name}
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          {/* Right - Product Details */}
          <div className="flex-1 flex flex-col justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
              <p className="text-gray-500 text-sm mt-1">Unit Price: ₹{parseFloat(item.price).toLocaleString()}</p>
              <p className="text-gray-600 mt-2">Quantity: {item.quantity}</p>
              <p className="text-green-600 font-bold text-xl mt-2">₹{parseFloat(item.total_price).toLocaleString()}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleBuyNow}
                disabled={processing}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
              >
                <ShoppingBag size={18} />
                {processing ? 'Processing...' : 'Buy Now'}
              </button>
              <button
                onClick={handleRemoveItem}
                disabled={removing}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 size={18} />
                {removing ? 'Removing...' : 'Remove'}
              </button>
            </div>

            {/* Pagination Buttons */}
            {items.length > 1 && (
              <>
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))
                    }
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                    disabled={currentIndex === 0}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev < items.length - 1 ? prev + 1 : prev
                      )
                    }
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                    disabled={currentIndex === items.length - 1}
                  >
                    Next
                  </button>
                </div>

                <p className="text-gray-500 text-sm text-center">
                  {currentIndex + 1} / {items.length}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span className="text-gray-700">Total ({items.length} items):</span>
            <span className="text-green-600">₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Full-screen Loading Spinner */}
      {(removing || processing) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="w-16 h-16 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </BaseModal>
  );
}

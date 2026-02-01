'use client';

import { useState } from 'react';
import BaseModal from './BaseModal';
import Image from 'next/image';
import { removeFromWishlist } from '../../lib/wishlistApi';
import toast from 'react-hot-toast';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';



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

export type WishlistItem = {
  id: number;
  user_id: string;
  product_id: string;
  name: string;
  price: number;
  cms_image_ids: string[];
  slug?: string;
  image?: string;
};

// interface WishlistModalProps {
//   items: WishlistItem[];
//   products: Product[];
//   loading: boolean;
//   onClose: () => void;
//   onItemRemoved?: (itemId: number) => void;
// }
interface WishlistModalProps {
  items: WishlistItem[];
  products: Product[];
  loading: boolean;
  onClose: () => void;
  onItemRemoved?: (itemId: number) => void;
  fetchCartItems?: () => Promise<void>;      // ✅ new prop
  fetchWishlistItems?: () => Promise<void>;  // ✅ new prop
}


// Helper to get product image URL by matching product_id
function getImageForWishlistItem(wishlistItem: WishlistItem, products: Product[]): string {
  const product = products.find((p) => p.id === wishlistItem.product_id);
  if (product && product.images && product.images.length > 0) {
    return product.images[0].url || product.images[0].card || '';
  }
  return '';
}

export default function WishlistModal({
  items,
  products,
  loading,
  onClose,
  onItemRemoved,fetchCartItems,    
  fetchWishlistItems,
}: WishlistModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [removing, setRemoving] = useState(false);
  const [removingT, setRemovingT] = useState(false);
  const { user } = useAuthStore();
  console.log('User in WishlistModal 1:', user);

  const handleRemoveItem = async () => {
    const item = items[currentIndex];
    if (!item || !user?.id) return;

    setRemoving(true);
    console.log('Removing item from wishlist:', item.id, 'for user id:', user.id);

    try {
      await removeFromWishlist(item?.id, user?.id);
      toast.success('Item removed from wishlist');

      // Tell parent to update list
      onItemRemoved?.(item.id);

      // Adjust index locally (optimistic UI)
      if (currentIndex >= items.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      toast.error('Failed to remove item');
    } finally {
      setRemoving(false);
    }
  };

  
  
   
 
 
//   const handleAddToCart = async () => {
//     console.log('handleAddToCart called');
//     setRemovingT(true);
//     const item = items[currentIndex]; // ✅ always correct item
//     const userId = user?.id;
//  console.log('Adding to cart for user id:', userId);
//  console.log('Adding to cart item:', item);
//    if (!item || !user?.id) {
//       toast.error("User or item missing");
//       return;
//     }
  
//     try {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/cart/add`,
//         {
//           method: "POST",
//           credentials: "include",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             user_id: user.id,
//             product_id: item.product_id, // ✅ CORRECT ID
//             quantity: 1,
//           }),
//         }
//       );
  
//       const data = await res.json();
//       console.log("Add to Cart API response ::::", data);
  
//       if (!res.ok) {
//         throw new Error(data.error || "Failed to add to cart");
//       }

//       const deleteFromWishList =await removeFromWishlist(item?.id, user?.id);
//       console.log("Remove from wishlist response ::::", deleteFromWishList);

  
//       toast.success("Item added to cart successfully");
//     } catch (err: any) {
//       console.error(err);
//       toast.error(err.message || "Something went wrong");
//     } finally {
//       setRemovingT(false);
//     }
//   };
   
const handleAddToCart = async () => {
  setRemovingT(true);
  const item = items[currentIndex];
  const userId = user?.id;

  if (!item || !userId) {
    toast.error("User or item missing");
    setRemovingT(false);
    return;
  }

  try {
    // Add to cart
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/add`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        product_id: item.product_id,
        quantity: 1,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add to cart");

    // Remove from wishlist
    await removeFromWishlist(item.id, userId);
    toast.success("Item added to cart successfully");

    // Refresh parent state
    await fetchCartItems?.();      // refresh cart in Dashboard
    await fetchWishlistItems?.();  // refresh wishlist in Dashboard

  } catch (err: any) {
    console.error(err);
    toast.error(err.message || "Something went wrong");
  } finally {
    setRemovingT(false);
  }
};


 
   
  

  if (loading) {
    return (
      <BaseModal title="My Wishlist" onClose={onClose}>
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      </BaseModal>
    );
  }

  if (items.length === 0) {
    return (
      <BaseModal title="My Wishlist" onClose={onClose}>
        <div className="text-center text-gray-700 py-10">
          <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-lg">Your wishlist is empty.</p>
        </div>
      </BaseModal>
    );
  }

  const item = items[currentIndex];
  const itemImage = getImageForWishlistItem(item, products);

  return (
    <BaseModal title="My Wishlist" onClose={onClose}>
      <div className="flex flex-col gap-6">
        {/* Main content area */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Image container */}
          <div className="w-64 h-64 md:w-80 md:h-80 bg-gray-100 rounded-xl relative overflow-hidden flex-shrink-0">
            <Image
              src={itemImage}
              alt={item.name}
              fill
              className="object-cover rounded-xl"
              sizes="(max-width: 768px) 256px, 320px"
              priority={currentIndex === 0} // optional optimization
            />
          </div>

          {/* Details + actions */}
          <div className="flex-1 flex flex-col justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
              <p className="text-green-600 font-bold text-xl mt-4">
                ₹{item.price.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="flex gap-3 mt-44">
              <button
                onClick={handleAddToCart}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-semibold"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>

              <button
                onClick={handleRemoveItem}
                disabled={removing}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 size={18} />
                {removing ? 'Removing…' : 'Remove'}
              </button>
            </div>

            {/* Pagination controls */}
            {items.length > 1 && (
              <>
                <div className="flex items-center gap-4 mt-6">
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(items.length - 1, prev + 1))}
                    disabled={currentIndex === items.length - 1}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>

                <p className="text-gray-500 text-sm text-center mt-2">
                  {currentIndex + 1} of {items.length}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Summary footer */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-end items-center text-lg font-semibold gap-2">
            
            <span className="text-black">Items in wishlist -</span>
            <span className="text-green-600">{items.length}</span>
          </div>
        </div>
      </div>

      {/* Full-screen Loading Spinner */}
      {(removing || removingT) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="w-16 h-16 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </BaseModal>
  );
}
'use client';

import { X, Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import yyy from '../../../public/bdjhbawdhja.jpeg';
import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import toast from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  price: number;
  discount?: number;
  image: string | StaticImageData;
  // description?: string;  ← add later
};

interface Props {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
  const finalPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;
    console.log("Product Image:", product);

    const [loading, setLoading] = useState(false);
    const { isAuthenticated ,user } = useAuthStore();
    console.log("Is Authenticated:", isAuthenticated);
    console.log("User Info in product  modal :", user);




   const handleAddToCart = async () => {
    setLoading(true);
        if (!isAuthenticated || !user) {
            toast.error("Please login first");
          return;
        }
        console.log('Adding to cart for user id:', user);
      
        try {
         
            
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/cart/add`,
            {
              method: "POST",
              credentials: "include", // send cookie if needed
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_id: user.id,  
                product_id: product.id,
                quantity: 1,
              }),
            }
          );
          const data = await res.json();
      console.log("Added to Cart API response ::::", data);
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to add to cart");
          }
          toast.success("Item added to cart successfully");
          
        } catch (err: any) {
          console.error(err);
          toast.error(err.message || "Something went wrong");
        } finally {
          setLoading(false);
        }
      };
      
 
    const handleAddToWishlist = async () => {
         setLoading(true);
         if (!isAuthenticated || !user) {
            toast.error("Please login first");
            return;
          }
          console.log('Adding to cart for user id:', user);
      
        try {
           
      
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/wishes/add`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_id: user.id,  
                product_id: product.id,
              }),
            }
          );
          
           
          const data = await res.json();
          console.log("Wishlist API response data:", data);
          if (res.status === 409) {
            toast("Already in wishlist ");
            return;
          }
      
          if (!res.ok) {
            const err = await res.json();
            console.log("Error response from wishlist API:", err);
            throw new Error(err.error || "Failed to add to wishlist");
          }
      
          toast.success("Item added to wishlist ");
        } catch (err) {
          console.log('Error adding the product to wish list::::---',err);
          toast.error("Something went wrong");
        } finally {
          setLoading(false);
        }
      };
      


  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 p-2  rounded-full bg-red-400 hover:bg-red-500 transition"
        >
          <X size={15} />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-1/2 relative aspect-square md:aspect-[4/5]">
            
           <Image
                src={product.image ?? yyy}
                alt={product.name}
                fill
                placeholder="blur"
                className="object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
                />

          </div>

           

<div className="p-6 md:p-8 flex-1 flex">
  {loading ? (
    /* LOADING STATE */
    <div className="flex flex-1 items-center justify-center">
      <div className="relative">
        <div className="h-14 w-14 rounded-full border-4 border-gray-200"></div>
        <div className="absolute top-0 left-0 h-14 w-14 rounded-full border-4 border-black border-t-transparent animate-spin"></div>
      </div>
    </div>
  ) : (
    /* CONTENT */
    <div className="flex flex-1 flex-col">
      <h2 className="text-2xl font-bold mt-3 text-gray-900">
        {product.name}
      </h2>

      <div className="mt-5 flex items-center gap-4">
        <span className="text-3xl font-bold text-gray-900">
          ₹{finalPrice}
        </span>

        {typeof product.discount === "number" && product.discount > 0 && (
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 line-through">
              ₹{product.price}
            </span>
            <span className="text-sm font-medium text-green-600">
              {product.discount}% OFF
            </span>
          </div>
        )}
      </div>

      {/* PUSH TO BOTTOM */}
      <div className="mt-auto pt-8 flex gap-4">
        <button
          onClick={handleAddToCart}
          className="flex-1 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2"
        >
          <ShoppingCart size={20} />
          Add to Cart
        </button>

        <button
          onClick={handleAddToWishlist}
          className="p-4 rounded-xl border border-gray-300 hover:bg-gray-50 transition"
          title="Add to Wishlist"
        >
          <Heart size={24} className="text-red-500" />
        </button>
      </div>
    </div>
  )}
</div>






        </div>
      </div>
    </div>
  );
}
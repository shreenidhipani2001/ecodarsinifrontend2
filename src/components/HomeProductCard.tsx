'use client';

import Image from 'next/image';
import { ShoppingCart, Heart, Zap } from 'lucide-react';
import type { StaticImageData } from 'next/image';

interface ProductImage {
  id: string;
  url: string;
  thumbnail: string | null;
  card: string | null;
  full: string | null;
  alt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  image?: string | StaticImageData;
  images?: ProductImage[];
  category_name?: string;
  artist_name?: string;
  stock?: number;
  // Additional fields from API (not used in this component)
  slug?: string;
  description?: string;
  category_id?: string;
  cms_image_ids?: string[];
  is_active?: boolean;
  created_at?: string;
}

interface HomeProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
}

function getProductImageUrl(product: Product): string {
  if (product.image && typeof product.image === 'string') {
    return product.image;
  }
  if (product.images && product.images.length > 0) {
    return product.images[0].card || product.images[0].url || '';
  }
  return '';
}

export default function HomeProductCard({
  product,
  onAddToCart,
  onBuyNow,
  onAddToWishlist,
}: HomeProductCardProps) {
  const finalPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const imageUrl = getProductImageUrl(product);
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-100">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}

        {/* Discount Badge */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            {product.discount}% OFF
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToWishlist(product);
          }}
          className="absolute top-3 right-3 h-9 w-9 bg-white rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
          title="Add to Wishlist"
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {product.category_name && (
          <span className="text-xs text-green-600 font-medium uppercase tracking-wide">
            {product.category_name}
          </span>
        )}

        {/* Product Name */}
        <h3 className="font-medium text-gray-800 line-clamp-2 mt-1 mb-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Artist Name */}
        {product.artist_name && (
          <p className="text-xs text-gray-500 mb-2">by {product.artist_name}</p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-gray-900">₹{finalPrice}</span>
          {product.discount && product.discount > 0 && (
            <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={isOutOfStock}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuyNow(product);
            }}
            disabled={isOutOfStock}
            className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="h-4 w-4" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

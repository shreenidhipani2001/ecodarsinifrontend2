'use client';

import { useEffect, useState } from 'react';
import { Star, User, Package, Calendar, MessageSquare, Eye } from 'lucide-react';
import ProductDetailModal from '../../components/ProductDetailModal';

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

type Review = {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // Joined data (if available)
  user_name?: string;
  user_email?: string;
  product_name?: string;
};

const getProductImageUrl = (product: Product, size: 'thumbnail' | 'card' | 'full' | 'url' = 'url'): string => {
  if (!product.images || product.images.length === 0) {
    return '';
  }
  const image = product.images[0];
  return image[size] || image.url || '';
};

export default function ReviewsGrid() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error('API URL not configured');

        // Fetch reviews and products in parallel
        const [reviewsRes, productsRes] = await Promise.all([
          fetch(`${apiUrl}/api/review/`, {
            credentials: 'include',
            cache: 'no-store',
          }),
          fetch(`${apiUrl}/api/products/`, {
            credentials: 'include',
            cache: 'no-store',
          }),
        ]);

        if (!reviewsRes.ok) {
          throw new Error(`Reviews: HTTP ${reviewsRes.status}`);
        }
        if (!productsRes.ok) {
          throw new Error(`Products: HTTP ${productsRes.status}`);
        }

        const reviewsData = await reviewsRes.json();
        const productsData = await productsRes.json();

        console.log('Fetched reviews:', reviewsData);
        console.log('Fetched products:', productsData);

        const reviewsList = Array.isArray(reviewsData) ? reviewsData : reviewsData?.reviews || reviewsData?.data || [];
        const productsList = Array.isArray(productsData) ? productsData : productsData?.products || productsData?.data || [];

        setReviews(reviewsList);
        setProducts(productsList);
      } catch (err: any) {
        console.error('Failed to load data:', err);
        setError(err.message || 'Could not load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            className={
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-600'
            }
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-300">
          {rating}/5
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mb-4 mx-auto" />
          <p className="text-green-400 text-lg">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] text-red-400">
        <div className="text-center">
          <p className="text-xl mb-2">Failed to load reviews</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <MessageSquare size={64} className="mx-auto text-gray-600 mb-4" />
          <p className="text-xl text-gray-400">No reviews yet</p>
          <p className="text-sm text-gray-600 mt-2">Reviews will appear here once customers submit them</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 border border-green-900/30 hover:border-green-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-900/20"
          >
            {/* Rating */}
            <div className="mb-4">
              {renderStars(review.rating)}
            </div>

            {/* Comment */}
            <div className="mb-4 min-h-[60px]">
              {review.comment ? (
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 ">
                  {review.comment}
                </p>
              ) : (
                <p className="text-gray-500 text-sm italic">No comment provided</p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700 my-4" />

            {/* User Info */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-900/50 flex items-center justify-center">
                <User size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">
                  {review.user_name || 'Anonymous User'}
                </p>
                {review.user_email && (
                  <p className="text-xs text-gray-500">{review.user_email}</p>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center">
                <Package size={16} className="text-blue-400" />
              </div>
              <p className="text-sm text-gray-300">
                {review.product_name || `Product ID: ${review.product_id.slice(0, 8)}...`}
              </p>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <Calendar size={14} />
              <span className="text-xs">{formatDate(review.created_at)}</span>
            </div>

            {/* View Product Button */}
            <button
              onClick={() => handleViewProduct(review.product_id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Eye size={16} />
              View Product
            </button>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="sticky bottom-0 mt-6 p-4 bg-gray-900/90 backdrop-blur-sm rounded-xl border border-green-900/30">
        <div className="flex items-center justify-between">
          <p className="text-gray-400">
            Total Reviews: <span className="text-green-400 font-semibold">{reviews.length}</span>
          </p>
          <p className="text-gray-400">
            Average Rating:{' '}
            <span className="text-yellow-400 font-semibold">
              {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
            </span>
            /5
          </p>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={{
            ...selectedProduct,
            price: typeof selectedProduct.price === 'string'
              ? parseFloat(selectedProduct.price)
              : selectedProduct.price
          }}
          imageUrl={getProductImageUrl(selectedProduct, 'url')}
          isAdmin={true}
          onClose={() => setSelectedProduct(null)}
          onProductUpdate={(updatedProduct) => {
            setProducts((prev) =>
              prev.map((p) =>
                p.id === updatedProduct.id
                  ? { ...updatedProduct, images: updatedProduct.images || p.images, price: updatedProduct.price }
                  : p
              )
            );
            setSelectedProduct({
              ...updatedProduct,
              images: updatedProduct.images || selectedProduct.images,
              price: updatedProduct.price
            });
          }}
        />
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { X, Save, Edit3, Eye, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '../../public/svg/Logo';
import { Heart, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
// const { isAuthenticated, user } = useAuthStore();



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
  slug: string;
  description?: string;
  price: number;
  stock: number;
  category_id: string;
  cms_image_ids: string[];
  images?: ProductImage[];
  artist_name?: string;
  is_active: boolean;
  created_at?: string;
};

interface Props {
  product: Product;
  imageUrl: string;
  isAdmin: boolean;
  onClose: () => void;
  onProductUpdate?: (updatedProduct: Product) => void;
}

export default function ProductDetailModal({
  product,
  imageUrl,
  isAdmin,
  onClose,
  onProductUpdate,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    price: product.price,
    stock: product.stock,
    artist_name: product.artist_name || '',
    is_active: product.is_active,
  });
  const { user } = useAuthStore();

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddToCart = async () => {
    setLoading(true);
        // if (!isAuthenticated || !user) {
        //     toast.error("Please login first");
        //   return;
        // }
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
                user_id: user?.id,  
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


  const handleSubmitReview = async () => {
    if (!user?.id) {
      toast.error("Please login to add a review");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/review/add`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            product_id: product.id,
            rating: reviewRating,
            comment: reviewComment || null,
          }),
        }
      );

      const data = await res.json();
      console.log("Review API response:", data);

      if (res.status === 409) {
        toast.error("You have already reviewed this product");
        setShowReviewModal(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to add review");
      }

      toast.success("Review added successfully!");
      setShowReviewModal(false);
      setReviewRating(5);
      setReviewComment('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
      
 
    const handleAddToWishlist = async () => {
         setLoading(true);
        //  if (!isAuthenticated || !user) {
        //     toast.error("Please login first");
        //     return;
        //   }
        //   console.log('Adding to cart for user id:', user);
      
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
                user_id:user?.id,  
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
      

  const handleSave = async () => {
    setLoading(true);
    try {
      const productId = product?.id;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData?.name,
            slug: formData?.slug,
            description: formData?.description,
            price: formData?.price,
            stock: formData?.stock,
            artist_name: formData?.artist_name,
            is_active: formData?.is_active,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update product');
      }

      const updatedProduct = await res.json();
      console.log('Updated product:', updatedProduct);
      toast.success('Product updated successfully');
      setIsEditing(false);

      if (onProductUpdate) {
        onProductUpdate(updatedProduct);
      }
    } catch (err: any) {
      console.error('Error updating product:', err);
      toast.error(err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      artist_name: product.artist_name || '',
      is_active: product.is_active,
    });
    setIsEditing(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative flex flex-col">
        {/* Header */}
        <div
            //   className="
            //   flex items-center justify-between p-4 border-b
            // bg-gradient-to-r
            // from-emerald-850 via-emerald-700 to-emerald-300
            // bg-[length:300%_300%]
            // animate-green-shift

            //   "
        className="
        flex items-center justify-between p-4 border-b
        bg-green-700

        "
        >
        {/* <div className="flex items-center justify-between p-4 border-b bg-green-700"> */}
          <div className="flex items-center gap-3">
            {/* {isAdmin ? (
              <Edit3 size={20} className="text-green-600" />
            ) : (
              <Eye size={20} className="text-blue-600" />
            )} */}
            <h2 className="text-xl font-semibold text-white-800">
              {isAdmin ? 'Product Details' : 'Product Details'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition"
          >
            <X size={18} className="text-red-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Image Section */}
            <div className="lg:w-1/3">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-md">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}
              </div>
              {/* Status Badge */}
              <div className="mt-4 flex justify-center">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    formData.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {formData.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Details Section */}
            <div className="lg:w-2/3 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Product Name
                </label>
                {isAdmin && isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{formData.name}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Slug
                </label>
                {isAdmin && isEditing ? (
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500  text-black"
                  />
                ) : (
                  <p className="text-gray-700">{product.slug}</p>
                )}
              </div>

              {/* Price & Stock Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Price (₹)
                  </label>
                  {isAdmin && isEditing ? (
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500  text-black"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-green-600">
                      ₹{formData.price.toLocaleString()}
                    </p>
                  )}
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Stock
                  </label>
                  {isAdmin && isEditing ? (
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  ) : (
                    <p
                      className={`text-lg font-medium ${
                        formData.stock > 0 ? 'text-gray-900' : 'text-red-600'
                      }`}
                    >
                      {formData.stock > 0 ? `${formData.stock} units` : 'Out of Stock'}
                    </p>
                  )}
                </div> */}
              </div>

              {/* Artist Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Artist / Creator
                </label>
                {isAdmin && isEditing ? (
                  <input
                    type="text"
                    name="artist_name"
                    value={formData.artist_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500  text-black"
                  />
                ) : (
                  <p className="text-gray-700">{formData.artist_name || 'Not specified'}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Description
                </label>
                {isAdmin && isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500  text-black"
                  />
                ) : (
                  <p className="text-gray-700">
                    {formData.description || 'No description available'}
                  </p>
                )}
              </div>

              {/* Active Status (Admin Edit) */}
              {isAdmin && isEditing && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Product is Active
                  </label>
                </div>
              )}

              {/* Read-only Info */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {/* <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Product ID:</span>
                    <p className="text-gray-700 font-mono text-xs break-all">{product.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Category ID:</span>
                    <p className="text-gray-700 font-mono text-xs break-all">
                      {product.category_id}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Created At:</span>
                  <p className="text-gray-700 text-sm">{formatDate(product.created_at)}</p>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-green-700">
          {isAdmin ? (
            <div className="flex justify-end gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-6 py-2 rounded-lg border bg-slate-100 text-slate-900 hover:bg-slate-300 transition disabled:opacity-50"
                    // className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-300 transition flex items-center gap-2 disabled:opacity-50"
                    // className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 rounded-lg bg-white text-green-800 hover:bg-slate-300 transition flex items-center gap-2"
                  // className="px-6 py-2 rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-300 transition flex items-center gap-2"
                  // className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Edit3 size={18} />
                  Edit Product
                </button>
              )}
            </div>
          ) : (
            // <div className="flex justify-end">
            //   <Logo className="w-12 h-auto text-green-400" />
            // </div>
            <div className="flex ml-27 justify-end gap-3 w-150 ">
                   <button
                      onClick={() => setShowReviewModal(true)}
                      disabled={loading}
                      className="flex-1 bg-black text-white px-3 py-3 rounded-xl font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                    <Camera color="white" size={22} />
                   Add a Review
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={loading}
                    className="flex-1 bg-black text-white px-3 py-3 rounded-xl font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>

                  <button
                    onClick={handleAddToWishlist}
                    disabled={loading}
                    className="flex-1 bg-black text-white px-3 py-3 rounded-xl font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    // className="p-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
                    title="Add to Wishlist"
                  >
                    <Heart size={22} className="text-white" />
                    Add to Wishlist
                  </button>
            </div>
          )
          }
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
            {/* Review Modal Header */}
            <div className="flex items-center justify-between p-4 bg-green-800">
              <h3 className="text-lg font-semibold text-white">
                Review for {product.name}
              </h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewRating(5);
                  setReviewComment('');
                }}
                className="p-1 rounded-full hover:bg-green-700 transition"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Review Modal Content */}
            <div className="p-6 space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-10 h-10 ${
                          star <= reviewRating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-lg font-medium text-gray-700">
                    {reviewRating}/5
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-800 resize-none"
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {reviewComment.length}/5000
                </p>
              </div>
            </div>

            {/* Review Modal Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewRating(5);
                  setReviewComment('');
                }}
                disabled={loading}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

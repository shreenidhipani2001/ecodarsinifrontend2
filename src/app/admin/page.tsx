"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ProductsCatalogue from "./ProductsCatalogue";
import OrdersGrid from "./OrdersGrid";
import PaymentsList from "./PaymentsList";
import ReviewsGrid from "./ReviewsGrid";
import OrderTrackingGrid from "./OrderTrackingGrid";
import UsersGrid from "./UsersGrid";
import type { AdminSection } from "./types";
import RoleGuard from "../../components/RoleGuard";
import { useAuthStore } from '../../store/useAuthStore';
import toast from "react-hot-toast";

type Category = {
  id: string;
  name: string;
};

type ProductFormData = {
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  category_id: string;
  artist_name: string;
};

const initialFormData: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  price: "",
  stock: "",
  category_id: "",
  artist_name: "",
};

export default function AdminLayout() {
  const [active, setActive] = useState<AdminSection>("products");
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catalogueKey, setCatalogueKey] = useState(0);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) return;

        const res = await fetch(`${apiUrl}/api/categories/`);
        if (!res.ok) throw new Error('Failed to fetch categories');

        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data?.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleAddProduct = () => {
    if (!isAdmin) {
      toast.error("You do not have permission to add products.");
      return;
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.slug || !formData.price || !formData.stock || !formData.category_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('API URL not configured');

      const res = await fetch(`${apiUrl}/api/products/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          category_id: formData.category_id,
          cms_image_ids: [],
          artist_name: formData.artist_name,
          added_by: user?.id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add product');
      }

      toast.success("Product added successfully!");
      handleCloseModal();
      setCatalogueKey(prev => prev + 1);
    } catch (err) {
      console.error('Failed to add product:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <RoleGuard allowedRole="ADMIN">
      <div className="flex min-h-screen bg-gray-900">
        <header className="sr-only">Admin Sidebar</header>
        <Sidebar active={active} setActive={setActive} />

        <main className="flex-1 min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black">
          <div className="p-6">
            {/* {active === "dashboard" && (
              <div>
                <h1 className="text-3xl font-bold text-green-400 mb-6">Dashboard</h1>
                <DashboardGrid />
              </div>
            )} */}
            {active === "products" && (
              <div>
                <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl font-bold text-green-400 mb-2">Product Catalogue</h1>
                <button onClick={handleAddProduct} className="bg-white text-green-500 px-5 py-2 rounded-full border border-green-400 hover:bg-green-50 transition text-lg font-bold">
                  Add a product
                </button>               
                </div>
                <ProductsCatalogue key={catalogueKey} />
              </div>
            )}
            {active === "orders" && (
              <div>
                <h1 className="text-3xl font-bold text-green-400 mb-6">Orders</h1>
                <OrdersGrid />
              </div>
            )}
            {active === "payments" && (
              <div>
                <h1 className="text-3xl font-bold text-green-400 mb-6">Payments</h1>
                <PaymentsList />
              </div>
            )}
            {active === "reviews" && (
              <div>
                <h1 className="text-3xl font-bold text-green-400 mb-6">Reviews</h1>
                <ReviewsGrid />
              </div>
            )}
            {active === "addresses" && (
              <div>
                <h1 className="text-3xl font-bold text-green-400 mb-6">Order Tracking</h1>
                <OrderTrackingGrid />
              </div>
            )}
            {active === "users" && (
              <div>
                <UsersGrid />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-green-700 text-white px-6 py-4">
              <h2 className="text-xl font-bold">Add Product</h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Product Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-black"
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Slug */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-gray-50 text-black"
                  placeholder="auto-generated-slug"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none text-black"
                  placeholder="Enter product description"
                />
              </div>

              {/* Price and Stock in a row */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-black"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-black"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-black"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Artist Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Artist Name
                </label>
                <input
                  type="text"
                  name="artist_name"
                  value={formData.artist_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-black"
                  placeholder="Enter artist name"
                />
              </div>

              {/* Image Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                  <p className="text-gray-500 text-sm">Please add Image in AWS</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-screen Loading Spinner */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="w-16 h-16 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </RoleGuard>
  );
}

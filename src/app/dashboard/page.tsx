'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../user/SideBar';
import BookFlip from '../admin/ProductsCatalogue';
import { useAuthStore } from '../../store/useAuthStore';
import WishlistModal from '../../components/WishlistModal';
import CartModal from '../../components/CartModal';
import ProfileModal from '../../components/ProfileModal';
import TrackOrderModal from '../../components/TrackOrderModal';
import RoleGuard from '../../components/RoleGuard';
import { getCart } from '../../../lib/cartApi';
import { getWishlist } from '../../../lib/wishlistApi';
import toast from 'react-hot-toast';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

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
  images?: ProductImage[];
  slug: string;
  created_at: string;
  image?: string;
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

// ────────────────────────────────────────────────
// Helper to get product image URL
// ────────────────────────────────────────────────

function getProductImageUrl(product: Product, size: 'thumbnail' | 'card' | 'full' | 'url' = 'url'): string {
  if (!product.images || product.images.length === 0) {
    return '';
  }
  const image = product.images[0];
  return image[size] || image.url || '';
}

export default function DashboardPage() {
  const [activeModal, setActiveModal] = useState<'profile' | 'cart' | 'wishlist' | 'track' | null>(null);
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Products state (fetched once, shared with modals)
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  // Wishlist state
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const userId = (user as any)?.user?.id || user?.id;

  const dummyUser = {
    id: userId,
    name: (user as any)?.user?.name || (user as any)?.name || 'User',
    email: user?.email || '',
    role: user?.role,
    phone: (user as any)?.user?.phone || (user as any)?.phone || '',
  };

  // ────────────────────────────────────────────────
  // Products fetching (once on mount)
  // ────────────────────────────────────────────────

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error('API URL not set');

        const res = await fetch(`${apiUrl}/api/products/`, {
          cache: 'no-store',
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const productList = Array.isArray(data) ? data : data?.products || data?.data || [];
        setProducts(productList);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ────────────────────────────────────────────────
  // Cart fetching
  // ────────────────────────────────────────────────

  const fetchCartItems = useCallback(async () => {
    if (!userId) return;
    setCartLoading(true);
    try {
      const data = await getCart(userId);
      console.log('Fetched cart items:', data);
      // Just store raw cart items - CartModal will match with products for images
      setCartItems(data || []);
    } catch (err) {
      console.log('Failed to fetch cart items:', err);
      toast.error('Failed to load cart');
    } finally {
      setCartLoading(false);
    }
  }, [userId]);

  // ────────────────────────────────────────────────
  // Wishlist fetching
  // ────────────────────────────────────────────────

  const fetchWishlistItems = useCallback(async () => {
    if (!userId) return;
    setWishlistLoading(true);
    try {
      const data = await getWishlist(userId);
      // Just store raw wishlist items - WishlistModal will match with products for images
      setWishlistItems(data || []);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      toast.error('Failed to load wishlist');
    } finally {
      setWishlistLoading(false);
    }
  }, [userId]);

  // Load data when corresponding modal opens
  useEffect(() => {
    console.log('Active modal:', activeModal, 'userId:', userId);
    if (activeModal === 'cart' && userId) {
      fetchCartItems();
    }
    if (activeModal === 'wishlist' && userId) {
      fetchWishlistItems();
    }
  }, [activeModal, userId, fetchCartItems, fetchWishlistItems]);

  // ────────────────────────────────────────────────
  // Handlers
  // ────────────────────────────────────────────────

  const handleCartItemRemoved = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleWishlistItemRemoved = (itemId: number) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // ────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────

  return (
    <RoleGuard allowedRole="USER">
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenModal={setActiveModal}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Product Catalogue</h1>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 bg-green-400 rounded-md hover:bg-green-700 text-black font-semibold"
            >
              {isSidebarOpen ? 'Close' : 'Menu'}
            </button>
          </header>

          <main className="flex-1 overflow-hidden">
            <BookFlip />
            {/* <BookFlip products={products} loading={productsLoading} onProductsChange={setProducts} /> */}
          </main>
        </div>

        {/* Modals */}
        {activeModal === 'profile' && (
          <ProfileModal user={dummyUser} onClose={() => setActiveModal(null)} />
        )}

        {activeModal === 'cart' && (
          <CartModal
            items={cartItems}
            products={products}
            loading={cartLoading}
            onClose={() => setActiveModal(null)}
            onItemRemoved={handleCartItemRemoved}
          />
        )}

        {activeModal === 'wishlist' && (
          <WishlistModal
            items={wishlistItems}
            products={products}
            loading={wishlistLoading}
            onClose={() => setActiveModal(null)}
            onItemRemoved={handleWishlistItemRemoved}
            fetchCartItems={fetchCartItems}          // ✅ new prop
            fetchWishlistItems={fetchWishlistItems}  // ✅ new prop
          />
        )}

        {activeModal === 'track' && userId && (
          <TrackOrderModal
            userId={userId}
            onClose={() => setActiveModal(null)}
          />
        )}
      </div>
    </RoleGuard>
  );
}
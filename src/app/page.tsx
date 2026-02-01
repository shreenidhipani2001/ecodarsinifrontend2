'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

import { useAuthStore } from '../store/useAuthStore';
import HomeHeader from '../components/HomeHeader';
import HeroBanner from '../components/HeroBanner';
import CategoryFilter from '../components/CategoryFilter';
import HomeProductCard from '../components/HomeProductCard';
import HomeFooter from '../components/HomeFooter';
import AuthPromptModal from '../components/AuthPromptModal';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

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
  slug: string;
  description?: string;
  stock: number;
  category_id: string;
  category_name?: string;
  cms_image_ids: string[];
  images?: ProductImage[];
  artist_name?: string;
  is_active: boolean;
  created_at?: string;
}

interface Category {
  id: string;
  name: string;
}

type ModalType = 'none' | 'authPrompt' | 'login' | 'register';
type ActionType = 'cart' | 'wishlist' | 'buy';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const productGridRef = useRef<HTMLDivElement>(null);

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pendingAction, setPendingAction] = useState<{
    type: ActionType;
    product: any;
  } | null>(null);

  // Cart/Wishlist counts (for header)
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Fetch products
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
        const productList = Array.isArray(data)
          ? data
          : data?.products || data?.data || [];

        // Filter only active products
        const activeProducts = productList.filter((p: Product) => p.is_active);
        setProducts(activeProducts);
      } catch (err) {
        console.error('Failed to load products:', err);
        toast.error('Failed to load products');
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error('API URL not set');

        const res = await fetch(`${apiUrl}/api/categories/`, {
          cache: 'no-store',
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const categoryList = Array.isArray(data)
          ? data
          : data?.categories || data?.data || [];
        setCategories(categoryList);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch cart and wishlist counts for authenticated users
  useEffect(() => {
    const fetchCounts = async () => {
      if (!isAuthenticated || !user?.id) {
        setCartCount(0);
        setWishlistCount(0);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        // Fetch cart count
        const cartRes = await fetch(`${apiUrl}/api/cart/user/${user.id}`, {
          credentials: 'include',
        });
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          const cartItems = Array.isArray(cartData) ? cartData : cartData?.items || [];
          setCartCount(cartItems.length);
        }

        // Fetch wishlist count
        const wishlistRes = await fetch(`${apiUrl}/api/wishes/unique/${user.id}`, {
          credentials: 'include',
        });
        if (wishlistRes.ok) {
          const wishlistData = await wishlistRes.json();
          const wishlistItems = Array.isArray(wishlistData)
            ? wishlistData
            : wishlistData?.items || [];
          setWishlistCount(wishlistItems.length);
        }
      } catch (err) {
        console.error('Failed to fetch counts:', err);
      }
    };

    fetchCounts();
  }, [isAuthenticated, user?.id]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === null || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Scroll to products
  const scrollToProducts = () => {
    productGridRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle product actions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleProductAction = async (product: any, actionType: ActionType) => {
    if (!isAuthenticated) {
      setPendingAction({ type: actionType, product });
      setActiveModal('authPrompt');
      return;
    }

    // Perform the action
    await performAction(product, actionType);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const performAction = async (product: any, actionType: ActionType) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || !user?.id) return;

    try {
      if (actionType === 'cart' || actionType === 'buy') {
        const res = await fetch(`${apiUrl}/api/cart/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
          }),
        });

        if (!res.ok) throw new Error('Failed to add to cart');

        toast.success('Added to cart!');
        setCartCount((prev) => prev + 1);

        if (actionType === 'buy') {
          router.push('/dashboard');
        }
      } else if (actionType === 'wishlist') {
        const res = await fetch(`${apiUrl}/api/wishes/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            user_id: user.id,
            product_id: product.id,
          }),
        });

        if (!res.ok) throw new Error('Failed to add to wishlist');

        toast.success('Added to wishlist!');
        setWishlistCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Action error:', err);
      toast.error(`Failed to ${actionType === 'wishlist' ? 'add to wishlist' : 'add to cart'}`);
    }
  };

  // Modal handlers
  const openLoginModal = () => {
    setActiveModal('login');
  };

  const handleAuthPromptLogin = () => {
    setActiveModal('login');
  };

  const handleAuthPromptSignUp = () => {
    setActiveModal('register');
  };

  const handleBackToPrompt = () => {
    setActiveModal('authPrompt');
  };

  const handleSwitchToRegister = () => {
    setActiveModal('register');
  };

  const handleSwitchToLogin = () => {
    setActiveModal('login');
  };

  const closeAllModals = () => {
    setActiveModal('none');
    setPendingAction(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <HomeHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onLoginClick={openLoginModal}
      />

      {/* Hero Banner */}
      <HeroBanner onShopNowClick={scrollToProducts} />

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        loading={categoriesLoading}
      />

      {/* Products Section */}
      <section ref={productGridRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name || 'Products'
                : 'All Products'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-500">Loading products...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-6xl mb-4">🌱</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">
              {searchQuery
                ? `No products match "${searchQuery}"`
                : 'No products available in this category'}
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <HomeProductCard
                key={product.id}
                product={product}
                onAddToCart={(p) => handleProductAction(p, 'cart')}
                onBuyNow={(p) => handleProductAction(p, 'buy')}
                onAddToWishlist={(p) => handleProductAction(p, 'wishlist')}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <HomeFooter />

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={activeModal === 'authPrompt'}
        onClose={closeAllModals}
        onLoginClick={handleAuthPromptLogin}
        onSignUpClick={handleAuthPromptSignUp}
        actionType={pendingAction?.type}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={activeModal === 'login'}
        onClose={closeAllModals}
        onBackToPrompt={pendingAction ? handleBackToPrompt : undefined}
        onSwitchToRegister={handleSwitchToRegister}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={activeModal === 'register'}
        onClose={closeAllModals}
        onBackToPrompt={pendingAction ? handleBackToPrompt : undefined}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
}

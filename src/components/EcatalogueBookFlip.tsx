'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { useAuthStore } from '../store/useAuthStore';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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

type FlipBookRef = {
  pageFlip: () => {
    flipNext: (corner?: 'top' | 'bottom') => void;
    flipPrev: (corner?: 'top' | 'bottom') => void;
    getPageCount: () => number;
    getCurrentPageIndex: () => number;
    turnToPage: (pageNum: number) => void;
  };
};

/* ================= HELPERS ================= */
const getProductImageUrl = (product: Product, size: 'thumbnail' | 'card' | 'full' | 'url' = 'url'): string => {
  if (!product.images || product.images.length === 0) {
    return '';
  }
  const image = product.images[0];
  return image[size] || image.url || '';
};

const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice.toLocaleString('en-IN');
};

/* ================= PAGE COMPONENTS ================= */

// Front Cover Page
const FrontCover = React.forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div className="page page-cover front-cover" ref={ref} data-density="hard">
      <div className="cover-inner">
        <div className="cover-decoration">
          <div className="leaf-pattern leaf-tl"></div>
          <div className="leaf-pattern leaf-tr"></div>
          <div className="leaf-pattern leaf-bl"></div>
          <div className="leaf-pattern leaf-br"></div>
        </div>

        <div className="cover-content">
          <div className="cover-emblem">
            <div className="emblem-ring"></div>
            <div className="emblem-ring emblem-ring-2"></div>
          </div>

          <h1 className="cover-title">EcoDarshini</h1>
          <div className="cover-divider">
            <span className="divider-leaf">❧</span>
          </div>
          <h2 className="cover-subtitle">Product Catalogue</h2>

          <p className="cover-tagline">Handcrafted with Love & Nature</p>

          <div className="cover-footer">
            <span className="footer-text">Turn the page to explore</span>
            <span className="footer-arrow">→</span>
          </div>
        </div>

        <div className="cover-spine"></div>
      </div>
    </div>
  );
});
FrontCover.displayName = 'FrontCover';

// Back Cover Page
const BackCover = React.forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div className="page page-cover back-cover" ref={ref} data-density="hard">
      <div className="cover-inner">
        <div className="cover-decoration">
          <div className="leaf-pattern leaf-tl"></div>
          <div className="leaf-pattern leaf-tr"></div>
          <div className="leaf-pattern leaf-bl"></div>
          <div className="leaf-pattern leaf-br"></div>
        </div>

        <div className="cover-content">
          <div className="cover-emblem small"></div>

          <h2 className="end-title">Thank You</h2>
          <p className="end-subtitle">For Supporting Sustainable Artisans</p>

          <div className="end-stats">
            <div className="stat-item">
              <span className="stat-icon">🌿</span>
              <span className="stat-text">Eco-Friendly Materials</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎨</span>
              <span className="stat-text">Supporting Local Artists</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">♻️</span>
              <span className="stat-text">Sustainable Products</span>
            </div>
          </div>

          <div className="cover-footer">
            <span className="footer-arrow flip">←</span>
            <span className="footer-text">Browse again</span>
          </div>
        </div>

        <div className="cover-spine right"></div>
      </div>
    </div>
  );
});
BackCover.displayName = 'BackCover';

// Left Page - Product Image
interface LeftPageProps {
  product: Product;
  pageNumber: number;
}

const LeftPage = React.forwardRef<HTMLDivElement, LeftPageProps>(({ product, pageNumber }, ref) => {
  return (
    // <div className="page product-page left-page" ref={ref}>
    //   <div className="page-inner">
    //     <div className="left-header  flex justify-center">
    //     <h2 className="left-title text-3xl font-bold text-red-400">
    //       {product.name}
    //     </h2>         
    //      <div className="mt-20"></div>
    //     </div>

    //     <div className="left-image-area">
    //       <div className="image-box">
    //         <img
    //           src={getProductImageUrl(product, 'url')}
    //           alt={product.name}
    //           className="product-img"
    //           onError={(e) => {
    //             (e.target as HTMLImageElement).style.display = 'none';
    //           }}
    //         />
    //       </div>
    //     </div>

    //     <div className="artist-info">
    //       <span className="artist-label">Crafted by</span>
    //       <span className="artist-name">{product?.artist_name || 'Artisan'}</span>
    //     </div>

    //     <span className="pg-num left">{pageNumber}</span>
    //   </div>
    // </div>
    <div className="page product-page left-page" ref={ref}>
  <div className="page-inner flex flex-col items-center">

    {/* Title (already correct) */}
    <div className="left-header flex justify-center w-full">
      <h2 className="left-title text-3xl font-bold text-black mt-5">
        {product.name}
      </h2>
    </div>

    {/* Image Area */}
    <div className="left-image-area mt-10 w-full flex justify-center">
      <div className="image-box
       w-[420px] h-[420px]
        border-2 border-green-500
        rounded-xl
        flex items-center justify-center
        overflow-hidden
      ">
        <img
          src={getProductImageUrl(product, 'url')}
          alt={product.name}
          className="max-w-190 max-h-100 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    </div>

    {/* Artist Info */}
    <div className="artist-info mt-5 flex flex-col items-center text-center">
      <span className="artist-label text-xs uppercase tracking-wide text-gray-500">
        Crafted by
      </span>
      <span className="artist-name text-lg font-semibold text-black">
        {product?.artist_name || 'Artisan'}
      </span>
    </div>

    <span className="pg-num left">{pageNumber}</span>
  </div>
</div>

  );
});
LeftPage.displayName = 'LeftPage';


// Right Page - Product Details
interface RightPageProps {
  product: Product;
  pageNumber: number;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

const RightPage = React.forwardRef<HTMLDivElement, RightPageProps>(
  ({ product, pageNumber, onAddToCart, onAddToWishlist }, ref) => {
    return (
      <div className="page product-page right-page" ref={ref}>
      <div className="page-inner flex flex-col items-center justify-center min-h-full text-black">
    
        <div className="details-container w-full max-w-md flex flex-col items-center text-center">
    
          {/* Description */}
          <div className="w-full bg-white rounded-xl shadow-sm p-5 mb-6">
            <p className="text-sm leading-relaxed">
              {product.description ||
                'A beautifully handcrafted eco-friendly product made with sustainable materials.'}
            </p>
          </div>
    
          {/* Category & Status */}
          <div className="flex gap-4 items-center justify-center mb-8">
            <div className="flex items-center gap-2 px-4 py-2 border border-black rounded-full text-sm">
              <span>📦</span>
              <span>{product.category_name || 'Eco Product'}</span>
            </div>
    
            <div className="flex items-center gap-2 px-4 py-2 border border-black rounded-full text-sm">
              <span
                className={`w-2 h-2 rounded-full ${
                  product.is_active ? 'bg-black' : 'bg-gray-400'
                }`}
              />
              <span>{product.is_active ? 'Available' : 'Out of Stock'}</span>
            </div>
          </div>
    
          {/* Price + Stock Group */}
          <div className="w-full flex flex-col items-center mt-2">
    
            {/* Price */}
            <div className="w-full bg-white rounded-xl shadow-md p-6 mb-2">
              <span className="block text-xs uppercase tracking-wide mb-1">
                Price
              </span>
              <div className="flex items-end justify-center gap-1">
                <span className="text-2xl font-semibold">₹</span>
                <span className="text-4xl font-bold">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
    
            {/* Stock */}
            {product.stock > 0 && (
              <div className="text-sm mt-1">
                <span className="font-semibold">{product.stock}</span>{' '}
                <span className="opacity-70">items in stock</span>
              </div>
            )}
          </div>
        </div>
    
        <span className="pg-num right mt-10">{pageNumber}</span>
      </div>
    </div>
    
    

    );
  }
);
RightPage.displayName = 'RightPage';

/* ================= MAIN COMPONENT ================= */
interface EcatalogueBookFlipProps {
  onAuthRequired?: (actionType: 'cart' | 'wishlist', product: Product) => void;
}

export default function EcatalogueBookFlip({ onAuthRequired }: EcatalogueBookFlipProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookDimensions, setBookDimensions] = useState({ width: 550, height: 700 });

  const flipBookRef = useRef<FlipBookRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuthStore();

  /* ========== RESPONSIVE DIMENSIONS ========== */
  useEffect(() => {
    const calculateDimensions = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      let width: number;
      let height: number;

      if (screenWidth < 480) {
        // Mobile
        width = Math.min(screenWidth - 40, 320);
        height = Math.min(screenHeight - 200, width * 1.35);
      } else if (screenWidth < 768) {
        // Tablet portrait
        width = Math.min(screenWidth - 60, 400);
        height = Math.min(screenHeight - 200, width * 1.3);
      } else if (screenWidth < 1024) {
        // Tablet landscape / small desktop
        width = Math.min(screenWidth / 2 - 80, 480);
        height = Math.min(screenHeight - 200, width * 1.28);
      } else if (screenWidth < 1440) {
        // Desktop
        width = Math.min(screenWidth / 2 - 100, 550);
        height = Math.min(screenHeight - 180, width * 1.27);
      } else {
        // Large desktop
        width = Math.min(screenWidth / 2 - 120, 600);
        height = Math.min(screenHeight - 160, width * 1.25);
      }

      setBookDimensions({ width: Math.floor(width), height: Math.floor(height) });
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);

  /* ========== FETCH PRODUCTS ========== */
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
        // Filter only active products
        const activeProducts = productList.filter((p: Product) => p.is_active);
        setProducts(activeProducts);
      } catch (err) {
        console.error('Failed to load products:', err);
        toast.error('Failed to load catalogue');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* ========== NAVIGATION HANDLERS ========== */
  const goNext = useCallback(() => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  }, []);

  const goPrev = useCallback(() => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  }, []);

  /* ========== EVENT HANDLERS ========== */
  const onFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
  }, []);

  const handleInit = useCallback(() => {
    if (flipBookRef.current) {
      setTotalPages(flipBookRef.current.pageFlip().getPageCount());
    }
  }, []);

  /* ========== KEYBOARD NAVIGATION ========== */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goNext, goPrev]);

  /* ========== CART/WISHLIST HANDLERS ========== */
  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      onAuthRequired?.('cart', product);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user?.id,
          product_id: product.id,
          quantity: 1,
        }),
      });

      if (!res.ok) throw new Error('Failed to add to cart');
      toast.success('Added to cart!');
    } catch (err) {
      console.error('Cart error:', err);
      toast.error('Failed to add to cart');
    }
  };

  const handleAddToWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      onAuthRequired?.('wishlist', product);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/wishes/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user?.id,
          product_id: product.id,
        }),
      });

      if (!res.ok) throw new Error('Failed to add to wishlist');
      toast.success('Added to wishlist!');
    } catch (err) {
      console.error('Wishlist error:', err);
      toast.error('Failed to add to wishlist');
    }
  };

  /* ========== LOADING / EMPTY STATES ========== */
  if (loading) {
    return (
      <div className="catalogue-loading">
        <div className="loading-book">
          <div className="loading-cover"></div>
          <div className="loading-pages">
            <div className="loading-page"></div>
            <div className="loading-page"></div>
            <div className="loading-page"></div>
          </div>
        </div>
        <p className="loading-text">Opening catalogue...</p>
        <style jsx>{loadingStyles}</style>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="catalogue-empty">
        <div className="empty-icon">📚</div>
        <p className="empty-text">No products in catalogue</p>
        <style jsx>{loadingStyles}</style>
      </div>
    );
  }

  // Generate pages
  const pages: React.ReactNode[] = [];
  pages.push(<FrontCover key="front-cover" />);
  products.forEach((product, index) => {
    pages.push(
      <LeftPage key={`left-${product?.id}`} product={product} pageNumber={index * 2 + 1} />
    );
    pages.push(
      <RightPage
        key={`right-${product.id}`}
        product={product}
        pageNumber={index * 2 + 2}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleAddToWishlist}
      />
    );
  });
  pages.push(<BackCover key="back-cover" />);

  const currentProductIndex = Math.max(0, Math.floor((currentPage - 1) / 2));

  /* ================= RENDER ================= */
  return (
    <>
      <div className="ecatalogue-wrapper" ref={containerRef}>
        {/* Header */}
        <div className="ecatalogue-header">
          <div className="header-left">
            <span className="header-icon">📖</span>
            <span className="header-title">Product Catalogue</span>
          </div>
          <div className="header-center">
            {currentPage > 0 && currentPage < totalPages - 1 && (
              <span className="current-product">
                {products[currentProductIndex]?.name || 'Browsing...'}
              </span>
            )}
          </div>
          <div className="header-right">
            <span className="page-info">
              {currentPage + 1} / {totalPages}
            </span>
          </div>
        </div>

        {/* Book Container */}
        <div className="book-container">
          {/* Prev Button */}
          <button
            className={`nav-btn nav-prev ${currentPage === 0 ? 'disabled' : ''}`}
            onClick={goPrev}
            disabled={currentPage === 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="nav-icon" />
          </button>

          {/* The Book */}
          <div className="book-wrapper">
            <div className="book-shadow"></div>
            {/* @ts-expect-error - react-pageflip types are incomplete */}
            <HTMLFlipBook
              width={bookDimensions.width}
              height={bookDimensions.height}
              size="fixed"
              minWidth={bookDimensions.width}
              maxWidth={bookDimensions.width}
              minHeight={bookDimensions.height}
              maxHeight={bookDimensions.height}
              maxShadowOpacity={0.5}
              showCover={true}
              mobileScrollSupport={true}
              onFlip={onFlip}
              onInit={handleInit}
              className="catalogue-book"
              ref={flipBookRef}
              drawShadow={true}
              flippingTime={800}
              usePortrait={false}
              startZIndex={0}
              autoSize={false}
              clickEventForward={true}
              useMouseEvents={true}
              swipeDistance={30}
              showPageCorners={false}
              disableFlipByClick={false}
            >
              {pages}
            </HTMLFlipBook>
          </div>

          {/* Next Button */}
          <button
            className={`nav-btn nav-next ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}
            onClick={goNext}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next page"
          >
            <ChevronRight className="nav-icon" />
          </button>
        </div>

        {/* Footer Hint */}
        <div className="ecatalogue-footer">
          <span className="hint-text">
            💡 Drag corners or use ← → keys to flip pages
          </span>
        </div>
      </div>

      {/* ================= STYLES ================= */}
      <style jsx global>{`
        /* ========== BOOK CONTAINER FIX ========== */
        .catalogue-book {
          overflow: hidden !important;
        }

        .stf__wrapper {
          overflow: hidden !important;
        }

        .stf__parent {
          overflow: hidden !important;
        }

        /* ========== PAGE BASE ========== */
        .page {
          background-color: #fffef5 !important;
          overflow: hidden !important;
          box-sizing: border-box;
        }

        .page-inner {
          width: 100%;
          height: 100%;
          background: #fffef5;
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 5%;
        }

        /* ========== COVER PAGES ========== */
        .page-cover {
          background: linear-gradient(145deg, #065f46 0%, #047857 40%, #059669 70%, #10b981 100%) !important;
        }

        .page-cover.back-cover {
          background: linear-gradient(145deg, #10b981 0%, #059669 30%, #047857 60%, #065f46 100%) !important;
        }

        .cover-inner {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: inherit;
        }

        .cover-spine {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 12px;
          background: linear-gradient(to right,
            rgba(0,0,0,0.4),
            rgba(0,0,0,0.1) 40%,
            rgba(255,255,255,0.05) 60%,
            rgba(0,0,0,0.3)
          );
        }

        .cover-spine.right {
          right: auto;
          left: 0;
          background: linear-gradient(to left,
            rgba(0,0,0,0.4),
            rgba(0,0,0,0.1) 40%,
            rgba(255,255,255,0.05) 60%,
            rgba(0,0,0,0.3)
          );
        }

        .cover-decoration {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .leaf-pattern {
          position: absolute;
          width: 60px;
          height: 60px;
          opacity: 0.12;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%23fff' d='M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5'/%3E%3C/svg%3E") no-repeat center;
          background-size: contain;
        }

        .leaf-tl { top: 20px; left: 20px; transform: rotate(-45deg); }
        .leaf-tr { top: 20px; right: 30px; transform: rotate(45deg); }
        .leaf-bl { bottom: 20px; left: 20px; transform: rotate(-135deg); }
        .leaf-br { bottom: 20px; right: 30px; transform: rotate(135deg); }

        .cover-content {
          text-align: center;
          color: white;
          padding: 20px;
          z-index: 1;
        }

        .cover-emblem {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cover-emblem.small {
          width: 50px;
          height: 50px;
          margin-bottom: 10px;
        }

        .emblem-ring {
          position: absolute;
          inset: 0;
          border: 2px solid rgba(255,255,255,0.35);
          border-radius: 50%;
        }

        .emblem-ring-2 {
          inset: 8px;
          border-style: dashed;
        }

        .cover-title {
          font-size: clamp(1.5rem, 5vw, 2.5rem);
          font-weight: 700;
          margin-bottom: 10px;
          text-shadow: 0 2px 12px rgba(0,0,0,0.3);
          letter-spacing: 1px;
        }

        .cover-divider {
          margin: 10px 0;
        }

        .divider-leaf {
          font-size: 1.5rem;
          opacity: 0.7;
        }

        .cover-subtitle {
          font-size: clamp(0.9rem, 3vw, 1.2rem);
          font-weight: 400;
          opacity: 0.95;
          margin-bottom: 15px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .cover-tagline {
          font-size: clamp(0.75rem, 2.5vw, 0.95rem);
          font-style: italic;
          opacity: 0.8;
          margin-bottom: 25px;
        }

        .cover-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: clamp(0.7rem, 2vw, 0.9rem);
          opacity: 0.85;
        }

        .footer-arrow {
          font-size: 1.2rem;
          animation: bounceRight 1.5s ease-in-out infinite;
        }

        .footer-arrow.flip {
          animation: bounceLeft 1.5s ease-in-out infinite;
        }

        @keyframes bounceRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }

        @keyframes bounceLeft {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-6px); }
        }

        /* Back Cover */
        .end-title {
          font-size: clamp(1.3rem, 4vw, 2rem);
          font-weight: 700;
          margin-bottom: 8px;
        }

        .end-subtitle {
          font-size: clamp(0.75rem, 2.5vw, 1rem);
          opacity: 0.9;
          margin-bottom: 20px;
        }

        .end-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(255,255,255,0.15);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: clamp(0.7rem, 2vw, 0.85rem);
        }

        /* ========== LEFT PAGE - IMAGE ========== */
        .left-page .page-inner {
          align-items: center;
          justify-content: space-between;
        }

        .left-header {
          text-align: center;
          width: 100%;
        }

        .left-title {
          font-size: clamp(1rem, 3.5vw, 1.5rem);
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .title-line {
          width: 40px;
          height: 3px;
          background: linear-gradient(90deg, #10b981, #059669);
          margin: 0 auto;
          border-radius: 2px;
        }

        .left-image-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 10px 0;
        }

        .image-box {
          width: 90%;
          max-width: 350px;
          aspect-ratio: 1;
          background: white;
          border-radius: 12px;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 4px 20px rgba(0,0,0,0.08),
            0 1px 4px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.04);
        }

        .product-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 8px;
        }

        .artist-info {
          text-align: center;
          padding: 8px 0;
        }

        .artist-label {
          display: block;
          font-size: clamp(0.65rem, 2vw, 0.75rem);
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .artist-name {
          display: block;
          font-size: clamp(0.9rem, 3vw, 1.2rem);
          font-weight: 600;
          color: #065f46;
        }

        /* ========== RIGHT PAGE - DETAILS ========== */
        .right-page .page-inner {
          justify-content: center;
        }

        .details-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(8px, 2vw, 14px);
          justify-content: center;
        }

        .detail-card {
          width: 100%;
          background: white;
          border-radius: 10px;
          padding: clamp(8px, 2vw, 14px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.04);
        }

        .desc-card {
          text-align: center;
        }

        .desc-text {
          font-size: clamp(0.7rem, 2vw, 0.9rem);
          color: #4b5563;
          line-height: 1.5;
          margin: 0;
        }

        .info-row {
          display: flex;
          gap: 8px;
          width: 100%;
          justify-content: center;
          flex-wrap: wrap;
        }

        .category-tag,
        .status-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 16px;
          font-size: clamp(0.65rem, 2vw, 0.8rem);
          font-weight: 500;
        }

        .category-tag {
          background: #fef3c7;
          color: #92400e;
        }

        .status-tag {
          background: #fef2f2;
          color: #b91c1c;
        }

        .status-tag.available {
          background: #f0fdf4;
          color: #166534;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .price-card {
          width: 100%;
          background: linear-gradient(135deg, #065f46 0%, #059669 100%);
          border-radius: 10px;
          padding: clamp(10px, 2.5vw, 16px);
          text-align: center;
        }

        .price-label {
          font-size: clamp(0.55rem, 1.5vw, 0.7rem);
          color: rgba(255,255,255,0.8);
          text-transform: uppercase;
          letter-spacing: 1px;
          display: block;
          margin-bottom: 4px;
        }

        .price-amount {
          color: white;
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 4px;
        }

        .rupee {
          font-size: clamp(1rem, 3vw, 1.3rem);
          font-weight: 500;
        }

        .amount {
          font-size: clamp(1.5rem, 5vw, 2.4rem);
          font-weight: 700;
          color:rgb(0, 0, 0);
        }

        .stock-info {
          display: flex;
          align-items: baseline;
          gap: 4px;
          background: #f3f4f6;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: clamp(0.65rem, 2vw, 0.85rem);
        }

        .stock-num {
          font-weight: 700;
          color:rgb(0, 0, 0);
        }

        .stock-label {
          color:rgb(0, 0, 0);
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          width: 100%;
          flex-wrap: wrap;
          justify-content: center;
        }

        .action-btn {
          flex: 1;
          min-width: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px);
          border: none;
          border-radius: 8px;
          font-size: clamp(0.65rem, 2vw, 0.85rem);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-btn .btn-icon {
          width: clamp(14px, 3vw, 18px);
          height: clamp(14px, 3vw, 18px);
        }

        .cart-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }

        .cart-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
        }

        .wishlist-btn {
          background: white;
          color: #ef4444;
          border: 1px solid #fecaca;
        }

        .wishlist-btn:hover {
          background: #fef2f2;
        }

        /* Page Numbers */
        .pg-num {
          position: absolute;
          bottom: 10px;
          font-size: clamp(0.6rem, 1.5vw, 0.8rem);
          color: #9ca3af;
          font-weight: 500;
        }

        .pg-num.left { left: 15px; }
        .pg-num.right { right: 15px; }
      `}</style>

      <style jsx>{`
        .ecatalogue-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 16px;
          background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .ecatalogue-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-icon {
          font-size: 1.3rem;
        }

        .header-title {
          font-size: clamp(0.9rem, 2.5vw, 1.1rem);
          font-weight: 600;
          color: #1f2937;
        }

        .header-center {
          flex: 1;
          text-align: center;
          min-width: 150px;
        }

        .current-product {
          font-size: clamp(0.75rem, 2vw, 0.9rem);
          color: #6b7280;
          font-weight: 500;
        }

        .header-right {
          text-align: right;
        }

        .page-info {
          font-size: clamp(0.75rem, 2vw, 0.9rem);
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #10b981, #059669);
          padding: 6px 14px;
          border-radius: 16px;
        }

        .book-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(10px, 3vw, 30px);
          padding: 10px;
        }

        .book-wrapper {
          position: relative;
          overflow: hidden;
          border-radius: 4px;
        }

        .book-shadow {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          height: 40px;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%);
          filter: blur(10px);
        }

        .nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: clamp(40px, 8vw, 60px);
          height: clamp(40px, 8vw, 60px);
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          flex-shrink: 0;
        }

        .nav-btn .nav-icon {
          width: clamp(20px, 5vw, 28px);
          height: clamp(20px, 5vw, 28px);
        }

        .nav-btn:hover:not(.disabled) {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .nav-btn:active:not(.disabled) {
          transform: scale(0.95);
        }

        .nav-btn.disabled {
          background: #d1d5db;
          cursor: not-allowed;
          box-shadow: none;
        }

        .ecatalogue-footer {
          text-align: center;
          padding: 12px;
        }

        .hint-text {
          font-size: clamp(0.75rem, 2vw, 0.9rem);
          color: #6b7280;
          background: white;
          padding: 8px 18px;
          border-radius: 20px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        }

        @media (max-width: 640px) {
          .ecatalogue-header {
            flex-direction: column;
            text-align: center;
          }

          .header-left,
          .header-center,
          .header-right {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}

/* ================= LOADING STYLES ================= */
const loadingStyles = `
  .catalogue-loading,
  .catalogue-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
    gap: 20px;
  }

  .loading-book {
    position: relative;
    width: 100px;
    height: 130px;
  }

  .loading-cover {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #065f46, #10b981);
    border-radius: 0 6px 6px 0;
    transform-origin: left;
    animation: openBook 2s ease-in-out infinite;
  }

  .loading-pages {
    position: absolute;
    right: 4px;
    top: 4px;
    bottom: 4px;
    left: 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .loading-page {
    flex: 1;
    background: #f0fdf4;
    border-radius: 0 3px 3px 0;
  }

  @keyframes openBook {
    0%, 100% { transform: rotateY(0deg); }
    50% { transform: rotateY(-25deg); }
  }

  .loading-text {
    font-size: 1rem;
    color: #065f46;
    font-weight: 500;
  }

  .empty-icon {
    font-size: 4rem;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 1.1rem;
    color: #6b7280;
  }
`;

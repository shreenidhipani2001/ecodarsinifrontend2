'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import ProductDetailModal from '../../components/ProductDetailModal';
import { useAuthStore } from '../../store/useAuthStore';

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
            {/* <span className="emblem-icon">🌿</span> */}
          </div>

          {/* <h1 className="cover-title">Eco Darsini</h1> */}
          <div className="cover-divider">
            {/* <span className="divider-leaf">❧</span> */}
          </div>
          {/* <h2 className="cover-subtitle">Product Catalogue</h2> */}
          {/* <h2 className="cover-subtitle">Product Catalogue</h2> */}

          {/* <p className="cover-tagline">Handcrafted with Love & Nature</p>

          <div className="cover-footer">
            <span className="footer-text">Turn the page to explore</span>
            <span className="footer-arrow">→</span>
          </div> */}
            <div className="cover-footer">
            <span className="footer-text text-4xl font-bold">Welcome</span>
            <span className="footer-arrow"></span>
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
          <div className="cover-emblem small">
            {/* <span className="emblem-icon">🌍</span> */}
          </div>

          {/* <h2 className="end-title">Thank You</h2> */}
          
          {/* <p className="end-subtitle">For Supporting Sustainable Artisans</p> */}
{/* 
          <div className="end-stats">
            <div className="stat-item">
              <span className="stat-icon">•</span>
              
              <span className="stat-text">Handmade Products</span>
            </div>
            <div className="stat-item">
              
              <span className="stat-icon">•</span>

              <span className="stat-text">Eco-Friendly Materials</span>
            </div>
            <div className="stat-item">
              
              <span className="stat-icon">•</span>

              <span className="stat-text">Supporting Local Artists</span>
            </div>
          </div> */}

          <div className="cover-footer m-auto text-4xl font-bold">
             
            <span className="footer-text">Thank You</span>
          </div>
        </div>

        <div className="cover-spine right"></div>
      </div>
    </div>
  );
});

BackCover.displayName = 'BackCover';

// Left Page - Product Image & Name
interface LeftPageProps {
  product: Product;
  pageNumber: number;
}

const LeftPage = React.forwardRef<HTMLDivElement, LeftPageProps>(({ product, pageNumber }, ref) => {
  return (
    <div className="page product-page left-page border border-gray-300 border-r-amber-500 border-r-7" ref={ref}>
    {/* <div className="page product-page left-page" ref={ref}> */}
      <div className="page-inner">
        {/* Product Name - Top Center */}
        <div className="left-header">
         
        </div>

     
        <div>

          <div className="left-image-area mt-10 p-2  w-fit  border border-green-500 rounded-2xl shadow-lg   mt-20 ml-19">
            <div className="flex justify-center bg-white rounded-xl">
              <img
                src={getProductImageUrl(product, 'url')}
                alt={product.name}
                className="product-img w-80 h-80  object-cover rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            
            
          </div>
          <div className="detail-info flex flex-col items-center justify-center text-center">
            <span className="block text-xs uppercase tracking-wide opacity-80 text-black mt-10">
              Crafted by
            </span>
            <span className="block font-semibold text-4xl text-black">
              {product?.artist_name || 'Artisan'}
            </span>
          </div>

        </div>








       
      </div>
    </div>
  );
});
LeftPage.displayName = 'LeftPage';

// Right Page - Product Details
interface RightPageProps {
  product: Product;
  pageNumber: number;
  onViewMore?: (product: Product) => void;
}

const RightPage = React.forwardRef<HTMLDivElement, RightPageProps>(({ product, pageNumber, onViewMore }, ref) => {
  return (
    // <div className="page product-page right-page" ref={ref}>
    //   <div className="page-inner">
    //     <div className="details-container">
          
    //       <div className="detail-card artist-card">
    //         <span className="detail-emoji">🎨</span>
    //         <div className="detail-info">
    //           <span className="detail-label">Crafted by</span>
    //           <span className="detail-value">{product.artist_name || 'Artisan'}</span>
    //         </div>
    //       </div>

        
    //       <div className="detail-card desc-card">
    //         <p className="desc-text">
    //           {product.description || 'A beautifully handcrafted eco-friendly product.'}
    //         </p>
    //       </div>

           
    //       <div className="price-card">
    //         <span className="price-label">Price</span>
    //         <div className="price-amount">
    //           <span className="rupee">₹</span>
    //           <span className="amount">{formatPrice(product.price)}</span>
    //         </div>
    //       </div>

           
    //       <div className="info-row">
    //         <div className="category-tag">
    //           <span>📦</span>
    //           <span>{product.category_name || 'Eco Product'}</span>
    //         </div>
    //         <div className={`status-tag ${product.is_active ? 'available' : 'unavailable'}`}>
    //           <span className="status-dot"></span>
    //           <span>{product.is_active ? 'Available' : 'Out of Stock'}</span>
    //         </div>
    //       </div>

          
    //       {product.stock > 0 && (
    //         <div className="stock-info">
    //           <span className="stock-num">{product.stock}</span>
    //           <span className="stock-label">items in stock</span>
    //         </div>
    //       )}

          
    //       {onViewMore && (
    //         <button className="view-btn" onClick={() => onViewMore(product)}>
    //           View Full Details
    //         </button>
    //       )}
    //     </div>

        
    //     <span className="pg-num right">{pageNumber}</span>
    //   </div>
    // </div>

    <div
  className="page product-page right-page flex justify-center items-center"
  ref={ref}
>
  {/* <div className="page-inner relative w-full max-w-[420px] rounded-2xl bg-gradient-to-br from-green-800 via-green-700 to-green-600 p-8 shadow-2xl text-white">
    <div className="details-container flex flex-col gap-5 text-center">
    <div className="left-header">
        <h2 className="mt-10 text-center text-black font-bold text-3xl md:text-4xl">
            {product.name}
          </h2>
          <div className="title-line"></div>
        </div>
     
          
          <div className="info-row flex gap-3 mt-30">
         
        
      </div>

      
      <div className="price-card rounded-2xl bg-green-700 px-3 py-2  mt-25">
        <span className="block text-xs uppercase tracking-wide opacity-80">
          Price
        </span>
        <div className="mt-1 flex justify-center items-end gap-1 font-extrabold">
          <span className="text-xl">₹</span>
          <span className="text-4xl">{formatPrice(product.price)}</span>
        </div>
      </div>

  

     
      {product.stock > 0 && (
        <div className="text-sm opacity-90 text-black">
          <span className="font-semibold">{product.stock}</span>{' '}
          items in stock
        </div>
      )}

      
      {onViewMore && (
        <button
          onClick={() => onViewMore(product)}
          className="mt-2 rounded-xl bg-white py-3 font-bold text-green-800 transition hover:bg-green-100 hover:-translate-y-0.5"
        >
          View Full Details
        </button>
      )}
    </div>

    
    
  </div> */}

<div className="page-inner relative w-full max-w-[420px] rounded-2xl bg-gradient-to-br from-green-800 via-green-700 to-green-600 p-8 shadow-2xl text-white">
  <div className="details-container flex flex-col justify-center items-center gap-6 text-center h-full">
    
    {/* Product Name */}
    <h2 className="text-black font-bold text-3xl md:text-4xl">
      {product.name}
    </h2>
    <div className="title-line" />

<div className="flex flex-col items-center gap-10 mt-40">
  
  {/* Price */}
  <div className="price-card rounded-xl bg-green-700 px-10 py-2">
    <span className="block text-[10px] uppercase tracking-widest opacity-80">
      Price
    </span>
    <div className="mt-1 flex justify-center items-end gap-1 font-bold">
      <span className="text-lg">₹</span>
      <span className="text-2xl">{formatPrice(product.price)}</span>
    </div>
  </div>

  {/* Button */}
  {onViewMore && (
    <button
      onClick={() => onViewMore(product)}
      className="w-full rounded-xl bg-white py-3 font-bold text-green-800 transition hover:bg-green-100 hover:-translate-y-0.5"
    >
      View Full Details
    </button>
  )}
</div>

  </div>
</div>

</div>

  );
});
RightPage.displayName = 'RightPage';

/* ================= MAIN COMPONENT ================= */
export default function BookFlip() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const flipBookRef = useRef<FlipBookRef>(null);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const currentProductIndex = Math.max(0, Math.floor((currentPage - 1) / 2));

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
        setProducts(productList);
      } catch (err) {
        console.error('Failed to load products:', err);
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
        onViewMore={setSelectedProduct}
      />
    );
  });
  pages.push(<BackCover key="back-cover" />);

  /* ================= RENDER ================= */
  return (
    <>
      <div className="catalogue-wrapper">
     
        <div className="catalogue-header"></div>

        {/* Book Container */}
        <div className="book-container">
          {/* Prev Button */}
          <button
            className={`nav-btn nav-prev ${currentPage === 0 ? 'disabled' : ''}`}
            onClick={goPrev}
            disabled={currentPage === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {/* <span className="nav-label">Prev</span> */}
          </button>

          {/* The Book */}
          <div className="book-wrapper">
            <div className="book-base"></div>
            {/* @ts-expect-error - react-pageflip types are incomplete */}
            <HTMLFlipBook
              width={480}
              height={620}
              size="fixed"
              minWidth={480}
              maxWidth={480}
              minHeight={620}
              maxHeight={620}
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
          >
            {/* <span className="nav-label">Next</span> */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <div className="catalogue-footer">
          <span className="hint-text">💡 Drag page corners or use arrow keys to flip</span>
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
          isAdmin={isAdmin}
          onClose={() => setSelectedProduct(null)}
          onProductUpdate={(updatedProduct) => {
            setProducts((prev) =>
              prev.map((p) => (p.id === updatedProduct.id
                ? { ...updatedProduct, images: updatedProduct.images || p.images, price: updatedProduct.price }
                : p))
            );
            // Preserve the existing images from selectedProduct if not returned by API
            setSelectedProduct({
              ...updatedProduct,
              images: updatedProduct.images || selectedProduct.images,
              price: updatedProduct.price
            });
          }}
        />
      )}

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
          width: 70px;
          height: 70px;
          opacity: 0.12;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%23fff' d='M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5'/%3E%3C/svg%3E") no-repeat center;
          background-size: contain;
        }

        .leaf-tl { top: 25px; left: 25px; transform: rotate(-45deg); }
        .leaf-tr { top: 25px; right: 35px; transform: rotate(45deg); }
        .leaf-bl { bottom: 25px; left: 25px; transform: rotate(-135deg); }
        .leaf-br { bottom: 25px; right: 35px; transform: rotate(135deg); }

        .cover-content {
          text-align: center;
          color: white;
          padding: 30px;
          z-index: 1;
        }

        .cover-emblem {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto 25px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cover-emblem.small {
          width: 70px;
          height: 70px;
          margin-bottom: 15px;
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

        .emblem-icon {
          font-size: 3rem;
        }

        .cover-emblem.small .emblem-icon {
          font-size: 2rem;
        }

        .cover-title {
          font-size: 2.4rem;
          font-weight: 700;
          margin-bottom: 12px;
          text-shadow: 0 2px 12px rgba(0,0,0,0.3);
          letter-spacing: 1px;
        }

        .cover-divider {
          margin: 12px 0;
        }

        .divider-leaf {
          font-size: 1.8rem;
          opacity: 0.7;
        }

        .cover-subtitle {
          font-size: 1.2rem;
          font-weight: 400;
          opacity: 0.95;
          margin-bottom: 20px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .cover-tagline {
          font-size: 0.95rem;
          font-style: italic;
          opacity: 0.8;
          margin-bottom: 35px;
        }

        .cover-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 0.9rem;
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
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .end-subtitle {
          font-size: 1rem;
          opacity: 0.9;
          margin-bottom: 30px;
        }

        .end-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 35px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: rgba(255,255,255,0.15);
          padding: 10px 20px;
          border-radius: 25px;
        }

        .stat-icon {
          font-size: 1.1rem;
        }

        .stat-text {
          font-size: 0.9rem;
          font-weight: 500;
        }

        /* ========== LEFT PAGE - IMAGE ========== */
        .left-page .page-inner {
          padding: 30px 25px;
          align-items: center;
        }

        .left-header {
          text-align: center;
          margin-bottom: 20px;
          width: 100%;
        }

        .left-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 12px 0;
          line-height: 1.3;
        }

        .title-line {
          width: 50px;
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
        }

        .image-box {
          width: 320px;
          height: 380px;
          background: white;
          border-radius: 12px;
          padding: 15px;
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

        /* ========== RIGHT PAGE - DETAILS ========== */
        .right-page .page-inner {
          padding: 25px 30px;
        }

        .details-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .detail-card {
          width: 100%;
          background: white;
          border-radius: 12px;
          padding: 14px 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.04);
        }

        .artist-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-left: 4px solid #10b981;
        }

        .detail-emoji {
          font-size: 1.8rem;
        }

        .detail-info {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 1.15rem;
          font-weight: 600;
          color: #065f46;
        }

        .desc-card {
          text-align: center;
        }

        .desc-text {
          font-size: 0.95rem;
          color: #4b5563;
          line-height: 1.6;
          margin: 0;
        }

        .price-card {
          width: 100%;
          background: linear-gradient(135deg, #065f46 0%, #059669 100%);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }

        .price-label {
          font-size: 0.7rem;
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
          font-size: 1.3rem;
          font-weight: 500;
        }

        .amount {
          font-size: 2.4rem;
          font-weight: 700;
        }

        .info-row {
          display: flex;
          gap: 10px;
          width: 100%;
          justify-content: center;
          flex-wrap: wrap;
        }

        .category-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #fef3c7;
          color: #92400e;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #fef2f2;
          color: #b91c1c;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-tag.available {
          background: #f0fdf4;
          color: #166534;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
        }

        .stock-info {
          display: flex;
          align-items: baseline;
          gap: 6px;
          background: #f3f4f6;
          padding: 8px 16px;
          border-radius: 20px;
        }

        .stock-num {
          font-size: 1.1rem;
          font-weight: 700;
          color: #374151;
        }

        .stock-label {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .view-btn {
          margin-top: auto;
          padding: 12px 24px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }

        .view-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
        }

        /* Page Numbers */
        .pg-num {
          position: absolute;
          bottom: 15px;
          font-size: 0.8rem;
          color: #9ca3af;
          font-weight: 500;
        }

        .pg-num.left {
          left: 20px;
        }

        .pg-num.right {
          right: 20px;
        }
      `}</style>

      <style jsx>{`
        .catalogue-wrapper {
          min-height: calc(100vh - 80px);
          display: flex;
          flex-direction: column;
          padding: 15px 20px;
          background: linear-gradient(180deg,rgb(255, 255, 255) 0%, #e2e8f0 100%);
        }

        .catalogue-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 25px;
          background: rgb(255, 255, 255);
          border-radius: 14px;
          
          margin-bottom: 20px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 10px;
          
        }

        .header-icon {
          font-size: 1.4rem;
        }

        .header-title {
          font-size: 1.1rem;
          font-weight: 600;
          color:rgb(239, 242, 246);
        }

        .header-center {
          text-align: center;
        }

        .page-info {
          font-size: 1rem;
          font-weight: 600;
          color: rgb(255, 255, 255);
          background: rgb(32, 125, 46);
          padding: 6px 18px;
          border-radius: 18px;
        }

        .header-right {
          text-align: right;
        }

        .total-products {
          font-size: 0.9rem;
          font-weight: 600;
          color:rgb(255, 255, 255);
          background:rgb(32, 125, 46);
          padding: 6px 14px;
          border-radius: 12px;
        }

        .book-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 25px;
          padding: 10px;
        }

        .book-wrapper {
          position: relative;
          overflow: hidden;
          border-radius: 4px;
        }

        .book-base {
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 95%;
          height: 30px;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%);
          filter: blur(8px);
        }

        .nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 16px 22px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .nav-btn svg {
          width: 26px;
          height: 26px;
        }

        .nav-label {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .nav-btn:hover:not(.disabled) {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .nav-btn:active:not(.disabled) {
          transform: scale(0.98);
        }

        .nav-btn.disabled {
          background: #d1d5db;
          cursor: not-allowed;
          box-shadow: none;
        }

        .catalogue-footer {
          text-align: center;
          padding: 15px;
        }

        .hint-text {
          font-size: 0.9rem;
          color: #6b7280;
          background: white;
          padding: 10px 22px;
          border-radius: 22px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        }

        @media (max-width: 1024px) {
          .book-container {
            gap: 15px;
          }

          .nav-btn {
            padding: 12px 18px;
          }
        }

        @media (max-width: 768px) {
          .catalogue-header {
            flex-direction: column;
            gap: 12px;
            padding: 12px 18px;
          }

          .nav-btn {
            padding: 10px 14px;
          }

          .nav-btn svg {
            width: 22px;
            height: 22px;
          }

          .nav-label {
            font-size: 0.7rem;
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
    min-height: calc(100vh - 100px);
    background: linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%);
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
    font-size: 3.5rem;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 1.1rem;
    color: #6b7280;
  }
`;

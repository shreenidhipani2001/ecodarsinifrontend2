'use client';

import { useEffect, useState } from 'react';
import ProductCard from '../user/ProductCard';
import ProductModal from '../user/ProductModal';
import Image from '../../../public/bdjhbawdhja.jpeg';
import yyy from '../../../public/bdjhbawdhja.jpeg';

import type { StaticImageData } from 'next/image';

/* ================= TYPES ================= */
type Product = {
  id: string;
  name: string;
  price: number;
  cms_image_ids: string[];
  discount?: number;
  slug?: string;
  image?: string | StaticImageData;
};

/* ================= HELPERS ================= */
const getCloudinaryUrl = (
  publicId: string,
  options = "w_600,h_600,c_fill,q_auto,f_auto"
) => {
  if (!publicId) return '';

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;
  if (!cloudName) {
    console.warn("Cloudinary cloud name not set");
    return '';
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/${options}/${publicId}.webp`;
};

export default function DashboardGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error("API URL not configured");

        const res = await fetch(`${apiUrl}/api/products`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} – ${res.statusText}`);
        }

        const data = await res.json();
        console.log("Fetched products data:", data);
        const productList = Array.isArray(data)
          ? data
          : data?.products || data?.data || [];

        /* API → UI TRANSFORMATION */
        const mappedProducts: Product[] = productList.map((p: any) => {
          const imageId =
            Array.isArray(p.cms_image_ids) && p.cms_image_ids.length > 0
              ? p.cms_image_ids[0]
              : null;

          return {
            id: p.id,
            name: p.name,
            price: Number(p.price),
            slug: p.slug,
            cms_image_ids: p.cms_image_ids || [],
            discount: p.discount ?? 0,
            image: imageId ? Image : undefined,
          };
        });

        setProducts(mappedProducts);
      } catch (err: any) {
        console.error("Failed to load products:", err);
        setError(err.message || "Could not load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] text-gray-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mb-4 mx-auto"></div>
          <p className="text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] text-red-600">
        {error}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] text-gray-600">
        No products available
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => setSelectedProduct(product)}
          />
        ))}
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={{
            ...selectedProduct,
            image: yyy,
          }}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}

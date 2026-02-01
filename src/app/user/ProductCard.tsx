import Image from 'next/image';
import { Heart } from 'lucide-react';
import type { StaticImageData } from 'next/image';

type Product = {
  id: string;
  name: string;
  price: number;
  discount?: number;
  image?: string | StaticImageData;
};

interface Props {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: Props) {
  const finalPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="relative aspect-square">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-gray-800 line-clamp-2">{product.name}</h3>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-lg font-bold">₹{finalPrice}</span>
          {product.discount && (
            <>
              <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
              <span className="text-sm text-green-600">{product.discount}% off</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
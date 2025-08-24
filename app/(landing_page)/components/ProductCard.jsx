import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from './ui/AddToCartButton';
import ViewProductButton from './ui/ViewProductButton';

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-[350px] sm:h-[400px] md:h-[450px]">
      {/* Product Image - Responsive height based on device size */}
      <Link 
        href={`/product/${product.id}`} 
        className="block relative h-[180px] sm:h-[220px] md:h-[250px] w-full"
        aria-label={`View ${product.title}`}
      >
        <div className="w-full h-full relative overflow-hidden">
          <Image 
            src={product.image_url} 
            alt={product.title} 
            fill
            className="object-contain transition-transform duration-300 hover:scale-105" 
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
          />
        </div>
      </Link>

      {/* Product Details - Flexible padding and spacing */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <Link 
          href={`/product/${product.id}`} 
          className="block mb-auto"
        >
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-center mb-1 sm:mb-2 line-clamp-2 hover:text-primary-600 transition-colors duration-200">
            {product.title}
          </h3>
        </Link>

        {/* Price information - Could be added here if needed */}
        {product.price && (
          <div className="flex justify-center items-center mb-2 sm:mb-3">
            {product.sale_price && product.sale_price < product.price ? (
              <>
                <span className="text-primary-600 font-bold text-sm sm:text-base md:text-lg ml-2">
                  {product.sale_price} دينار
                </span>
                <span className="text-gray-500 line-through text-xs sm:text-sm">
                  {product.price} دينار
                </span>
              </>
            ) : (
              <span className="text-primary-600 font-bold text-sm sm:text-base md:text-lg">
                {product.price} دينار كويتي
              </span>
            )}
          </div>
        )}

        {/* Action Buttons - Responsive grid layout */}
        <div className="grid grid-cols-1 gap-2 mt-2 sm:mt-3">
          <AddToCartButton product={product} />
          {/* <ViewProductButton productId={product.id} /> */}
        </div>
      </div>
    </div>
  );
}
import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from './ui/AddToCartButton';
export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-[350px] sm:h-[400px] md:h-[450px]">
      {/* Product Image - Responsive height based on device size */}
      <div className="relative h-[180px] sm:h-[220px] md:h-[250px] w-full">
        <Image
          src={product.image_url}
          alt={product.title}
          fill
          className="object-contain transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,..."
        />
      </div>

      {/* Product Details - Flexible padding and spacing */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <Link href={`/product/${product.id}`} className="block mb-auto">
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

        {/* Stock Status */}
        <div className="flex justify-center items-center mb-2">
          <div
            className={`w-2 h-2 rounded-full ml-1 ${
              product.in_stock ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span
            className={`text-xs sm:text-sm font-medium ${
              product.in_stock ? "text-green-600" : "text-red-600"
            }`}
          >
            {product.in_stock ? "متوفر" : "غير متوفر"}
          </span>
        </div>

        {/* Action Buttons - Responsive grid layout */}
        <div className="grid grid-cols-1 gap-2 mt-2 sm:mt-3">
          <AddToCartButton product={product} />
          {/* <ViewProductButton productId={product.id} /> */}
        </div>
      </div>
    </div>
  );
}
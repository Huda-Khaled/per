"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ShoppingCart, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "../../../lib/store";

export default function ProductClient({ product }) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert("✅ تم إضافة المنتج للسلة");
  };

  const goToCart = () => {
    router.push("/cart");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* صورة المنتج */}
        <div className="w-full md:w-1/2">
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="h-[250px] sm:h-[350px] md:h-[400px] relative">
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* بيانات المنتج */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            {product.title}
          </h1>

          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-4">
              {product.sale_price ? (
                <>
                  <span className="text-xl sm:text-2xl font-bold text-primary-600">
                    {product.sale_price} دينار
                  </span>
                  <span className="text-base sm:text-lg text-gray-500 line-through">
                    {product.price} دينار
                  </span>
                </>
              ) : (
                <span className="text-xl sm:text-2xl font-bold text-primary-600">
                  {product.price} دينار
                </span>
              )}
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-gray-700">
              {product.description}
            </p>
          </div>

          {/* التحكم في الكمية */}
          <div className="mb-4 sm:mb-6">
            <label
              htmlFor="quantity"
              className="block text-sm sm:text-base text-gray-700 mb-2"
            >
              الكمية:
            </label>
            <div className="flex items-center max-w-[180px]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="bg-gray-200 px-3 py-2 rounded-l hover:bg-gray-300 transition-colors text-lg font-medium"
                aria-label="نقص الكمية"
              >
                -
              </button>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                min="1"
                className="w-16 text-center border-y border-gray-200 py-2 text-base"
                aria-label="الكمية"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="bg-gray-200 px-3 py-2 rounded-r hover:bg-gray-300 transition-colors text-lg font-medium"
                aria-label="زيادة الكمية"
              >
                +
              </button>
            </div>
          </div>

          {/* زر إضافة للسلة + اذهب إلى السلة */}
          <div className="flex flex-col sm:flex-row gap-3 mt-auto">
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center bg-primary-600 text-white py-3 sm:py-3 px-6 rounded-md hover:bg-primary-700 transition-colors text-sm sm:text-base w-full"
            >
              <ShoppingCart size={18} className="ml-2" />
              إضافة إلى السلة
            </button>

            <button
              onClick={goToCart}
              className="flex items-center justify-center border border-gray-300 py-3 sm:py-3 px-6 rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base w-full"
            >
              <ShoppingBag size={18} className="ml-2" />
              اذهب إلى السلة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
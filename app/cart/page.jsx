"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Trash2, Truck, CreditCard, ShoppingBag } from "lucide-react";
import { useCartStore } from "../../lib/store";

export default function CartPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cartItems = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const DELIVERY_FEE = 2;

  useEffect(() => {
    // Simulate loading from store
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const subtotal = totalPrice;
  const total = subtotal + DELIVERY_FEE;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 sm:w-64 mx-auto mb-8"></div>
          <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12 text-center">
        <div className="max-w-md mx-auto bg-red-50 p-6 rounded-lg border border-red-200">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <Link
            href="/"
            className="inline-block mt-2 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center">
        عرض السلة
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-10 sm:py-16 max-w-md mx-auto">
          <div className="mb-4 text-gray-400 flex justify-center">
            <ShoppingBag size={64} />
          </div>
          <p className="text-lg sm:text-xl text-gray-600 mb-6">
            سلة التسوق فارغة
          </p>
          <Link
            href="/"
            className="inline-block bg-primary-600 text-white px-5 py-2 sm:px-6 sm:py-3 rounded-md hover:bg-primary-700 transition-colors"
          >
            العودة للتسوق
          </Link>
        </div>
      ) : (
        <div className="flex flex-col space-y-3 sm:space-y-4">
          {/* عناصر السلة */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-3 sm:p-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="py-3 sm:py-4 border-b last:border-b-0"
                >
                  {/* للموبايل: ترتيب عمودي */}
                  <div className="block sm:hidden">
                    <div className="flex items-start gap-3 mb-3">
                      {/* صورة المنتج */}
                      <div className="w-16 h-16 relative flex-shrink-0">
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          sizes="64px"
                          className="object-cover rounded"
                        />
                      </div>

                      {/* معلومات المنتج */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm leading-tight mb-1 line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-xs mb-2">
                          {item.price} دينار
                        </p>

                        {/* السعر الإجمالي */}
                        <p className="font-semibold text-sm">
                          الإجمالي: {(item.price * item.quantity).toFixed(2)}{" "}
                          دينار
                        </p>
                      </div>
                    </div>

                    {/* التحكم في الكمية وزر الحذف */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item.id, item.quantity - 1);
                            }
                          }}
                          className="bg-gray-200 px-2 py-1 rounded-l text-sm min-w-[28px] min-h-[28px] flex items-center justify-center"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-10 text-center border-y border-gray-200 py-1 text-sm bg-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="bg-gray-200 px-2 py-1 rounded-r text-sm min-w-[28px] min-h-[28px] flex items-center justify-center"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 flex items-center text-xs hover:bg-red-50 p-2 rounded transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={12} className="ml-1" />
                        <span>إزالة</span>
                      </button>
                    </div>
                  </div>

                  {/* للتابلت والديسكتوب: ترتيب أفقي */}
                  <div className="hidden sm:flex items-center gap-4">
                    {/* صورة المنتج */}
                    <div className="w-20 h-20 relative">
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover rounded"
                      />
                    </div>

                    {/* معلومات المنتج */}
                    <div className="flex-1">
                      <h3 className="font-medium text-base">{item.title}</h3>
                      <p className="text-gray-600 text-sm">
                        {item.price} دينار
                      </p>
                    </div>

                    {/* التحكم في الكمية */}
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          }
                        }}
                        className="bg-gray-200 px-3 py-1 rounded-l text-sm min-w-[32px] min-h-[32px] flex items-center justify-center"
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-12 text-center border-y border-gray-200 py-1 text-sm bg-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="bg-gray-200 px-3 py-1 rounded-r text-sm min-w-[32px] min-h-[32px] flex items-center justify-center"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* السعر وزر الحذف */}
                    <div className="text-right">
                      <p className="font-semibold text-base">
                        {(item.price * item.quantity).toFixed(2)} دينار
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 mt-1 flex items-center text-sm hover:bg-red-50 p-1 rounded transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} className="ml-1" />
                        <span>إزالة</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ملخص الطلب */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center border-b pb-3 sm:pb-4">
                <span className="text-sm sm:text-base font-medium">
                  إجمالي المبلغ:
                </span>
                <span className="text-sm sm:text-base font-semibold">
                  {subtotal.toFixed(2)} دينار
                </span>
              </div>

              <div className="flex justify-between items-center border-b pb-3 sm:pb-4">
                <span className="flex items-center text-sm sm:text-base font-medium">
                  <Truck size={14} className="ml-2 flex-shrink-0" />
                  خدمة التوصيل:
                </span>
                <span className="text-sm sm:text-base font-semibold">
                  {DELIVERY_FEE.toFixed(2)} دينار
                </span>
              </div>

              <div className="flex justify-between items-center font-bold text-base sm:text-lg bg-green-50 p-3 rounded">
                <span>المجموع</span>
                <span className="text-green-600">{total.toFixed(2)} دينار</span>
              </div>
            </div>
          </div>

          {/* الأزرار */}
          <div className="space-y-3 sticky bottom-0 bg-gray-50 pt-3">
            <Link
              href="/checkout"
              className="block w-full bg-primary-600 text-white text-center py-3 sm:py-4 rounded-md hover:bg-primary-700 transition-colors text-base font-medium shadow-lg"
            >
              الذهاب للشراء
            </Link>
            <Link
              href="/"
              className="block w-full text-center text-primary-600 py-2 sm:py-3 border border-primary-600 rounded-md hover:bg-primary-50 transition-colors text-sm sm:text-base"
            >
              مواصلة التسوق
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

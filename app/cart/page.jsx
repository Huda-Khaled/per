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
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
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
        <div className="flex flex-col space-y-4">
          {/* عناصر السلة */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="py-4 flex items-center gap-4 border-b last:border-b-0"
                >
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
                    <p className="text-gray-600 text-sm">{item.price} دينار</p>
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
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
              ))}
            </div>
          </div>

          {/* ملخص الطلب */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-4">
                <span className="text-base">إجمالي المبلغ:</span>
                <span className="text-base">{subtotal.toFixed(2)} دينار</span>
              </div>
              <div className="flex justify-between border-b pb-4">
                <span className="flex items-center text-base">
                  <Truck size={16} className="ml-2 flex-shrink-0" />
                  خدمة التوصيل:
                </span>
                <span className="text-base">
                  {DELIVERY_FEE.toFixed(2)} دينار
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>المجموع</span>
                <span>{total.toFixed(2)} دينار</span>
              </div>
            </div>
          </div>

          {/* الأزرار */}
          <div className="space-y-3">
            <Link
              href="/checkout"
              className="block w-full bg-primary-600 text-white text-center py-3 rounded-md hover:bg-primary-700 transition-colors text-base font-medium"
            >
              الذهاب للشراء
            </Link>
            <Link
              href="/"
              className="block w-full text-center text-primary-600 py-3 border border-primary-600 rounded-md hover:bg-primary-50 transition-colors text-base"
            >
              مواصلة التسوق
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
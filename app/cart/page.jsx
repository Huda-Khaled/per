'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Trash2, Truck, CreditCard, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../lib/store';

export default function CartPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const cartItems = useCartStore(state => state.items);
  const totalPrice = useCartStore(state => state.totalPrice);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const updateQuantity = useCartStore(state => state.updateQuantity);

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
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">عرض السلة</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-10 sm:py-16 max-w-md mx-auto">
          <div className="mb-4 text-gray-400 flex justify-center">
            <ShoppingBag size={64} />
          </div>
          <p className="text-lg sm:text-xl text-gray-600 mb-6">سلة التسوق فارغة</p>
          <Link
            href="/"
            className="inline-block bg-primary-600 text-white px-5 py-2 sm:px-6 sm:py-3 rounded-md hover:bg-primary-700 transition-colors"
          >
            العودة للتسوق
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
          {/* عناصر السلة */}
          <div className="w-full md:w-3/5 lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold mb-4">منتجات السلة ({cartItems.length})</h2>
                <div className="divide-y">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0">
                      {/* صورة المنتج */}
                      <div className="w-full sm:w-16 md:w-20 h-32 sm:h-16 md:h-20 relative ml-0 sm:ml-4">
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 80px"
                          className="object-cover rounded"
                        />
                      </div>
                      
                      {/* معلومات المنتج */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">{item.title}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm">السعر: {item.price} دينار</p>
                      </div>
                      
                      {/* التحكم في الكمية والسعر */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            className="bg-gray-200 px-2 py-1 rounded-l text-sm min-w-[32px] min-h-[32px] flex items-center justify-center"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-8 sm:w-10 text-center border-y border-gray-200 py-1 text-xs sm:text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-gray-200 px-2 py-1 rounded-r text-sm min-w-[32px] min-h-[32px] flex items-center justify-center"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-sm sm:text-base">{(item.price * item.quantity).toFixed(2)} دينار</p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 mt-1 flex items-center text-xs sm:text-sm hover:bg-red-50 p-1 rounded transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} className="ml-1" />
                            <span className="hidden xs:inline">إزالة</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ملخص الطلب */}
          <div className="w-full md:w-2/5 lg:w-1/3 mt-6 md:mt-0">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-20">
              <h2 className="text-base sm:text-lg font-semibold mb-4">ملخص الطلب</h2>
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-4">
                  <span className="text-sm sm:text-base"> إجمالي المبلغ:</span>
                  <span className="text-sm sm:text-base">{subtotal.toFixed(2)} دينار</span>
                </div>
                <div className="flex justify-between border-b pb-4">
                  <span className="flex items-center text-sm sm:text-base">
                    <Truck size={16} className="ml-2 flex-shrink-0" />
                    خدمة التوصيل:
                  </span>
                  <span className="text-sm sm:text-base">{DELIVERY_FEE.toFixed(2)} دينار</span>
                </div>
                <div className="flex justify-between font-semibold text-base sm:text-lg">
                  <span>الإجمالي:</span>
                  <span>{total.toFixed(2)} دينار</span>
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mt-4">
                  <div className="flex items-center text-green-700 mb-2">
                    <CreditCard size={18} className="ml-2 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">طريقة الدفع</span>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base">الدفع كاش عند الاستلام</p>
                </div>
                <Link
                  href="/checkout"
                  className="block w-full bg-primary-600 text-white text-center py-2 sm:py-3 rounded-md hover:bg-primary-700 transition-colors text-sm sm:text-base"
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
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Check, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../../../../lib/store';
import { useRouter } from 'next/navigation';

export default function AddToCartButton({ product, quantity = 1, className = '' }) {
  const [isAdded, setIsAdded] = useState(false);
  const [showCartBar, setShowCartBar] = useState(false);
  const addToCart = useCartStore(state => state.addToCart);
  const cartItems = useCartStore(state => state.items);
  const router = useRouter();
  
  // حساب إجمالي عدد المنتجات في السلة
  const totalItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const handleAddToCart = () => {
    if (!product.in_stock) {
      alert('هذا المنتج غير متوفر حالياً');
      return;
    }
    
    addToCart(product, quantity);
    setIsAdded(true);
    setShowCartBar(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
    
    // الشريط السفلي سيظل ظاهراً لفترة أطول
    setTimeout(() => {
      setShowCartBar(false);
    }, 5000);
  };
  
  const goToCart = () => {
    router.push('/cart'); // تغيير هذا المسار حسب هيكل موقعك
  };

  return (
    <>
      <button
        onClick={handleAddToCart}
        disabled={isAdded || !product.in_stock}
        className={`flex items-center justify-center rounded-md transition-all duration-200
          ${!product.in_stock ? 'bg-gray-400 text-white cursor-not-allowed' : 
            isAdded ? 'bg-green-600 text-white' : 'bg-primary-600 text-white hover:bg-primary-700'}
          text-sm sm:text-base md:text-lg
          py-2 px-3 sm:py-2 sm:px-4 md:py-3 md:px-6
          w-full sm:w-auto
          ${className}`}
      >
        {!product.in_stock ? (
          <span>غير متوفر</span>
        ) : isAdded ? (
          <>
            <Check size={18} className="ml-1" />
            <span>تمت الإضافة</span>
          </>
        ) : (
          <>
            <ShoppingCart size={18} className="ml-1" />
            <span>إضافة للسلة</span>
          </>
        )}
      </button>
      
      {/* شريط أسفل الشاشة للانتقال إلى السلة */}
      {showCartBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary-600 text-white p-3 flex justify-between items-center shadow-lg z-50 transition-all duration-300 transform translate-y-0">
          <div className="flex items-center">
            <ShoppingCart size={20} className="ml-2" />
            <span className="text-lg font-medium">
              {totalItemsCount} {totalItemsCount === 1 ? 'منتج' : 'منتجات'} في السلة
            </span>
          </div>
          <button 
            onClick={goToCart}
            className="flex items-center bg-white text-primary-600 px-4 py-2 rounded-md font-medium"
          >
            عرض السلة
            <ArrowLeft size={16} className="mr-1" />
          </button>
        </div>
      )}
    </>
  );
}
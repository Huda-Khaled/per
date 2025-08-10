import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/store';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCartStore();

  return (
    <div className="py-3 md:py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 border-b pb-3 md:pb-4">
      
      {/* صورة المنتج - Responsive image container */}
      <div className="w-full sm:w-16 md:w-20 lg:w-24 h-32 sm:h-16 md:h-20 lg:h-24 relative rounded overflow-hidden">
        <Image 
          src={item.image} 
          alt={item.title} 
          fill 
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 16vw, (max-width: 1024px) 20vw, 24vw"
          className="object-cover rounded"
        />
      </div>

      {/* معلومات المنتج - Flexible content that adapts to screen size */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm md:text-base truncate">{item.title}</h3>
        <p className="text-gray-600 text-xs md:text-sm mt-1">السعر: {item.salePrice} دينار</p>
      </div>

      {/* التحكم في الكمية - Better sizing for touch devices */}
      <div className="flex items-center mt-2 sm:mt-0">
        <button 
          onClick={() => {
            if (item.quantity > 1) {
              updateQuantity(item.id, item.quantity - 1);
            }
          }}
          className="bg-gray-200 px-2 sm:px-3 py-1 rounded-l text-sm touch-manipulation min-w-[32px] min-h-[32px] disabled:opacity-50"
          disabled={item.quantity === 1}
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className="w-8 sm:w-10 text-center border-y border-gray-200 py-1 text-xs sm:text-sm">
          {item.quantity}
        </span>
        <button 
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="bg-gray-200 px-2 sm:px-3 py-1 rounded-r text-sm touch-manipulation min-w-[32px] min-h-[32px]"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      {/* السعر النهائي + زر الإزالة - Better aligned on different screen sizes */}
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0">
        <p className="font-semibold text-sm md:text-base">
          {item.salePrice * item.quantity} دينار
        </p>
        <button 
          onClick={() => removeFromCart(item.id)}
          className="text-red-500 flex items-center text-xs md:text-sm p-1 hover:bg-red-50 rounded transition-colors"
          aria-label="Remove item"
        >
          <Trash2 size={16} className="ml-1" />
          <span className="hidden xs:inline">إزالة</span>
        </button>
      </div>
    </div>
  );
}
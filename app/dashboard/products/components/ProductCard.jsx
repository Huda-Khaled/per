import Image from 'next/image';
import DeleteProductButton from './DeleteProductButton';
import EditProductModal from './EditProductModal';
import { useState, useEffect } from 'react';
import { formatDate, getResponsiveDate } from './FormattedDate';
import { useInView } from 'react-intersection-observer'; // اختياري: يمكنك تثبيت هذه المكتبة للتحميل البطيء

export default function ProductCard({ product, onProductUpdated }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  
  // استخدام IntersectionObserver للتحميل البطيء (اختياري)
  const { ref: cardRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // تتبع حجم الشاشة للتجاوب
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // اختصار الوصف بناءً على عرض الشاشة
  const getDescriptionMaxLength = () => {
    if (windowWidth < 640) return 60; // للهواتف الصغيرة
    if (windowWidth < 768) return 80; // للأجهزة اللوحية الصغيرة
    return 100; // للشاشات الأكبر
  };

  // اختصار الوصف
  const truncateDescription = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div 
      ref={cardRef}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full transform hover:-translate-y-1 hover:scale-[1.01]"
    >
      {/* صورة المنتج */}
      <div className="relative h-40 sm:h-48 md:h-56 w-full overflow-hidden group">
        {product.image_url ? (
          <>
            {/* شبكة تحميل الصورة */}
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* الصورة الفعلية */}
            <Image
              src={product.image_url}
              alt={product.title || 'صورة المنتج'}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              quality={inView ? 85 : 15}
              priority={false}
              loading="lazy"
              objectFit="cover"
              className={`transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105 transition-transform duration-500`}
              onLoadingComplete={() => setIsImageLoaded(true)}
            />
            
            {/* وسم الأسعار */}
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
              {product.price} دينار
            </div>
          </>
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center text-center p-4">
            <span className="text-gray-400 text-sm">لا توجد صورة للمنتج</span>
          </div>
        )}
      </div>
      
      {/* معلومات المنتج */}
      <div className="p-3 sm:p-4 flex-grow flex flex-col">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 line-clamp-1">{product.title}</h3>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-2 flex-grow">
          {truncateDescription(product.description, getDescriptionMaxLength())}
        </p>
        
        <div className="mt-2 text-xs sm:text-sm text-gray-500 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span>تم الإضافة: {windowWidth < 640 ? getResponsiveDate(product.created_at, windowWidth) : formatDate(product.created_at)}</span>
        </div>
        
        {/* أزرار التحكم */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-between gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="w-full sm:w-auto px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            تعديل
          </button>
          
          <DeleteProductButton 
            productId={product.id}
            productTitle={product.title} 
            onProductDeleted={onProductUpdated}
          />
        </div>
      </div>

      {/* نافذة التعديل */}
      {showEditModal && (
        <EditProductModal
          product={product}
          onClose={() => setShowEditModal(false)}
          onProductUpdated={onProductUpdated}
        />
      )}
    </div>
  );
}
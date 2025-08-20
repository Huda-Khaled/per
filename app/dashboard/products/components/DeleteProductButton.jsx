export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { useState, useEffect } from 'react';
import { createSupabaseClient } from '../../../../lib/supabaseClient';
import CustomToaster from './CustomToaster';

export default function DeleteProductButton({ productId, productTitle, onProductDeleted }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  // منع التمرير عند فتح النافذة المنبثقة
  useEffect(() => {
    if (showConfirmation) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showConfirmation]);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const supabase = createSupabaseClient();
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      setToast({
        type: 'success',
        message: 'تم حذف المنتج بنجاح'
      });
      
      if (onProductDeleted) {
        onProductDeleted();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      
      setToast({
        type: 'error',
        message: 'حدث خطأ أثناء حذف المنتج'
      });
    } finally {
      setIsDeleting(false);
      setShowConfirmation(false);
    }
  };

  // إغلاق النافذة المنبثقة عند الضغط على Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showConfirmation && !isDeleting) {
        setShowConfirmation(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showConfirmation, isDeleting]);

  return (
    <>
      <button
        onClick={() => setShowConfirmation(true)}
        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        aria-label="حذف المنتج"
      >
        حذف
      </button>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50 p-4" 
          role="dialog" 
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div 
            className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full shadow-xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-modal-title" className="text-lg font-medium text-gray-900 mb-3 sm:mb-4 text-right">تأكيد الحذف</h3>
            <p className="text-sm text-gray-500 mb-4 text-right">
              هل أنت متأكد من رغبتك في حذف المنتج: <span className="font-medium break-words">{productTitle}</span>؟
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-5">
              <button
                onClick={() => !isDeleting && setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors w-full sm:w-auto"
                disabled={isDeleting}
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors w-full sm:w-auto mb-2 sm:mb-0"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الحذف...
                  </span>
                ) : 'تأكيد الحذف'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <CustomToaster
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          position="bottom-right"
        />
      )}
    </>
  );
}
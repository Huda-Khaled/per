import { useState, useEffect, useCallback, useMemo } from "react";
import { createClientSupabaseClient } from "../../../../lib/supabase/client";
import ProductCard from "./ProductCard";
import AddProductModal from "./AddProductModal";
import CustomToaster from "./CustomToaster";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at_desc");
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  // إنشاء Supabase client
  const supabase = useMemo(() => createClientSupabaseClient(), []);

  // تحميل المنتجات مع إصلاح خطأ الفرز
  const loadProducts = useCallback(async (skipLoading = false) => {
    try {
      if (!skipLoading) setLoading(true);

      // حل آمن للفرز باستخدام object mapping
      const sortOptions = {
        'title_asc': { column: 'title', direction: 'asc' },
        'title_desc': { column: 'title', direction: 'desc' },
        'price_asc': { column: 'price', direction: 'asc' },
        'price_desc': { column: 'price', direction: 'desc' },
        'created_at_asc': { column: 'created_at', direction: 'asc' },
        'created_at_desc': { column: 'created_at', direction: 'desc' }
      };

      const sortOption = sortOptions[sortBy] || { column: 'created_at', direction: 'desc' };
      const { column, direction } = sortOption;

      console.log('Sorting by:', { column, direction, sortBy });

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order(column, { ascending: direction === "asc" });

      if (error) throw error;

      setProducts(data || []);
      console.log('Products loaded:', data?.length || 0);
    } catch (error) {
      console.error("Error loading products:", error);
      setToast({
        type: "error",
        message: "حدث خطأ أثناء تحميل المنتجات",
      });
    } finally {
      if (!skipLoading) setLoading(false);
    }
  }, [supabase, sortBy]);

  // إعداد Real-time subscription محسن
  useEffect(() => {
    let subscription;
    
    const setupRealtimeSubscription = async () => {
      try {
        console.log('Setting up realtime subscription...');
        setConnectionStatus('CONNECTING');

        // تحميل البيانات للمرة الأولى
        await loadProducts();

        // إنشاء Real-time subscription موحد
        subscription = supabase
          .channel('products-realtime-channel', {
            config: {
              broadcast: { self: true }
            }
          })
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'products'
            },
            (payload) => {
              console.log('Real-time change detected:', payload);
              
              const { eventType, new: newProduct, old: oldProduct } = payload;
              
              // تحديث الحالة بناءً على نوع الحدث
              switch (eventType) {
                case 'INSERT':
                  setProducts(prev => [newProduct, ...prev]);
                  setToast({
                    type: 'success',
                    message: `تم إضافة منتج جديد: ${newProduct.title}`
                  });
                  break;
                  
                case 'UPDATE':
                  setProducts(prev => 
                    prev.map(product => 
                      product.id === newProduct.id ? newProduct : product
                    )
                  );
                  setToast({
                    type: 'info',
                    message: `تم تحديث منتج: ${newProduct.title}`
                  });
                  break;
                  
                case 'DELETE':
                  setProducts(prev => 
                    prev.filter(product => product.id !== oldProduct.id)
                  );
                  setToast({
                    type: 'warning',
                    message: `تم حذف منتج: ${oldProduct.title}`
                  });
                  break;
                  
                default:
                  // إعادة تحميل البيانات للأحداث غير المتوقعة
                  loadProducts(true);
              }
            }
          )
          .subscribe((status, err) => {
            console.log('Subscription status:', status);
            
            if (status === 'SUBSCRIBED') {
              setConnectionStatus('CONNECTED');
              console.log('Successfully subscribed to products changes');
            } else if (status === 'CHANNEL_ERROR') {
              setConnectionStatus('ERROR');
              console.error('Subscription error:', err);
            } else if (status === 'TIMED_OUT') {
              setConnectionStatus('TIMEOUT');
              console.error('Subscription timeout');
            } else if (status === 'CLOSED') {
              setConnectionStatus('OFFLINE');
              console.log('Subscription closed');
            }
          });

      } catch (error) {
        console.error('Failed to setup subscription:', error);
        setConnectionStatus('ERROR');
      }
    };

    setupRealtimeSubscription();

    // تنظيف الـ subscription
    return () => {
      if (subscription) {
        console.log('Cleaning up subscription...');
        supabase.removeChannel(subscription);
      }
    };
  }, [supabase, loadProducts]);

  // تتبع تغيرات حجم الشاشة
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // إعادة الاتصال عند انقطاع الشبكة
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network back online, reloading products...');
      setConnectionStatus('CONNECTING');
      loadProducts(true);
    };

    const handleOffline = () => {
      console.log('Network offline');
      setConnectionStatus('OFFLINE');
    };

    if (typeof window !== "undefined") {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [loadProducts]);

  // دالة لإعادة الاتصال
  const reconnect = useCallback(() => {
    setConnectionStatus('CONNECTING');
    loadProducts(true);
  }, [loadProducts]);

  // مؤشر حالة الاتصال المحسن
  const getConnectionIndicator = () => {
    const indicators = {
      CONNECTING: { 
        color: 'bg-yellow-400', 
        text: 'جاري الاتصال...', 
        animate: 'animate-pulse',
        showReconnect: false
      },
      CONNECTED: { 
        color: 'bg-green-400', 
        text: 'متصل مباشر', 
        animate: 'animate-pulse',
        showReconnect: false
      },
      ERROR: { 
        color: 'bg-red-400', 
        text: 'خطأ في الاتصال', 
        animate: '',
        showReconnect: true
      },
      TIMEOUT: { 
        color: 'bg-orange-400', 
        text: 'انتهت مهلة الاتصال', 
        animate: '',
        showReconnect: true
      },
      OFFLINE: { 
        color: 'bg-gray-400', 
        text: 'غير متصل', 
        animate: '',
        showReconnect: true
      }
    };

    const indicator = indicators[connectionStatus] || indicators.CONNECTING;
    
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className={`w-2 h-2 ${indicator.color} rounded-full ${indicator.animate}`}></div>
        <span>{indicator.text}</span>
        {indicator.showReconnect && (
          <button 
            onClick={reconnect}
            className="text-xs text-blue-600 hover:text-blue-800 underline ml-1 transition-colors"
            disabled={connectionStatus === 'CONNECTING'}
          >
            إعادة الاتصال
          </button>
        )}
      </div>
    );
  };

  // تصفية المنتجات حسب كلمة البحث
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;

    const searchLower = searchTerm.toLowerCase().trim();
    return products.filter(
      (product) =>
        product.title?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower)
    );
  }, [products, searchTerm]);

  // تحديد عدد الأعمدة حسب حجم الشاشة
  const getGridCols = () => {
    if (windowWidth < 640) return "grid-cols-1";
    if (windowWidth < 768) return "grid-cols-1 sm:grid-cols-2";
    if (windowWidth < 1024) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-2";
    if (windowWidth < 1280) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3";
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4";
  };

  // دالة لإعادة التحميل اليدوي
  const handleRefresh = useCallback(async () => {
    setToast({
      type: 'info',
      message: 'جاري تحديث البيانات...'
    });
    
    try {
      await loadProducts();
      setToast({
        type: 'success',
        message: 'تم تحديث البيانات بنجاح'
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: 'فشل في تحديث البيانات'
      });
    }
  }, [loadProducts]);

  // دالة إغلاق الإشعار
  const handleCloseToast = useCallback(() => {
    setToast(null);
  }, []);

  // دالة فتح نافذة الإضافة
  const handleOpenAddModal = useCallback(() => {
    setShowAddModal(true);
  }, []);

  // دالة إغلاق نافذة الإضافة
  const handleCloseAddModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  // دالة عند إضافة منتج جديد
  const handleProductAdded = useCallback(() => {
    // لا نحتاج لإعادة تحميل البيانات لأن Real-time سيتولى الأمر
    setShowAddModal(false);
  }, []);

  // دالة عند تحديث منتج
  const handleProductUpdated = useCallback(() => {
    // لا نحتاج لإعادة تحميل البيانات لأن Real-time سيتولى الأمر
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* رأس الصفحة مع زر الإضافة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            المنتجات ({filteredProducts.length})
          </h2>
          {/* زر التحديث اليدوي */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="تحديث البيانات"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          إضافة منتج جديد
        </button>
      </div>

      {/* أدوات البحث والفرز */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="البحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-gray-300 pr-10 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-right"
            dir="rtl"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            dir="rtl"
          >
            <option value="title_asc">الاسم (أ-ي)</option>
            <option value="title_desc">الاسم (ي-أ)</option>
            <option value="price_asc">السعر (الأقل أولاً)</option>
            <option value="price_desc">السعر (الأعلى أولاً)</option>
            <option value="created_at_desc">الأحدث أولاً</option>
            <option value="created_at_asc">الأقدم أولاً</option>
          </select>
        </div>
      </div>

      {/* مؤشر الاتصال المباشر */}
      <div className="flex justify-end">
        {getConnectionIndicator()}
      </div>

      {/* عرض المنتجات */}
      {loading ? (
        // حالة التحميل
        <div className={`grid ${getGridCols()} gap-4 sm:gap-6`}>
          {[...Array(windowWidth < 640 ? 3 : 6)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm p-4 animate-pulse"
            >
              <div className="h-32 sm:h-40 bg-gray-200 rounded-md mb-4"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex flex-col sm:flex-row gap-2 justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="h-8 bg-gray-200 rounded w-full sm:w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-full sm:w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        // حالة عدم وجود منتجات
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
          {searchTerm ? (
            <>
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">
                لا توجد نتائج للبحث عن "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="text-blue-600 hover:underline transition-colors"
              >
                مسح البحث
              </button>
            </>
          ) : (
            <>
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">
                لا توجد منتجات بعد. قم بإضافة منتج جديد للبدء.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="flex items-center justify-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  إضافة منتج جديد
                </span>
              </button>
            </>
          )}
        </div>
      ) : (
        // عرض قائمة المنتجات
        <div className={`grid ${getGridCols()} gap-4 sm:gap-6`}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onProductUpdated={handleProductUpdated}
            />
          ))}
        </div>
      )}

      {/* نافذة إضافة منتج جديد */}
      {showAddModal && (
        <AddProductModal
          onClose={handleCloseAddModal}
          onProductAdded={handleProductAdded}
        />
      )}

      {/* إشعارات */}
      {toast && (
        <CustomToaster
          type={toast.type}
          message={toast.message}
          onClose={handleCloseToast}
          position={windowWidth < 640 ? "bottom-center" : "bottom-right"}
          autoClose={4000}
        />
      )}
    </div>
  );
}
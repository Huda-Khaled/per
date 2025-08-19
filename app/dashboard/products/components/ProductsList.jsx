import { useState, useEffect, useCallback, useMemo } from "react";
import { createClientSupabaseClient } from "../../../../lib/supabase/client"; // استخدام الـ client المحسن
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
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  // إنشاء Supabase client
  const supabase = useMemo(() => createClientSupabaseClient(), []);

  // تتبع تغيرات حجم الشاشة
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // تحميل المنتجات من Supabase
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);

      // تحديد ترتيب الفرز
      const [column, direction] = sortBy.split("_");

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
      setLoading(false);
    }
  }, [supabase, sortBy]);

  // تحميل المنتجات والاستماع للتغييرات Real-time
  useEffect(() => {
    // تحميل البيانات للمرة الأولى
    loadProducts();

    // إنشاء Real-time subscription
    const subscription = supabase
      .channel('products-channel')
      .on(
        'postgres_changes',
        {
          event: '*', // الاستماع لجميع الأحداث (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Real-time change detected:', payload);
          
          // إعادة تحميل البيانات عند حدوث تغيير
          loadProducts();
          
          // إظهار إشعار حسب نوع التغيير
          switch (payload.eventType) {
            case 'INSERT':
              setToast({
                type: 'success',
                message: 'تم إضافة منتج جديد!'
              });
              break;
            case 'UPDATE':
              setToast({
                type: 'info',
                message: 'تم تحديث منتج!'
              });
              break;
            case 'DELETE':
              setToast({
                type: 'warning',
                message: 'تم حذف منتج!'
              });
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // تنظيف الـ subscription عند إلغاء الـ component
    return () => {
      console.log('Unsubscribing from products channel');
      subscription.unsubscribe();
    };
  }, [supabase, loadProducts]);

  // تحميل المنتجات عند تغيير طريقة الفرز فقط (بدون real-time)
  useEffect(() => {
    if (!loading) { // تجنب إعادة التحميل أثناء التحميل الأولي
      loadProducts();
    }
  }, [sortBy]);

  // تصفية المنتجات حسب كلمة البحث
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;

    const searchLower = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.title?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
    );
  }, [products, searchTerm]);

  // تحديد عدد الأعمدة حسب حجم الشاشة
  const getGridCols = () => {
    if (windowWidth < 640) return "grid-cols-1";
    if (windowWidth < 768) return "grid-cols-1 sm:grid-cols-2";
    if (windowWidth < 1024) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-2";
    if (windowWidth < 1280)
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3";
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4";
  };

  // دالة لإعادة التحميل اليدوي
  const handleRefresh = () => {
    loadProducts();
    setToast({
      type: 'info',
      message: 'تم تحديث البيانات'
    });
  };

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
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50"
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
          onClick={() => setShowAddModal(true)}
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
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>متصل مباشر</span>
        </div>
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
                className="text-blue-600 hover:underline"
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
                onClick={() => setShowAddModal(true)}
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
              onProductUpdated={loadProducts}
            />
          ))}
        </div>
      )}

      {/* نافذة إضافة منتج جديد */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onProductAdded={loadProducts}
        />
      )}

      {/* إشعارات */}
      {toast && (
        <CustomToaster
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          position={windowWidth < 640 ? "bottom-center" : "bottom-right"}
        />
      )}
    </div>
  );
}
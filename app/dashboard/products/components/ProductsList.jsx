import { useState, useEffect, useCallback, useMemo } from "react";
import { createSupabaseClient } from "../../../../lib/supabaseClient";
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
    setLoading(true);
    try {
      const supabase = createSupabaseClient();

      // تحديد ترتيب الفرز
      const [column, direction] = sortBy.split("_");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order(column, { ascending: direction === "asc" });

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      setToast({
        type: "error",
        message: "حدث خطأ أثناء تحميل المنتجات",
      });
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  // تحميل المنتجات عند تغيير طريقة الفرز
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
    if (windowWidth < 640) return "grid-cols-1"; // للهواتف الصغيرة
    if (windowWidth < 768) return "grid-cols-1 sm:grid-cols-2"; // للهواتف الكبيرة والأجهزة اللوحية الصغيرة
    if (windowWidth < 1024) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-2"; // للأجهزة اللوحية
    if (windowWidth < 1280)
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"; // للشاشات المتوسطة
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"; // للشاشات الكبيرة
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* رأس الصفحة مع زر الإضافة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
          المنتجات ({filteredProducts.length})
        </h2>
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
          </select>
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
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
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

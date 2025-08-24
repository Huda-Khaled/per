import Image from "next/image";
import DeleteProductButton from "./DeleteProductButton";
import EditProductModal from "./EditProductModal";
import { useState, useEffect, useCallback, useMemo } from "react";
import { formatDate, getResponsiveDate } from "./FormattedDate";
import { useInView } from "react-intersection-observer";
import CustomToaster from "./CustomToaster";

export default function ProductCard({
  product: initialProduct,
  onProductUpdated,
}) {
  const [product, setProduct] = useState(initialProduct);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [toast, setToast] = useState(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  const { ref: cardRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // تحديث المنتج فقط إذا تغير ID أو البيانات الأساسية
  useEffect(() => {
    if (
      initialProduct.id !== product.id ||
      initialProduct.in_stock !== product.in_stock ||
      initialProduct.title !== product.title ||
      initialProduct.price !== product.price
    ) {
      setProduct(initialProduct);
    }
  }, [
    initialProduct.id,
    initialProduct.in_stock,
    initialProduct.title,
    initialProduct.price,
    product.id,
    product.in_stock,
    product.title,
    product.price,
  ]);

  // استخدام useMemo لتحسين الأداء
  const descriptionMaxLength = useMemo(() => {
    if (windowWidth < 640) return 60;
    if (windowWidth < 768) return 80;
    return 100;
  }, [windowWidth]);

  const truncatedDescription = useMemo(() => {
    const text = product.description || "";
    if (text.length <= descriptionMaxLength) return text;
    return text.substring(0, descriptionMaxLength) + "...";
  }, [product.description, descriptionMaxLength]);

  const formattedDate = useMemo(() => {
    return windowWidth < 640
      ? getResponsiveDate(product.created_at, windowWidth)
      : formatDate(product.created_at);
  }, [product.created_at, windowWidth]);

  // استخدام useCallback لتحسين الأداء
  const toggleStockStatus = useCallback(async () => {
    if (isUpdatingStock) return;

    setIsUpdatingStock(true);
    const newStatus = !product.in_stock;
    const previousStatus = product.in_stock;

    console.log("محاولة تحديث حالة المخزون:", {
      productId: product.id,
      currentStatus: previousStatus,
      newStatus: newStatus,
    });

    try {
      // تحديث الحالة محلياً أولاً (Optimistic Update)
      setProduct((prev) => ({ ...prev, in_stock: newStatus }));

      // التحقق من وجود معرف المنتج
      if (!product.id) {
        throw new Error("معرف المنتج مفقود");
      }

      console.log("إرسال طلب API:", {
        url: `/api/products/${product.id}/stock`,
        method: "PATCH",
        body: { in_stock: newStatus },
      });

      const response = await fetch(`/api/products/${product.id}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          in_stock: newStatus,
        }),
      });

      console.log("استجابة API:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      // قراءة النص قبل معالجته
      const responseText = await response.text();
      console.log("نص الاستجابة:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("خطأ في تحليل JSON:", parseError);
        throw new Error(`استجابة غير صالحة من الخادم: ${responseText}`);
      }

      console.log("نتيجة مُحللة:", result);

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      if (result.success) {
        console.log("نجح تحديث المخزون");

        // إظهار رسالة نجاح
        setToast({
          type: "success",
          message: `تم ${newStatus ? "تفعيل" : "إلغاء"} توفر المنتج بنجاح`,
          duration: 3000,
        });

        // تحديث الحالة بالبيانات الجديدة من الخادم
        if (result.data) {
          setProduct(result.data);
        }

        // استدعاء callback لتحديث القائمة
        if (onProductUpdated) {
          onProductUpdated();
        }
      } else {
        throw new Error(result.error || "فشل في تحديث حالة المخزون");
      }
    } catch (error) {
      console.error("خطأ في تحديث حالة المخزون:", error);

      // إرجاع الحالة السابقة في حالة الخطأ
      setProduct((prev) => ({ ...prev, in_stock: previousStatus }));

      // إظهار رسالة خطأ أكثر تفصيلاً
      let errorMessage = "حدث خطأ أثناء تحديث حالة المخزون";

      if (error.message) {
        errorMessage = error.message;
      }

      setToast({
        type: "error",
        message: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsUpdatingStock(false);
    }
  }, [product.id, product.in_stock, isUpdatingStock, onProductUpdated]);

  const handleCloseToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleOpenEditModal = useCallback(() => {
    setShowEditModal(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
  }, []);

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
                <svg
                  className="w-10 h-10 text-gray-300"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* الصورة الفعلية */}
            <Image
              src={product.image_url}
              alt={product.title || "صورة المنتج"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              quality={inView ? 85 : 15}
              priority={false}
              loading="lazy"
              style={{ objectFit: "cover" }}
              className={`transition-opacity duration-300 ${
                isImageLoaded ? "opacity-100" : "opacity-0"
              } group-hover:scale-105 transition-transform duration-500`}
              onLoad={() => setIsImageLoaded(true)}
            />

            {/* وسم الأسعار */}
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
              {product.price} دينار
            </div>

            {/* حالة المخزون */}
            <div
              className={`absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md ${
                product.in_stock ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {product.in_stock ? "متوفر" : "غير متوفر"}
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
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 line-clamp-1">
          {product.title}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-2 flex-grow">
          {truncatedDescription}
        </p>

        <div className="mt-2 text-xs sm:text-sm text-gray-500 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <span>تم الإضافة: {formattedDate}</span>
        </div>

        {/* أزرار التحكم */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <button
              onClick={handleOpenEditModal}
              className="w-full sm:w-auto px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
              disabled={isUpdatingStock}
            >
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              تعديل
            </button>

            <DeleteProductButton
              productId={product.id}
              productTitle={product.title}
              onProductDeleted={onProductUpdated}
            />
          </div>

          {/* زر تغيير حالة المخزون - محسّن */}
          <button
            onClick={toggleStockStatus}
            disabled={isUpdatingStock}
            className={`w-full px-3 py-2 rounded transition-colors flex items-center justify-center gap-2 ${
              product.in_stock
                ? "bg-green-600 hover:bg-green-700 disabled:bg-green-400"
                : "bg-red-600 hover:bg-red-700 disabled:bg-red-400"
            } text-white disabled:cursor-not-allowed`}
          >
            {isUpdatingStock ? (
              <>
                <svg
                  className="animate-spin -ml-1 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                جاري التحديث...
              </>
            ) : (
              <>
                <div
                  className={`w-2 h-2 rounded-full ${
                    product.in_stock ? "bg-white" : "bg-white"
                  }`}
                ></div>
                {product.in_stock ? "متوفر" : "غير متوفر"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* نافذة التعديل */}
      {showEditModal && (
        <EditProductModal
          product={product}
          onClose={handleCloseEditModal}
          onProductUpdated={onProductUpdated}
        />
      )}

      {/* التوست للإشعارات */}
      {toast && (
        <CustomToaster
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={handleCloseToast}
          position="bottom-center"
        />
      )}
    </div>
  );
}

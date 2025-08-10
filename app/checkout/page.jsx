"use client";
export const runtime = "nodejs";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useCartStore } from "../../lib/store";
import {
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  X,
  ArrowLeft,
} from "lucide-react";

// إعداد Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// مكون الإشعارات
const Notification = ({ message, type, onClose }) => {
  // تحديد لون الإشعار بناءً على النوع (نجاح أو خطأ)
  const bgColor =
    type === "success"
      ? "bg-green-50 border-green-500"
      : "bg-red-50 border-red-500";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  const iconColor = type === "success" ? "text-green-500" : "text-red-500";

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-xs sm:max-w-sm md:max-w-md z-50 p-3 sm:p-4 border-r-4 ${bgColor} rounded-md shadow-lg flex items-start`}
    >
      <div className={`mr-2 sm:mr-3 ${iconColor} flex-shrink-0`}>
        {type === "success" ? (
          <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        ) : (
          <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        )}
      </div>
      <div className="flex-1 mr-2">
        <p className={`text-xs sm:text-sm font-medium ${textColor}`}>
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-gray-400 hover:text-gray-500 flex-shrink-0"
        aria-label="إغلاق الإشعار"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </div>
  );
};

// مكون عنصر المنتج في ملخص الطلب
const OrderSummaryItem = ({ item }) => (
  <div className="py-3 sm:py-4 flex items-center">
    <div className="w-12 h-12 sm:w-16 sm:h-16 relative ml-2 sm:ml-3 flex-shrink-0">
      <Image
        src={item.image_url || "/images/placeholder.jpg"}
        alt={item.name}
        fill
        sizes="(max-width: 640px) 48px, 64px"
        className="object-cover rounded"
      />
      <span className="absolute -top-2 -right-2 bg-gray-200 text-gray-800 w-5 h-5 rounded-full flex items-center justify-center text-xs">
        {item.quantity}
      </span>
    </div>

    <div className="flex-1 min-w-0">
      <h3 className="text-xs sm:text-sm font-medium truncate">{item.name}</h3>
      <p className="text-gray-600 text-xs">
        {parseFloat(item.price).toFixed(2)} دينار
      </p>
    </div>

    <div className="text-right flex-shrink-0">
      <p className="font-semibold text-xs sm:text-sm">
        {(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)} دينار
      </p>
    </div>
  </div>
);

// مكون حالة التحميل
const LoadingSpinner = ({ message }) => (
  <div className="text-center py-6 sm:py-8">
    <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600"></div>
    <p className="mt-2 text-sm sm:text-base">{message}</p>
  </div>
);

export default function CheckoutPage() {
  const router = useRouter();
  // استخدام متجر الحالة للوصول إلى بيانات السلة
  const cartItems = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  const [actualProducts, setActualProducts] = useState([]); // تخزين المنتجات الفعلية من قاعدة البيانات
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // حالة تقديم الطلب
  const [notification, setNotification] = useState(null);
  const [isBrowser, setIsBrowser] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    area: "",
    block: "",
    street: "",
    house: "",
    paymentMethod: "cod",
  });

  // رسوم التوصيل
  const deliveryFee = 2;

  // تحديد ما إذا كنا في بيئة المتصفح
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // إظهار إشعار منسق
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    // إخفاء الإشعار تلقائيًا بعد 5 ثوانٍ
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // التحقق من صحة رقم الهاتف (خاص بالكويت)
  const validatePhone = (phone) => {
    // نمط يتناسب مع أرقام الهواتف الكويتية
    const phonePattern = /^[0-9]{8}$/;
    return phonePattern.test(phone);
  };

  // جلب عناصر سلة التسوق من متجر الحالة وبيانات المنتجات من Supabase
  useEffect(() => {
    if (!isBrowser) return;

    const fetchCartAndProducts = async () => {
      setLoading(true);
      try {
        // استخدام عناصر السلة من متجر الحالة Zustand
        const storeCartItems = useCartStore.getState().items;

        // التحقق من أن السلة ليست فارغة
        if (!Array.isArray(storeCartItems) || storeCartItems.length === 0) {
          setActualProducts([]);
          setLoading(false);
          showNotification("السلة فارغة. يرجى إضافة منتجات أولاً.", "error");
          return;
        }

        // استخراج معرفات المنتجات (IDs) من السلة
        const productIds = storeCartItems.map((item) => Number(item.id));

        // جلب بيانات المنتجات الفعلية من Supabase
        const { data: productsData, error } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds);

        if (error) {
          throw error;
        }

        // التحقق من وجود منتجات
        if (!productsData || productsData.length === 0) {
          showNotification("لم نتمكن من العثور على المنتجات المطلوبة", "error");
          setLoading(false);
          return;
        }

        // دمج بيانات المنتجات مع الكميات في السلة
        const productsWithQuantity = productsData.map((product) => {
          const cartItem = storeCartItems.find(
            (item) => Number(item.id) === product.id
          );
          return {
            ...product,
            quantity: cartItem ? cartItem.quantity : 1,
          };
        });

        setActualProducts(productsWithQuantity);

        // التحقق من أن جميع المنتجات في السلة متوفرة في قاعدة البيانات
        if (productsWithQuantity.length !== productIds.length) {
          showNotification(
            "بعض المنتجات في سلتك لم تعد متوفرة. تم تحديث السلة.",
            "error"
          );
        }
      } catch (error) {
        console.error("حدث خطأ أثناء تحميل عناصر سلة التسوق:", error);
        showNotification(
          "حدث خطأ أثناء تحميل عناصر سلة التسوق. يرجى تحديث الصفحة.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCartAndProducts();
  }, [isBrowser]);

  // التعامل مع تغيير قيم النموذج
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // معالجة تقديم الطلب
  const handleSubmit = async (e) => {
    e.preventDefault();

    // التحقق من وجود منتجات
    if (actualProducts.length === 0) {
      showNotification("السلة فارغة. لا يمكن إتمام الطلب.", "error");
      return;
    }

    // التحقق من صحة رقم الهاتف
    if (!validatePhone(formData.phone)) {
      showNotification("يرجى إدخال رقم هاتف صحيح (8 أرقام)", "error");
      return;
    }

    // تعطيل زر التقديم أثناء المعالجة
    setIsSubmitting(true);

    try {
      // حساب المبلغ الإجمالي باستخدام الأسعار الفعلية من قاعدة البيانات
      const calculatedSubtotal = actualProducts.reduce((sum, product) => {
        return sum + parseFloat(product.price) * parseInt(product.quantity);
      }, 0);

      const calculatedTotal = calculatedSubtotal + deliveryFee;

      // تحضير عنوان التوصيل
      const deliveryAddress = `المنطقة: ${formData.area}، قطعة: ${formData.block}، شارع: ${formData.street}، منزل: ${formData.house}`;

      // تحضير عناصر الطلب
      const orderItems = actualProducts.map((product) => ({
        product_id: product.id,
        quantity: parseInt(product.quantity),
        price: parseFloat(product.price),
      }));

      // استخدام وظيفة RPC مخصصة لإنشاء الطلب والعميل معًا
      const { data: orderResult, error: orderError } = await supabase.rpc(
        "create_order_with_customer",
        {
          p_customer_name: formData.fullName,
          p_customer_phone: formData.phone,
          p_customer_address: deliveryAddress,
          p_payment_method: formData.paymentMethod,
          p_delivery_fee: deliveryFee,
          p_total_amount: calculatedTotal,
          p_order_items: orderItems,
        }
      );

      if (orderError) throw orderError;
      console.log("orderResult:", orderResult);
      console.log("orderResult type:", typeof orderResult);
      if (Array.isArray(orderResult)) {
        console.log("orderResult is an array with length:", orderResult.length);
      }
      console.log("order_id:", orderResult?.order_id);

      // استخراج معرف الطلب من النتيجة
      const orderId = orderResult?.order?.id;

      if (!orderId) {
        throw new Error("لم يتم إنشاء الطلب بشكل صحيح");
      }

      // تنظيف سلة التسوق بعد إكمال الطلب
      clearCart();

      // عرض رسالة نجاح
      showNotification("تم تقديم طلبك بنجاح! سنتواصل معك قريبًا لتأكيد الطلب.");

      // إعادة تعيين النموذج
      setFormData({
        fullName: "",
        phone: "",
        area: "",
        block: "",
        street: "",
        house: "",
        paymentMethod: "cod",
      });
      setActualProducts([]);

      // توجيه المستخدم إلى صفحة تأكيد الطلب بعد فترة قصيرة
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      console.error("حدث خطأ أثناء معالجة الطلب:", error);
      showNotification(
        "حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // إذا كنا لا نزال في مرحلة التنفيذ على السيرفر، أظهر شاشة التحميل
  if (!isBrowser) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8 rtl">
        <LoadingSpinner message="جاري تحميل الصفحة..." />
      </div>
    );
  }

  // حساب المجموع الفرعي من المنتجات الفعلية
  const subtotal =
    actualProducts.length > 0
      ? actualProducts.reduce((sum, product) => {
          const price = parseFloat(product.price);
          const quantity = parseInt(product.quantity);
          return sum + price * quantity;
        }, 0)
      : 0;

  // المجموع الكلي مع رسوم التوصيل
  const total = subtotal + deliveryFee;

  // العناصر التي سيتم عرضها (المنتجات الفعلية فقط)
  const displayItems = actualProducts;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-10 rtl">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
        إتمام الطلب
      </h1>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* معلومات العميل */}
        <div className="w-full md:w-3/5 lg:w-2/3 order-2 md:order-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                معلومات العميل
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-gray-700 text-sm mb-1 sm:mb-2"
                    >
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="أدخل الاسم الكامل"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-gray-700 text-sm mb-1 sm:mb-2"
                    >
                      رقم الهاتف (8 أرقام)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="مثال: 99123456"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="area"
                      className="block text-gray-700 text-sm mb-1 sm:mb-2"
                    >
                      المنطقة
                    </label>
                    <input
                      type="text"
                      id="area"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="مثال: السالمية"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="block"
                      className="block text-gray-700 text-sm mb-1 sm:mb-2"
                    >
                      قطعة
                    </label>
                    <input
                      type="text"
                      id="block"
                      name="block"
                      value={formData.block}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="مثال: 10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="street"
                      className="block text-gray-700 text-sm mb-1 sm:mb-2"
                    >
                      شارع
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="مثال: شارع 5"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="house"
                      className="block text-gray-700 text-sm mb-1 sm:mb-2"
                    >
                      منزل
                    </label>
                    <input
                      type="text"
                      id="house"
                      name="house"
                      value={formData.house}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="مثال: 10"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 sm:pt-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                    طريقة الدفع
                  </h3>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center p-2 sm:p-3 border rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleChange}
                        className="ml-2 h-4 w-4 sm:h-5 sm:w-5"
                      />
                      <span className="text-sm sm:text-base">
                        الدفع عند الاستلام
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full ${
                    isSubmitting
                      ? "bg-primary-400"
                      : "bg-primary-600 hover:bg-primary-700"
                  } text-white py-2 sm:py-3 rounded-md transition-colors text-sm sm:text-base font-medium`}
                  disabled={
                    displayItems.length === 0 || loading || isSubmitting
                  }
                >
                  {isSubmitting ? "جاري تقديم الطلب..." : "إتمام الطلب"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ملخص الطلب */}
        <div className="w-full md:w-2/5 lg:w-1/3 order-1 md:order-2">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-20">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              ملخص الطلب
            </h2>

            {loading ? (
              <LoadingSpinner message="جاري تحميل المنتجات..." />
            ) : displayItems.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  سلة التسوق فارغة
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="mt-4 text-primary-600 hover:text-primary-800 font-medium text-sm sm:text-base flex items-center justify-center mx-auto"
                >
                  <ArrowLeft className="ml-1 h-4 w-4" />
                  العودة للتسوق
                </button>
              </div>
            ) : (
              <>
                <div className="max-h-60 sm:max-h-80 overflow-y-auto divide-y pr-1 -mr-1 mb-4">
                  {displayItems.map((item) => (
                    <OrderSummaryItem key={item.id} item={item} />
                  ))}
                </div>

                <div className="border-t mt-2 pt-3 space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>المجموع الفرعي:</span>
                    <span>{subtotal.toFixed(2)} دينار</span>
                  </div>

                  <div className="flex justify-between text-sm sm:text-base">
                    <span>رسوم التوصيل:</span>
                    <span>{deliveryFee.toFixed(2)} دينار</span>
                  </div>

                  <div className="flex justify-between font-semibold text-base sm:text-lg pt-2 border-t">
                    <span>الإجمالي:</span>
                    <span>{total.toFixed(2)} دينار</span>
                  </div>
                </div>
              </>
            )}

            {/* شريط معلومات الأمان */}
            <div className="mt-5 pt-3 border-t">
              <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 ml-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>جميع المعاملات آمنة ومشفرة</span>
              </div>
            </div>
          </div>

          {/* زر العودة للتسوق - يظهر فقط في الشاشات الكبيرة */}
          {!loading && (
            <div className="mt-4 text-center hidden md:block">
              <button
                onClick={() => router.push("/")}
                className="text-primary-600 hover:text-primary-800 font-medium text-sm sm:text-base flex items-center justify-center mx-auto"
              >
                <ArrowLeft className="ml-1 h-4 w-4" />
                العودة للتسوق
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

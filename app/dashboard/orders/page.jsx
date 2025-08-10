"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "../../../lib/supabaseClient";
import CustomToaster from "../products/components/CustomToaster";
import { formatDateTime } from "../products/components/FormattedDate";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateOrderId, setStatusUpdateOrderId] = useState(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [customerFormData, setCustomerFormData] = useState({
    name: "",
    phone: "",
    area: "",
    plot: "",
    street: "",
    house: "",
  });
  const [viewingImageProduct, setViewingImageProduct] = useState(null);
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseClient();

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          customers(*),
          order_items(
            *,
            products(*)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading orders:", error);
        setToast({
          type: "error",
          message: "حدث خطأ أثناء تحميل الطلبات: " + error.message,
        });
        return;
      }

      console.log("Raw orders response:", JSON.stringify(data, null, 2));
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      setToast({
        type: "error",
        message: "حدث خطأ أثناء تحميل الطلبات",
      });
    } finally {
      setLoading(false);
    }
  };
  const toggleProductImage = (productId, event) => {
    event.stopPropagation(); // منع انتشار الحدث للعناصر الأب
    if (viewingImageProduct === productId) {
      setViewingImageProduct(null);
    } else {
      setViewingImageProduct(productId);
    }
  };
  const updateOrderShippingStatus = async (orderId, isShipped) => {
    setUpdatingStatus(true);
    setStatusUpdateOrderId(orderId);

    try {
      const supabase = createSupabaseClient();

      // إذا تم إلغاء الشحن، يجب أيضًا إلغاء التوصيل
      const updateData = !isShipped
        ? { is_shipped: false, is_delivered: false }
        : { is_shipped: true };

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) {
        if (
          error.message &&
          error.message.includes("Could not find the 'is_shipped' column")
        ) {
          setToast({
            type: "error",
            message:
              'يجب إضافة عمود "is_shipped" إلى جدول الطلبات في قاعدة البيانات أولاً',
          });
          console.error("Database schema error:", error);
          return;
        }
        throw error;
      }

      // تحديث البيانات محلياً
      setOrders(
        orders.map((order) => {
          if (order.id === orderId) {
            if (!isShipped) {
              return { ...order, is_shipped: false, is_delivered: false };
            } else {
              return { ...order, is_shipped: true };
            }
          }
          return order;
        })
      );

      setToast({
        type: "success",
        message: isShipped
          ? "تم تحديث حالة الطلب: تم الشحن"
          : "تم تحديث حالة الطلب: لم يتم الشحن",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      setToast({
        type: "error",
        message: "حدث خطأ أثناء تحديث حالة الطلب",
      });
    } finally {
      setUpdatingStatus(false);
      setStatusUpdateOrderId(null);
    }
  };

  const updateOrderDeliveryStatus = async (orderId, isDelivered) => {
    setUpdatingStatus(true);
    setStatusUpdateOrderId(orderId);

    try {
      const supabase = createSupabaseClient();

      // إذا تم تحديد "تم التوصيل"، نتأكد أيضاً من تحديث حالة الشحن
      const updateData = isDelivered
        ? { is_delivered: true, is_shipped: true }
        : { is_delivered: false };

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) {
        if (
          error.message &&
          error.message.includes("Could not find the 'is_delivered' column")
        ) {
          setToast({
            type: "error",
            message:
              'يجب إضافة عمود "is_delivered" إلى جدول الطلبات في قاعدة البيانات أولاً',
          });
          console.error("Database schema error:", error);
          return;
        }
        throw error;
      }

      // تحديث البيانات محلياً
      setOrders(
        orders.map((order) => {
          if (order.id === orderId) {
            if (isDelivered) {
              return { ...order, is_delivered: true, is_shipped: true };
            } else {
              return { ...order, is_delivered: false };
            }
          }
          return order;
        })
      );

      setToast({
        type: "success",
        message: isDelivered
          ? "تم تحديث حالة الطلب: تم التوصيل"
          : "تم تحديث حالة الطلب: لم يتم التوصيل",
      });
    } catch (error) {
      console.error("Error updating delivery status:", error);
      setToast({
        type: "error",
        message: "حدث خطأ أثناء تحديث حالة التوصيل",
      });
    } finally {
      setUpdatingStatus(false);
      setStatusUpdateOrderId(null);
    }
  };

  const openDeleteConfirmation = (orderId) => {
    setOrderToDelete(orderId);
  };

  const deleteOrder = async (orderId) => {
    try {
      setIsDeletingOrder(true);
      const supabase = createSupabaseClient();

      // حذف العناصر المرتبطة بالطلب أولاً (order_items)
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", orderId);

      if (itemsError) {
        console.error("Error deleting order items:", itemsError);
        throw itemsError;
      }

      // ثم حذف الطلب نفسه
      const { error: orderError } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (orderError) {
        console.error("Error deleting order:", orderError);
        throw orderError;
      }

      // تحديث القائمة محلياً بإزالة الطلب المحذوف
      setOrders(orders.filter((order) => order.id !== orderId));

      setToast({
        type: "success",
        message: "تم حذف الطلب بنجاح",
      });
    } catch (error) {
      console.error("Error in delete operation:", error);
      setToast({
        type: "error",
        message: "حدث خطأ أثناء حذف الطلب",
      });
    } finally {
      setIsDeletingOrder(false);
      setOrderToDelete(null);
    }
  };

  const toggleOrderDetails = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const calculateOrderTotal = (orderItems) => {
    return orderItems
      .reduce((total, item) => {
        return total + item.quantity * item.products.price;
      }, 0)
      .toFixed(2);
  };

  const formatAddress = (customer) => {
    if (!customer) {
      console.warn("Customer data is missing");
      return "غير متوفر";
    }

    if (customer.address) {
      return customer.address;
    }

    const addressParts = [];
    if (customer.area) addressParts.push(customer.area);
    if (customer.plot) addressParts.push(`قطعة ${customer.plot}`);
    if (customer.street) addressParts.push(`شارع ${customer.street}`);
    if (customer.house) addressParts.push(`منزل ${customer.house}`);

    return addressParts.length > 0 ? addressParts.join(" - ") : "غير متوفر";
  };

  const handleAddCustomerToOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setIsAddingCustomer(true);
    setCustomerFormData({
      name: "",
      phone: "",
      area: "",
      plot: "",
      street: "",
      house: "",
    });
  };

  const handleCustomerFormChange = (e) => {
    const { name, value } = e.target;
    setCustomerFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveCustomerForOrder = async () => {
    try {
      const supabase = createSupabaseClient();

      const addressParts = [];
      if (customerFormData.area) addressParts.push(customerFormData.area);
      if (customerFormData.plot)
        addressParts.push(`قطعة ${customerFormData.plot}`);
      if (customerFormData.street)
        addressParts.push(`شارع ${customerFormData.street}`);
      if (customerFormData.house)
        addressParts.push(`منزل ${customerFormData.house}`);

      const fullAddress =
        addressParts.length > 0 ? addressParts.join(" - ") : "";

      const customerDataWithAddress = {
        ...customerFormData,
        address: fullAddress,
      };

      console.log(
        "Saving customer data with address:",
        customerDataWithAddress
      );

      const { data: newCustomer, error: createCustomerError } = await supabase
        .from("customers")
        .insert(customerDataWithAddress)
        .select("id")
        .single();

      if (createCustomerError) {
        console.error("Error creating customer:", createCustomerError);
        throw createCustomerError;
      }

      console.log("New customer created with ID:", newCustomer.id);

      const { error: updateOrderError } = await supabase
        .from("orders")
        .update({ customer_id: newCustomer.id })
        .eq("id", selectedOrderId);

      if (updateOrderError) {
        console.error("Error updating order:", updateOrderError);
        throw updateOrderError;
      }

      console.log(
        "Order updated successfully with customer_id:",
        newCustomer.id
      );

      setIsAddingCustomer(false);
      setSelectedOrderId(null);
      setToast({
        type: "success",
        message: "تم إضافة بيانات العميل بنجاح",
      });

      await loadOrders();
    } catch (error) {
      console.error("Error saving customer data:", error);
      setToast({
        type: "error",
        message: "حدث خطأ أثناء حفظ بيانات العميل",
      });
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
        إدارة الطلبات
      </h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow p-4 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
          <p className="text-gray-500 text-sm sm:text-base">
            لا توجد طلبات بعد.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div
                className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="mb-2 sm:mb-0">
                    <div className="flex items-center">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">
                        طلب #{order.id}
                      </h3>
                      <div className="mr-2">
                        {order.is_delivered === true ? (
                          <span className="text-xs inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                            تم التوصيل
                          </span>
                        ) : order.is_shipped === true ? (
                          <span className="text-xs inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            تم الشحن
                          </span>
                        ) : (
                          <span className="text-xs inline-flex items-center px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                            جديد
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {formatDateTime(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-normal">
                    <span className="flex-grow sm:flex-grow-0 text-base sm:text-lg font-bold text-gray-900 ml-2">
                      {calculateOrderTotal(order.order_items)} دينار
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        expandedOrderId === order.id
                          ? "transform rotate-180"
                          : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {expandedOrderId === order.id && (
                <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                      بيانات العميل
                    </h4>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      {order.customers ? (
                        <>
                          <p className="text-xs sm:text-sm">
                            <span className="font-medium">الاسم:</span>{" "}
                            {order.customers.name || "غير متوفر"}
                          </p>
                          <p className="text-xs sm:text-sm">
                            <span className="font-medium">رقم الهاتف:</span>{" "}
                            {order.customers.phone || "غير متوفر"}
                          </p>
                          <p className="text-xs sm:text-sm">
                            <span className="font-medium">العنوان:</span>{" "}
                            {formatAddress(order.customers)}
                          </p>
                          {process.env.NODE_ENV === "development" && (
                            <details className="mt-2 text-xs text-gray-500">
                              <summary>بيانات تفصيلية (للتطوير فقط)</summary>
                              <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto text-xs">
                                {JSON.stringify(order.customers, null, 2)}
                              </pre>
                            </details>
                          )}
                        </>
                      ) : (
                        <p className="text-xs sm:text-sm text-yellow-600">
                          هذا الطلب لا يحتوي على بيانات العميل.
                          <button
                            className="mr-2 text-blue-600 underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddCustomerToOrder(order.id);
                            }}
                          >
                            إضافة بيانات العميل
                          </button>
                        </p>
                      )}
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                    تفاصيل الطلب
                  </h4>

                  {/* جدول لعرض التفاصيل للشاشات المتوسطة والكبيرة */}
                  <div className="bg-white rounded border border-gray-200 overflow-hidden hidden sm:block">
                    <table className="min-w-full divide-y divide-gray-200">
                      {/* في عرض الجدول للشاشات المتوسطة والكبيرة */}
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-3 py-2 sm:px-4 text-right text-xs font-medium text-gray-500 uppercase"
                          >
                            المنتج
                          </th>
                          {/* إضافة عمود للصورة */}
                          <th
                            scope="col"
                            className="px-3 py-2 sm:px-4 text-center text-xs font-medium text-gray-500 uppercase"
                          >
                            الصورة
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 sm:px-4 text-center text-xs font-medium text-gray-500 uppercase"
                          >
                            الكمية
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 sm:px-4 text-center text-xs font-medium text-gray-500 uppercase"
                          >
                            السعر
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 sm:px-4 text-center text-xs font-medium text-gray-500 uppercase"
                          >
                            المجموع
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {order.order_items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-3 py-2 sm:px-4 text-xs sm:text-sm text-gray-900">
                              {item.products.title}
                            </td>
                            {/* خلية عرض أيقونة الصورة */}
                            <td className="px-3 py-2 sm:px-4 text-xs sm:text-sm text-center">
                              {item.products.image_url ? (
                                <button
                                  onClick={(e) =>
                                    toggleProductImage(item.products.id, e)
                                  }
                                  className="inline-flex items-center justify-center p-1 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-100 transition-colors"
                                  title="عرض صورة المنتج"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </button>
                              ) : (
                                <span className="text-gray-400 text-xs">
                                  لا توجد صورة
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 sm:px-4 text-xs sm:text-sm text-gray-900 text-center">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-2 sm:px-4 text-xs sm:text-sm text-gray-900 text-center">
                              {item.products.price} دينار
                            </td>
                            <td className="px-3 py-2 sm:px-4 text-xs sm:text-sm text-gray-900 text-center">
                              {(item.quantity * item.products.price).toFixed(2)}{" "}
                              دينار
                            </td>
                          </tr>
                        ))}
                        {/* ... باقي الجدول */}
                      </tbody>
                    </table>
                  </div>

                  {/* عرض مناسب للموبايل */}
                  <div className="bg-white rounded border border-gray-200 overflow-hidden sm:hidden">
                    <div className="divide-y divide-gray-200">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="p-3">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center">
                              <span className="text-xs font-medium">
                                {item.products.title}
                              </span>
                              {item.products.image_url && (
                                <button
                                  onClick={(e) =>
                                    toggleProductImage(item.products.id, e)
                                  }
                                  className="mr-2 p-1 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-100 transition-colors"
                                  title="عرض صورة المنتج"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </button>
                              )}
                            </div>
                            <span className="text-xs">
                              {(item.quantity * item.products.price).toFixed(2)}{" "}
                              دينار
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>الكمية: {item.quantity}</span>
                            <span>السعر: {item.products.price} دينار</span>
                          </div>
                        </div>
                      ))}

                      <div className="p-3 bg-gray-50 flex justify-between items-center">
                        <span className="text-xs font-medium">
                          المجموع الكلي
                        </span>
                        <span className="text-xs font-bold">
                          {calculateOrderTotal(order.order_items)} دينار
                        </span>
                      </div>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                        ملاحظات
                      </h4>
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs sm:text-sm">{order.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* أزرار تحديث حالة الطلب */}
                  <div className="mt-4 flex flex-wrap justify-between">
                    {/* أزرار حالة الشحن والتوصيل (الجزء الأيمن) */}
                    <div className="flex flex-wrap gap-2">
                      {/* زر تحديث حالة الشحن */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderShippingStatus(order.id, true);
                        }}
                        disabled={updatingStatus || order.is_shipped === true}
                        className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-md ${
                          updatingStatus || order.is_shipped === true
                            ? "bg-gray-100 text-gray-400 cursor-default"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      >
                        {updatingStatus && statusUpdateOrderId === order.id
                          ? "جاري التحديث..."
                          : "تم الشحن"}
                      </button>

                      {/* زر إلغاء الشحن */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderShippingStatus(order.id, false);
                        }}
                        disabled={
                          updatingStatus ||
                          order.is_shipped !== true ||
                          order.is_delivered === true
                        }
                        className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-md ${
                          updatingStatus ||
                          order.is_shipped !== true ||
                          order.is_delivered === true
                            ? "bg-gray-100 text-gray-400 cursor-default"
                            : "bg-yellow-500 text-white hover:bg-yellow-600"
                        }`}
                      >
                        {updatingStatus && statusUpdateOrderId === order.id
                          ? "جاري التحديث..."
                          : "إلغاء الشحن"}
                      </button>

                      {/* زر تحديث حالة التوصيل */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderDeliveryStatus(order.id, true);
                        }}
                        disabled={
                          updatingStatus ||
                          order.is_delivered === true ||
                          order.is_shipped !== true
                        }
                        className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-md ${
                          updatingStatus ||
                          order.is_delivered === true ||
                          order.is_shipped !== true
                            ? "bg-gray-100 text-gray-400 cursor-default"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                      >
                        {updatingStatus && statusUpdateOrderId === order.id
                          ? "جاري التحديث..."
                          : "تم التوصيل"}
                      </button>

                      {/* زر إلغاء التوصيل */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderDeliveryStatus(order.id, false);
                        }}
                        disabled={updatingStatus || order.is_delivered !== true}
                        className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-md ${
                          updatingStatus || order.is_delivered !== true
                            ? "bg-gray-100 text-gray-400 cursor-default"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                      >
                        {updatingStatus && statusUpdateOrderId === order.id
                          ? "جاري التحديث..."
                          : "إلغاء التوصيل"}
                      </button>
                    </div>

                    {/* زر الحذف (الجزء الأيسر) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteConfirmation(order.id);
                      }}
                      className="mt-2 sm:mt-0 px-3 py-1 text-xs sm:text-sm font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
                    >
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        حذف الطلب
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* نموذج إضافة بيانات العميل */}
      {isAddingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              إضافة بيانات العميل للطلب #{selectedOrderId}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  الاسم
                </label>
                <input
                  type="text"
                  name="name"
                  value={customerFormData.name}
                  onChange={handleCustomerFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customerFormData.phone}
                  onChange={handleCustomerFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  المنطقة
                </label>
                <input
                  type="text"
                  name="area"
                  value={customerFormData.area}
                  onChange={handleCustomerFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    قطعة
                  </label>
                  <input
                    type="text"
                    name="plot"
                    value={customerFormData.plot}
                    onChange={handleCustomerFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    شارع
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={customerFormData.street}
                    onChange={handleCustomerFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    منزل
                  </label>
                  <input
                    type="text"
                    name="house"
                    value={customerFormData.house}
                    onChange={handleCustomerFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-6">
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm sm:order-1"
                onClick={() => setIsAddingCustomer(false)}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm sm:order-2"
                onClick={saveCustomerForOrder}
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تأكيد حذف الطلب */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-red-600">
              تأكيد حذف الطلب
            </h2>
            <p className="mb-6 text-sm sm:text-base">
              هل أنت متأكد من رغبتك في حذف الطلب رقم #{orderToDelete}؟
              <br />
              <span className="text-red-500 font-medium">
                هذا الإجراء لا يمكن التراجع عنه.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm sm:order-1"
                onClick={() => setOrderToDelete(null)}
                disabled={isDeletingOrder}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm sm:order-2"
                onClick={() => deleteOrder(orderToDelete)}
                disabled={isDeletingOrder}
              >
                {isDeletingOrder ? "جاري الحذف..." : "تأكيد الحذف"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <CustomToaster
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      {/* أضف هذا الكود قبل الإغلاق النهائي للكومبوننت، بعد نافذة تأكيد الحذف وقبل CustomToaster */}
      {viewingImageProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingImageProduct(null)}
        >
          <div
            className="relative bg-white rounded-lg p-2 max-w-lg max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 shadow-md"
              onClick={() => setViewingImageProduct(null)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {orders.map((order) =>
              order.order_items
                .filter((item) => item.products.id === viewingImageProduct)
                .map((item) => (
                  <div key={item.id} className="mt-4">
                    <h3 className="text-lg font-medium text-center mb-2">
                      {item.products.title}
                    </h3>
                    <div className="flex justify-center">
                      <img
                        src={item.products.image_url}
                        alt={item.products.title}
                        className="max-w-full max-h-[60vh] object-contain"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg"; // صورة بديلة في حالة حدوث خطأ
                          e.target.alt = "صورة المنتج غير متوفرة";
                        }}
                      />
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

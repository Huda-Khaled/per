import { useState } from "react";
import { createSupabaseClient } from "../../../../lib/supabaseClient";
import CustomToaster from "./CustomToaster";
import Image from "next/image";

export default function AddProductModal({ onClose, onProductAdded }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "price") {
      // إزالة أي شيء غير أرقام أو نقطة عشرية
      value = value.replace(/[^\d.]/g, "");

      // منع كتابة أكتر من نقطة عشرية
      const parts = value.split(".");
      if (parts.length > 2) {
        value = parts[0] + "." + parts[1];
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      setToast({
        type: "error",
        message: "يرجى اختيار صورة للمنتج",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createSupabaseClient();

      // Upload image to Supabase Storage
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded image
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      // Add new product to database
      const { error } = await supabase.from("products").insert([
        {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: publicUrl,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setToast({
        type: "success",
        message: "تم إضافة المنتج بنجاح",
      });

      if (onProductAdded) {
        onProductAdded();
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
      });
      setImageFile(null);
      setImagePreview("");

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error adding product:", error);
      setToast({
        type: "error",
        message: "حدث خطأ أثناء إضافة المنتج",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-6">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold">إضافة منتج جديد</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            aria-label="إغلاق"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم المنتج 
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 shadow-sm text-sm sm:text-base p-2 sm:p-3 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              وصف المنتج
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-md border border-gray-300 shadow-sm text-sm sm:text-base p-2 sm:p-3 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              required
            />
          </div>
           
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              سعر المنتج
            </label>
            <div className="relative">
              <input
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm text-sm sm:text-base p-2 sm:p-3 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
                placeholder="0.00"
                inputMode="decimal"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm sm:text-base">
                دينار
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              صورة المنتج
            </label>
            <div className="border border-dashed border-gray-300 rounded-md p-3 text-center hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-xs sm:text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:sm:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF حتى 5MB</p>
            </div>

            {imagePreview && (
              <div className="mt-3 relative h-32 sm:h-40 w-full bg-gray-100 rounded-md overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="معاينة الصورة"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{ objectFit: "contain" }}
                  className="rounded-md"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm sm:text-base order-2 sm:order-1"
              disabled={isSubmitting}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm sm:text-base order-1 sm:order-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الإضافة...
                </span>
              ) : (
                "إضافة المنتج"
              )}
            </button>
          </div>
        </form>

        {toast && (
          <CustomToaster
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
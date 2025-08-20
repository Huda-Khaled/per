"use client";
export const runtime = "nodejs";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [supabase] = useState(() =>
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  );

  // ✅ check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("✅ Session check:", session);

      if (session) {
        router.replace("/dashboard");
      }
    };

    checkSession();
  }, [router, supabase]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      console.log("✅ Login successful:", data);
      router.push("/dashboard");

      setMessage({
        type: "success",
        text: "✅ تم تسجيل الدخول بنجاح! جاري التوجيه...",
      });

      // ✅ تأخير خفيف للتوجيه بعد إظهار الرسالة
    } catch (error) {
            console.error('Error:', error);

      setMessage({
        type: "error",
        text: "❌ فشل تسجيل الدخول. تحقق من البريد وكلمة المرور.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-[90%] sm:max-w-[450px] md:max-w-[500px] bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-4 sm:mb-6">
          تسجيل الدخول للوحة التحكم
        </h1>

        {message && (
          <div
            className={`p-3 sm:p-4 mb-4 rounded-md text-sm sm:text-base ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              البريد الإلكتروني
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              dir="rtl"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              كلمة المرور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              dir="rtl"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </div>
        </form>

        <div className="mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-gray-600 text-center">
            هل تواجه مشكلة في تسجيل الدخول؟ تأكد من أن لديك حساب مسجل.
          </p>
        </div>
      </div>
    </div>
  );
}
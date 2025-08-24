import { createClient } from "@supabase/supabase-js";

// تخزين العملاء في متغيرات للتأكد من عدم إنشاء instances متعددة
let supabaseClient = null;
let supabaseAdminClient = null;

// Client عادي للاستخدام في Frontend
export function createSupabaseClient() {
  // إرجاع نفس الـ instance إذا كان موجوداً بالفعل
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

// Admin Client للاستخدام في API Routes فقط
export function createSupabaseAdmin() {
  // التأكد أننا في server-side
  if (typeof window !== "undefined") {
    throw new Error("Admin client cannot be used on client-side");
  }

  // إرجاع نفس الـ instance إذا كان موجوداً بالفعل
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase Admin environment variables");
    console.error("URL:", supabaseUrl ? "✓" : "✗");
    console.error("Service Role Key:", serviceRoleKey ? "✓" : "✗");
    throw new Error("Missing Supabase Admin environment variables");
  }

  supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseAdminClient;
}

// العميل العادي للاستخدام في Frontend - instance واحد فقط
export const supabase = createSupabaseClient();

export const runtime = "nodejs";
import { createClient } from "@supabase/supabase-js";
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables");
    throw new Error("Missing Supabase environment variables");
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}
export const supabase = createSupabaseClient();
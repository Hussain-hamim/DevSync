import { createClient } from "@supabase/supabase-js";

// Reuse the same URL from the existing supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

// For admin operations, we need service role key to bypass RLS
// If not set, fall back to anon key (but admin operations may fail due to RLS)
const adminKey =
  serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!serviceRoleKey) {
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY is not set. Admin actions may fail due to RLS restrictions."
  );
}

export const supabaseAdmin = createClient(supabaseUrl, adminKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

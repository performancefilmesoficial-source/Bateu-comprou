import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase: Chaves de API não configuradas no .env.local");
}

// Exportamos uma instância singleton para uso geral no client-side
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

"use server"

import { createClient } from "@/utils/supabase/server";

export interface Product {
  id: string;
  name: string;
  price: number;
  discount_pct: number;
  marketplace: 'amazon' | 'ml' | 'shopee';
  original_url: string;
  video_url: string;
  thumbnail_url: string;
  viral_score: number;
  sales_volume: number;
  created_at: string;
  category?: string;
}

export interface AffiliateKeys {
  amazon_tag?: string;
  shopee_key?: string;
  ml_credentials?: string;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Apple iPhone 15 Pro Max (256 GB) - Titânio Natural",
    price: 8499.00,
    discount_pct: 15,
    marketplace: 'amazon',
    original_url: "#",
    video_url: "",
    thumbnail_url: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=400",
    viral_score: 88,
    sales_volume: 342,
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Fone de Ouvido Sony WH-1000XM5 Noise Cancelling",
    price: 2199.00,
    discount_pct: 22,
    marketplace: 'ml',
    original_url: "#",
    video_url: "",
    thumbnail_url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400",
    viral_score: 72,
    sales_volume: 128,
    created_at: new Date().toISOString()
  }
];

export async function getProducts(search?: string, marketplace?: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase keys missing, using mock data');
    return MOCK_PRODUCTS;
  }

  try {
    const supabase = await createClient();
    
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (marketplace && marketplace !== 'Tudo') {
      const marketMap: Record<string, string> = {
        'Amazon': 'amazon',
        'M. Livre': 'ml',
        'Shopee': 'shopee'
      };
      query = query.eq('marketplace', marketMap[marketplace] || marketplace.toLowerCase());
    }

    const { data, error } = await query.limit(20);
    
    if (error) throw error;
    return data as Product[];
  } catch (error) {
    console.error('Erro ao buscar produtos, usando fallback:', error);
    return MOCK_PRODUCTS;
  }
}

export async function toggleFavorite(productId: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { error: 'Configuração do Supabase pendente' };

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Faça login para favoritar produtos' };

    const { data: existing } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (existing) {
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      return { favorited: false };
    } else {
      await supabase
        .from('user_favorites')
        .insert({ user_id: user.id, product_id: productId });
      return { favorited: true };
    }
  } catch (error) {
    return { error: 'Não foi possível salvar o favorito' };
  }
}

export async function getRecentProducts() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return MOCK_PRODUCTS.slice(0, 5);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data as Product[];
  } catch (error) {
    return MOCK_PRODUCTS.slice(0, 5);
  }
}

export async function getFavoritedProducts() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return MOCK_PRODUCTS;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_favorites')
      .select('products (*)')
      .eq('user_id', user.id);

    const favoritedProducts = (data as any)?.map((item: any) => item.products) || [];
    return favoritedProducts as Product[];
  } catch (error) {
    return MOCK_PRODUCTS;
  }
}

export async function getTrends() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return MOCK_PRODUCTS;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .gt('viral_score', 80)
      .order('viral_score', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data as Product[];
  } catch (error) {
    return MOCK_PRODUCTS;
  }
}

// --- AUTH ACTIONS ---

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };
  return { success: true };
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
    }
  });

  if (error) return { error: error.message };
  return { success: true, message: 'Verifique seu e-mail para confirmar o cadastro.' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function getUserSettings(): Promise<AffiliateKeys> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return {};

    const { data: profile } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single();

    return (profile?.api_keys as AffiliateKeys) || {};
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return {};
  }
}

export async function triggerScraper() {
  try {
    const scraperUrl = process.env.SCRAPER_URL || 'http://localhost:8000/scrape';
    console.log('Disparando scraper em:', scraperUrl);

    const response = await fetch(scraperUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    if (!response.ok) throw new Error('Scraper indisponível');
    return { success: true };
  } catch (error) {
    console.error('Erro ao disparar scraper:', error);
    return { error: 'Não foi possível iniciar o robô. Verifique se o serviço está rodando.' };
  }
}

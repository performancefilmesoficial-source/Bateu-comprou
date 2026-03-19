"use client";

import React, { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { VideoTracker } from "./VideoTracker";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ProductGrid() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoProduct, setVideoProduct] = useState<string | null>(null);
  const [filterStore, setFilterStore] = useState<string>("todos");

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("produtos_monitorados")
        .select("*")
        .order("encontrado_em", { ascending: false });

      if (sbError) throw sbError;
      setProducts(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar produtos:", err);
      setError("Não foi possível carregar os produtos. Verifique se as chaves do Supabase estão configuradas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = filterStore === "todos" 
    ? products 
    : products.filter(p => p.loja === filterStore);

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="animate-pulse font-medium">Buscando os melhores achados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-red-50/50 border border-red-100 rounded-3xl p-8">
        <div className="bg-red-100 p-3 rounded-full text-red-600">
          <RefreshCcw size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-red-900">Ops! Algo deu errado</h4>
          <p className="text-red-700/70 text-sm max-w-[300px]">{error}</p>
        </div>
        <button 
          onClick={fetchProducts}
          className="mt-2 px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Store Filters */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-muted/40 w-fit rounded-2xl border border-border">
        {["todos", "mercadolivre", "amazon", "shopee"].map((store) => (
          <button
            key={store}
            onClick={() => setFilterStore(store)}
            className={cn(
              "px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300",
              filterStore === store 
                ? "bg-white text-primary shadow-[0_4px_12px_rgba(0,0,0,0.05)] scale-105" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
            )}
          >
            {store === "mercadolivre" ? "ML" : store}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-muted-foreground italic">Nenhum produto encontrado nesta categoria.</p>
          <p className="text-xs text-muted-foreground/50">O robô de análise será executado em breve.</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.03,
                  ease: [0.23, 1, 0.32, 1] 
                }}
              >
                <ProductCard 
                  key={product.id}
                  image={product.imagem_url}
                  discount={`${product.desconto_pct || 0}%`}
                  oldPrice={product.preco_original?.toString() || "0"}
                  currentPrice={product.preco.toString().replace('.', ',')}
                  title={product.nome}
                  linkOriginal={product.link_original}
                  loja={product.loja}
                  onOpenVideo={(title) => setVideoProduct(title)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <VideoTracker 
        productTitle={videoProduct || ""} 
        isOpen={!!videoProduct} 
        onClose={() => setVideoProduct(null)} 
      />
    </div>
  );
}

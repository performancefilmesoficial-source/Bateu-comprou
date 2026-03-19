import React from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Search, Filter, TrendingUp, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header / Intro */}
      <section className="px-6 pt-12 pb-8 md:pt-20 md:pb-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
              <Sparkles size={14} className="animate-pulse" />
              <span>Destaques do Dia</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1]">
              Os Melhores <br /> <span className="text-primary">Achados</span> Shopee.
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-[450px]">
              Gerencie seus links de afiliado com facilidade e ganhe comissões explosivas com vídeos virais.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group flex-1 md:flex-none md:w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar produto..." 
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            <button className="p-3 bg-muted/80 border border-border rounded-xl hover:bg-muted transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Stats Summary (Mobile Friendly) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Cliques Hoje", value: "2.4k", trend: "+12%" },
            { label: "Conversão", value: "3.2%", trend: "+0.4%" },
            { label: "Vendas", value: "R$ 1.250", trend: "+18%" },
            { label: "Comissão", value: "R$ 145,20", trend: "+$22" },
          ].map((stat, i) => (
            <div key={i} className="p-4 bg-white border border-border rounded-2xl shadow-sm">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold">{stat.value}</span>
                <span className="text-[10px] text-primary font-bold">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="px-6 pb-20">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-6 w-1 bg-primary rounded-full" />
          <h3 className="font-bold text-lg">Produtos Populares</h3>
        </div>
        
        <ProductGrid />
      </section>
    </main>
  );
}

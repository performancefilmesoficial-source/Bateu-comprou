"use client";

import React, { useState } from "react";
import { 
  Trophy, 
  Flame, 
  TrendingUp, 
  Package, 
  Star, 
  Truck, 
  Tag, 
  ChevronRight,
  Filter,
  ArrowDown
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dados simulados baseados no banco Supabase
const VENDEDORES_TOP = [
  { id: 1, nome: "Oficial Store JBL", nota: 4.9, velocidade: "Rápido (24h)", loja: "Amazon", categoria: "Eletrônicos" },
  { id: 2, nome: "Xiaomi Brasil", nota: 4.8, velocidade: "Normal (3-5d)", loja: "Shopee", categoria: "Eletrônicos" },
  { id: 3, nome: "Tramontina Oficial", nota: 4.9, velocidade: "Rápido (2d)", loja: "Mercado Livre", categoria: "Cozinha" },
  { id: 4, nome: "Electrolux Home", nota: 4.7, velocidade: "Normal (7d)", loja: "Amazon", categoria: "Casa" },
];

const PRODUTOS_FOGO = [
  { id: 1, nome: "AirPods Pro 2", precoAtual: 1499, precoOriginal: 2200, queda: 32, loja: "Amazon" },
  { id: 2, nome: "Fritadeira Elétrica Mondial", precoAtual: 289, precoOriginal: 450, queda: 35, loja: "Mercado Livre" },
  { id: 3, nome: "Smart TV 55' LG OLED", precoAtual: 3800, precoOriginal: 5200, queda: 27, loja: "Amazon" },
  { id: 4, nome: "Garrafa Térmica Stanley", precoAtual: 99, precoOriginal: 199, queda: 50, loja: "Shopee" },
];

const TOP_TRENDS = [
  { id: 1, nome: "Mini Ar Condicionado Portátil", vendasSubindo: "85%", ranking: 1, loja: "Shopee" },
  { id: 2, nome: "Robô Aspirador Inteligente", vendasSubindo: "62%", ranking: 2, loja: "Amazon" },
  { id: 3, nome: "Máquina de Café Espresso", vendasSubindo: "48%", ranking: 3, loja: "Mercado Livre" },
];

const CATEGORIAS = ["Tudo", "Eletrônicos", "Casa", "Cozinha", "Smartphone", "Beleza"];

export default function RankingPage() {
  const [catAtiva, setCatAtiva] = useState("Tudo");
  const [faixaPreco, setFaixaPreco] = useState("todos");

  return (
    <main className="min-h-screen bg-[#fcfdfe] pb-24">
      {/* Header / Filtro */}
      <section className="px-6 pt-12 pb-8 md:pt-20 md:pb-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
              <Trophy size={14} className="animate-pulse" />
              <span>Inteligência de Dados</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1]">
              Ranking de <br /> <span className="text-primary">Oportunidades</span>.
            </h2>
            <p className="text-muted-foreground text-sm max-w-md">
              O que realmente está valendo a pena postar hoje, baseado em dados reais de mercado.
            </p>
          </div>

          {/* Filtros Estilo Shadcn UI */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-xl shadow-sm text-xs font-bold text-muted-foreground">
              <Filter size={14} />
              Filtrar por:
            </div>
            {/* Faixa de Preço */}
            <select 
              value={faixaPreco}
              onChange={(e) => setFaixaPreco(e.target.value)}
              className="px-4 py-2 bg-white border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
            >
              <option value="todos">Todos os Preços</option>
              <option value="50">Achadinhos até R$ 50</option>
              <option value="100">Até R$ 100</option>
              <option value="500">Até R$ 500</option>
              <option value="premium">Premium (+R$ 1000)</option>
            </select>
            {/* Categorias Horizontal */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide md:overflow-visible">
              {CATEGORIAS.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCatAtiva(cat)}
                  className={cn(
                    "whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                    catAtiva === cat 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                      : "bg-white border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tabelas de Dados */}
      <section className="px-6 grid gap-10 lg:grid-cols-2">
        
        {/* Melhores Vendedores (Tabela Interativa) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg text-primary">
                <Star size={18} fill="currentColor" />
              </div>
              <h3 className="font-bold text-xl">Melhores Vendedores</h3>
            </div>
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Global Rank</span>
          </div>

          <div className="bg-white border border-border rounded-3xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/30 text-[10px] uppercase font-black text-muted-foreground tracking-widest border-b border-border">
                  <th className="px-6 py-4">Vendedor</th>
                  <th className="px-6 py-4">Avaliação</th>
                  <th className="px-6 py-4">Entrega</th>
                  <th className="px-6 py-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {VENDEDORES_TOP.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm truncate max-w-[150px]">{v.nome}</span>
                        <span className="text-[10px] text-muted-foreground">{v.loja} • {v.categoria}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-primary font-bold text-xs">
                        <Star size={12} fill="currentColor" />
                        {v.nota}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Truck size={12} />
                        {v.velocidade}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-all">
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Produtos 'Fogo' (Maiores Quedas de Preço) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <Flame size={18} fill="currentColor" />
              </div>
              <h3 className="font-bold text-xl">Produtos &quot;Fogo&quot; 🔥</h3>
            </div>
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Últimas 12h</span>
          </div>

          <div className="bg-white border border-border rounded-3xl shadow-sm overflow-hidden text-sm">
            <div className="divide-y divide-border">
              {PRODUTOS_FOGO.map((p) => (
                <div key={p.id} className="p-6 flex items-center justify-between hover:bg-muted/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center text-primary">
                      <Tag size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm group-hover:text-primary transition-colors">{p.nome}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">🛒 {p.loja}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground line-through decoration-orange-500/30">R$ {p.precoOriginal}</p>
                      <p className="font-black text-primary">R$ {p.precoAtual}</p>
                    </div>
                    <div className="bg-orange-600 text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-lg shadow-orange-600/20">
                      -{p.queda}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Tendências (Mais Vendidos Subindo) */}
        <div className="lg:col-span-2 space-y-6 pt-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <TrendingUp size={18} />
              </div>
              <h3 className="font-bold text-xl">Top Tendências</h3>
            </div>
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Market Momentum</span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TOP_TRENDS.map((t) => (
              <div key={t.id} className="p-6 bg-white border border-border rounded-3xl hover:border-emerald-500/40 transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ArrowDown size={80} className="rotate-[-135deg]" />
                </div>
                <div className="flex flex-col h-full gap-4">
                  <div className="flex items-start justify-between">
                    <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-lg">#{t.ranking}</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-full">📈 High Velocity</span>
                  </div>
                  <div>
                    <h4 className="font-black text-lg leading-tight mb-1">{t.nome}</h4>
                    <p className="text-xs text-muted-foreground">Loja: <span className="font-bold text-foreground">{t.loja}</span></p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Subida de Vendas</p>
                      <p className="text-2xl font-black text-emerald-600">+{t.vendasSubindo}</p>
                    </div>
                    <button className="p-2 bg-muted/50 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </main>
  );
}

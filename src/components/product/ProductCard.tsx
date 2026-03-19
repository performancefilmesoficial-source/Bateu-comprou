"use client";

import React, { useState, useEffect } from "react";
import { Link, Play, CheckCircle2 } from "lucide-react";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { cn } from "@/lib/utils";
import { gerarLinkAfiliado } from "@/lib/affiliate";

interface ProductCardProps {
  image: string;
  discount: string;
  oldPrice: string;
  currentPrice: string;
  title: string;
  linkOriginal?: string;
  loja?: "mercadolivre" | "amazon" | "shopee";
  onOpenVideo?: (title: string) => void;
}

export function ProductCard({ image, discount, oldPrice, currentPrice, title, linkOriginal = "#", loja = "mercadolivre", onOpenVideo }: ProductCardProps) {
  const [legenda, setLegenda] = useState<string | null>(null);
  const [loadingIA, setLoadingIA] = useState(false);
  const [affiliateLink, setAffiliateLink] = useState<string>(linkOriginal);

  // Busca legenda gerada por IA e Link de Afiliado ao carregar o card
  useEffect(() => {
    async function fetchData() {
      setLoadingIA(true);
      try {
        // Busca link de afiliado no servidor
        const affRes = await fetch("/api/affiliate-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ link: linkOriginal }),
        });
        const affData = await affRes.json();
        if (affData.linkAfiliado) setAffiliateLink(affData.linkAfiliado);

        const res = await fetch("/api/ai-caption", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            nome: title, 
            preco: currentPrice, 
            loja,
            descontoPct: parseInt(discount) 
          }),
        });
        const data = await res.json();
        setLegenda(data.legenda);
      } catch (error) {
        console.error("Erro ao carregar dados do card:", error);
      } finally {
        setLoadingIA(false);
      }
    }
    fetchData();
  }, [title, currentPrice, loja, discount, linkOriginal]);

  const precoNumerico = parseFloat(currentPrice.replace(".", "").replace(",", "."));
  const precoOriginalNum = parseFloat(oldPrice.replace(".", "").replace(",", "."));

  return (
    <div className="group bg-white border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 shadow-sm flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted/20">
        <img 
          src={image} 
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
        {/* Discount Badge */}
        {parseInt(discount) > 0 && (
          <div className="absolute top-3 left-3 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg z-10" style={{background: '#f28b06'}}>
            {discount} OFF
          </div>
        )}
        {/* Store Logo Badge */}
        <div className={cn(
          "absolute top-3 right-3 px-3 py-1.5 rounded-xl shadow-lg z-10 flex items-center justify-center bg-white border border-border/50 transition-transform duration-300 group-hover:scale-110",
        )}>
          {loja === "mercadolivre" && (
            <img 
              src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__large_plus.png" 
              alt="ML" 
              className="h-3.5 w-auto object-contain"
            />
          )}
          {loja === "amazon" && (
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" 
              alt="Amazon" 
              className="h-3.5 w-auto object-contain pt-0.5"
            />
          )}
          {loja === "shopee" && (
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg" 
              alt="Shopee" 
              className="h-5 w-auto object-contain"
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title area with fixed height for alignment */}
        <div className="min-h-[40px] mb-2">
          <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>
        
        {/* Status */}
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600/60">
          <CheckCircle2 size={10} />
          Estoque Verificado
        </div>

        {/* Legenda IA */}
        <div className="min-h-[34px] mt-2">
          {loadingIA ? (
            <div className="h-2 w-3/4 bg-muted animate-pulse rounded-full mt-1" />
          ) : (
            <p className="text-[11px] text-muted-foreground italic leading-tight line-clamp-2">
              {legenda ? `"${legenda}"` : ""}
            </p>
          )}
        </div>

        <div className="mt-3 mb-4">
          {precoOriginalNum > precoNumerico && (
            <p className="text-[10px] text-slate-400 line-through">R$ {oldPrice}</p>
          )}          <div className="flex items-baseline gap-1">
            <span className="text-xs font-black text-primary">R$</span>
            <span className="text-2xl font-black text-primary tracking-tighter">
              {currentPrice.split(',')[0]}
              <span className="text-sm">,{currentPrice.split(',')[1]?.padEnd(2, '0') || '00'}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-2.5">
          {/* Botão Ir para Loja (Link Direto) */}
          <a 
            href={affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_8px_20px_rgb(59,130,246,0.2)] group/shop"
          >
            <Link size={14} className="group-hover/shop:rotate-12 transition-transform" />
            Ir para a Loja
          </a>

          <WhatsAppButton 
            produto={{
              nome: title,
              preco: precoNumerico,
              precoOriginal: precoOriginalNum,
              descontoPct: parseInt(discount),
              linkOriginal: affiliateLink,
              loja: loja,
              estoqueDisponivel: true,
              legendaIA: legenda
            }}
            variant="both"
          />
          
          <button 
            onClick={() => onOpenVideo?.(title)}
            className="w-full flex items-center justify-center gap-2 h-12 border border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-50 hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest group/btn"
          >
            <Play size={10} className="fill-slate-300 text-slate-300 group-hover/btn:fill-primary group-hover/btn:text-primary transition-colors" />
            Visualizar Viral
          </button>
        </div>
      </div>
    </div>
  );
}

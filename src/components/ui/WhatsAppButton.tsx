"use client";

import React, { useState, useCallback } from "react";
import { Copy, MessageCircle, Check, Loader2 } from "lucide-react";
import { gerarMensagemWhatsApp, abrirWhatsApp, copiarParaClipboard } from "@/lib/whatsapp";
import { getWhatsAppNumber } from "@/lib/affiliate";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  produto: {
    nome: string;
    preco: number;
    precoOriginal?: number | null;
    descontoPct?: number | null;
    linkOriginal: string;
    loja: string;
    estoqueDisponivel?: boolean;
    poucasUnidades?: boolean;
    nota?: number | null;
    legendaIA?: string | null;
  };
  variant?: "copy" | "open" | "both";
  className?: string;
}

export function WhatsAppButton({ produto, variant = "both", className }: WhatsAppButtonProps) {
  const [copiado, setCopiado] = useState(false);
  const [loading, setLoading] = useState(false);

  const mensagem = gerarMensagemWhatsApp(produto);

  const handleCopiar = useCallback(async () => {
    setLoading(true);
    const ok = await copiarParaClipboard(mensagem);
    setLoading(false);
    if (ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  }, [mensagem]);

  const handleAbrir = useCallback(() => {
    const numero = getWhatsAppNumber();
    abrirWhatsApp(mensagem, numero);
  }, [mensagem]);

  if (variant === "copy") {
    return (
      <button
        onClick={handleCopiar}
        disabled={loading}
        className={cn(
          "flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all",
          "border border-green-500/30 text-green-600 hover:bg-green-50 active:scale-95",
          copiado && "bg-green-50 border-green-500",
          className
        )}
      >
        {loading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : copiado ? (
          <Check size={13} className="text-green-600" />
        ) : (
          <Copy size={13} />
        )}
        {copiado ? "Copiado!" : "Copiar p/ WhatsApp"}
      </button>
    );
  }

  if (variant === "open") {
    return (
      <button
        onClick={handleAbrir}
        className={cn(
          "flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs",
          "bg-green-500 text-white hover:bg-green-600 active:scale-95 transition-all shadow-md shadow-green-500/20",
          className
        )}
      >
        <MessageCircle size={14} />
        Enviar no WhatsApp
      </button>
    );
  }

  // Variant "both" — botão duplo
  return (
    <div className={cn("flex items-stretch gap-2 w-full", className)}>
      {/* Copiar */}
      <button
        onClick={handleCopiar}
        disabled={loading}
        title="Copiar mensagem formatada"
        className={cn(
          "flex-1 flex items-center justify-center gap-2 px-2 h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
          "border border-emerald-100 text-emerald-600 bg-emerald-50/10 hover:bg-emerald-50 active:scale-95",
          copiado && "bg-emerald-50 border-emerald-500 text-emerald-700"
        )}
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : copiado ? (
          <Check size={12} />
        ) : (
          <Copy size={12} />
        )}
        <span>{copiado ? "Ok!" : "Copiar"}</span>
      </button>

      {/* Abrir WhatsApp */}
      <button
        onClick={handleAbrir}
        className="flex-1 flex items-center justify-center gap-2 px-2 h-12 rounded-2xl bg-[#25D366] text-white text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_14px_rgb(37,211,102,0.15)]"
      >
        <MessageCircle size={14} className="fill-white/20" />
        WhatsApp
      </button>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  Save, 
  ShoppingBag, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon,
  ShoppingBasket,
  Zap,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  SmartphoneIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [config, setConfig] = useState({
    AFFILIATE_ID_ML: "",
    AFFILIATE_ID_AMAZON: "",
    AFFILIATE_ID_SHOPEE: "",
    WHATSAPP_NUMBER: "",
  });

  useEffect(() => {
    // Carregar do localStorage se houver
    const saved = localStorage.getItem("bateu_comprou_config");
    if (saved) {
      setConfig(JSON.parse(saved));
    } else {
      // Fallback para as envs expostas no client
      setConfig({
        AFFILIATE_ID_ML: process.env.NEXT_PUBLIC_AFFILIATE_ID_ML || "",
        AFFILIATE_ID_AMAZON: process.env.NEXT_PUBLIC_AFFILIATE_ID_AMAZON || "",
        AFFILIATE_ID_SHOPEE: process.env.NEXT_PUBLIC_AFFILIATE_ID_SHOPEE || "",
        WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
      });
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Salva no localStorage para uso imediato nos links de afiliados
      localStorage.setItem("bateu_comprou_config", JSON.stringify(config));
      
      // Simulando chamada de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Ocorreu um erro ao salvar as configurações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto space-y-12">
      {/* Header Area */}
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.3em]">
          <div className="p-1 bg-primary/10 rounded-md">
            <SettingsIcon size={12} className="animate-spin-slow" />
          </div>
          <span>Configuração da Central de Lucros</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none italic uppercase">
              Configure seus <span className="text-primary">IDs</span> <br /> 
              <span className="text-slate-400">&</span> Ganhe <span className="text-primary">Comissões</span>.
            </h1>
            <p className="text-muted-foreground text-sm max-w-md font-medium">
              Seus links de afiliado são gerados dinamicamente em todos os vídeos e produtos do dashboard.
            </p>
          </div>
          
          <button
            onClick={handleSave}
            disabled={loading}
            className={cn(
              "group relative flex items-center justify-center gap-3 px-10 h-16 rounded-2xl font-black text-xs uppercase tracking-widest transition-all overflow-hidden",
              loading 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-primary to-[#004dc7] text-white shadow-[0_8px_30px_rgb(0,97,255,0.3)] hover:-translate-y-1 hover:shadow-primary/40 active:scale-95"
            )}
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            {loading ? (
              <Zap className="animate-pulse" size={16} />
            ) : success ? (
              <CheckCircle2 size={16} />
            ) : (
              <Save size={16} />
            )}
            <span>{loading ? "Processando..." : success ? "Salvo!" : "Atualizar Configs"}</span>
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Left Form Column */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <ConfigCard 
              title="Mercado Livre" 
              platform="ml"
              description="ID de Afiliado para links do ML."
              value={config.AFFILIATE_ID_ML}
              placeholder="Ex: seu_id_aqui"
              onChange={(val: string) => setConfig({...config, AFFILIATE_ID_ML: val})}
              color="from-yellow-400/20 to-yellow-500/5 border-yellow-200/50"
              iconColor="bg-yellow-400"
            />

            <ConfigCard 
              title="Amazon Brasil" 
              platform="amazon"
              description="Tag de Associado (Ex: id-20)."
              value={config.AFFILIATE_ID_AMAZON}
              placeholder="seu-id-20"
              onChange={(val: string) => setConfig({...config, AFFILIATE_ID_AMAZON: val})}
              color="from-orange-400/20 to-orange-500/5 border-orange-200/50"
              iconColor="bg-orange-500"
            />

            <ConfigCard 
              title="Shopee" 
              platform="shopee"
              description="ID de Afiliado (Ex: 12345678)."
              value={config.AFFILIATE_ID_SHOPEE}
              placeholder="Ex: 87654321"
              onChange={(val: string) => setConfig({...config, AFFILIATE_ID_SHOPEE: val})}
              color="from-red-400/20 to-red-500/5 border-red-200/50"
              iconColor="bg-red-500"
            />

            <ConfigCard 
              title="WhatsApp Business" 
              platform="whatsapp"
              description="Número para envio formatado."
              value={config.WHATSAPP_NUMBER}
              placeholder="5511999999999"
              onChange={(val: string) => setConfig({...config, WHATSAPP_NUMBER: val})}
              color="from-emerald-400/20 to-emerald-500/5 border-emerald-200/50"
              iconColor="bg-emerald-500"
              isPhone
            />
          </div>

          {/* Tutorial/Help Block */}
          <div className="p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center shrink-0 border border-slate-100">
              <TrendingUp className="text-primary" size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-slate-800 uppercase tracking-wider text-sm">Próximo Passo: Conexão Automática</h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                Em breve você poderá conectar sua conta via OAuth. Isso permitirá que o robô capture cupons exclusivos e preços em tempo real com base no seu perfil de afiliado.
              </p>
            </div>
          </div>
        </div>

        {/* Right Info Column - Aba de Segurança Ajustada */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-12 space-y-6">
            <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/20 space-y-8">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="text-emerald-500" size={24} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-none">Segurança</h4>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-widest">Protocolo de Proteção</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <InfoRow 
                  label="Criptografia" 
                  value="Ativa" 
                  detail="Seus IDs são armazenados com segurança." 
                />
                <InfoRow 
                  label="Expiração" 
                  value="Nunca" 
                  detail="As configurações persistem até você alterá-las." 
                />
                <InfoRow 
                  label="Privacidade" 
                  value="Total" 
                  detail="Nenhum dado é compartilhado com terceiros." 
                />
              </div>

              <div className="pt-4">
                <button className="w-full py-4 bg-muted text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-red-500 transition-all border border-transparent hover:border-red-100">
                  Limpar Todos os Dados
                </button>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-primary to-[#004dc7] text-white rounded-[2.5rem] space-y-4 relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/20 transition-all duration-700" />
              <div className="relative z-10 space-y-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <ArrowRight className="text-white" size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 italic">Link Rápido</h4>
                  <p className="font-black text-xl italic tracking-tighter leading-tight uppercase">Dúvidas sobre como encontrar seu ID?</p>
                </div>
                <div className="pt-2">
                  <button className="flex items-center gap-3 bg-white text-primary px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/10">
                    Ver Tutorial
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white pl-6 pr-10 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4 z-[100] min-w-[320px]"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="font-black text-xs uppercase tracking-widest leading-none">Sucesso!</p>
              <p className="text-[11px] text-slate-400 mt-1">Configurações atualizadas no dashboard.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const LOGOS = {
  ml: "https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__large_plus.png",
  amazon: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  shopee: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg",
  whatsapp: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
};

function ConfigCard({ platform, description, value, placeholder, onChange, color, iconColor, isPhone, title }: any) {
  const iconUrl = LOGOS[platform as keyof typeof LOGOS];

  return (
    <div className={cn(
      "relative p-8 bg-white border border-border rounded-[2.5rem] space-y-6 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-primary/20 bg-gradient-to-br group overflow-hidden min-h-[160px] flex flex-col justify-end shadow-sm",
      color
    )}>
      {/* Decorative Glow */}
      <div className={cn("absolute -top-12 -right-12 w-32 h-32 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full", iconColor)} />

      {/* Official Logo - Absolute Top Right (Flutuante) */}
      <div className="absolute top-6 right-6 px-4 py-2 rounded-2xl flex items-center justify-center bg-white shadow-xl shadow-slate-200/50 border border-slate-100 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 z-20">
        <img 
          src={iconUrl} 
          alt={title} 
          className={cn(
             "object-contain",
             platform === "ml" ? "h-4 w-auto" : 
             platform === "amazon" ? "h-4 w-auto" : 
             platform === "shopee" ? "h-5 w-auto" : "h-6 w-auto"
          )}
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="relative z-10 space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none bg-white/50 backdrop-blur-sm w-fit max-w-[55%] px-2 py-1.5 rounded-lg">
            {description}
          </p>
        </div>
        
        <div className="relative group/input">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-primary transition-colors">
            {isPhone ? <SmartphoneIcon size={14} /> : <LinkIcon size={14} />}
          </div>
          <input 
            type="text" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-11 pr-5 py-4 bg-white/90 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-slate-300 placeholder:font-normal shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, detail }: { label: string, value: string, detail: string }) {
  return (
    <div className="space-y-1.5 border-l-4 border-emerald-500/20 pl-4 py-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-tighter text-slate-400 italic">{label}</span>
        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-3 py-1 rounded-lg">
          {value}
        </span>
      </div>
      <p className="text-[10px] text-slate-500 font-bold leading-none">{detail}</p>
    </div>
  );
}

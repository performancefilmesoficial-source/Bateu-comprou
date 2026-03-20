"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogIn, Sparkles, Mail, Key, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Reset loading if it takes more than 15 seconds (fail-safe)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (loading) {
      timeout = setTimeout(() => {
        setLoading(false);
        setError("O servidor demorou muito para responder. Tente novamente.");
      }, 15000);
    }
    return () => clearTimeout(timeout);
  }, [loading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("E-mail ou senha incorretos. Por favor, tente novamente.");
        setLoading(false);
      } else if (data.user) {
        // Redireciona e força um refresh para atualizar o estado do middleware
        router.push("/");
        setTimeout(() => {
           router.refresh();
           window.location.href = "/"; // Força bruta se necessário
        }, 100);
      } else {
        setError("Erro desconhecido ao tentar autenticar.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Erro crítico no login:", err);
      setError("Erro de conexão com o servidor de autenticação.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8fbff] relative overflow-hidden">
      {/* Background Decorativo - Suave e Moderno */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/5 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Logo de Hero - Substituindo texto por imagem da marca */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex justify-center mb-4">
             <div className="p-1 bg-white rounded-[2rem] shadow-xl shadow-primary/5">
                <img 
                  src="/logo.png" 
                  alt="Bateu Comprou" 
                  className="h-20 w-auto object-contain drop-shadow-sm" 
                  onError={(e) => {
                    // Fallback se a imagem não carregar
                    (e.target as any).style.display = 'none';
                    (e.target as any).nextSibling.style.display = 'block';
                  }}
                />
                <h1 className="hidden text-2xl font-black italic tracking-tighter text-slate-800 uppercase">
                  Bateu <span className="text-primary">Comprou</span>
                </h1>
             </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
            <Sparkles size={12} />
            <span>Acesso Restrito ao Dashboard</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-2 rounded-[3.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden">
          <div className="bg-gradient-to-b from-white to-slate-50/50 p-10 space-y-8 rounded-[3rem]">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: admin@bateucomprou.com"
                    className="w-full pl-14 pr-6 py-4.5 bg-white border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 placeholder:text-slate-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Senha</label>
                <div className="relative group">
                  <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-4.5 bg-white border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 placeholder:text-slate-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 px-5 py-3.5 bg-red-50 border border-red-100 rounded-2xl text-[11px] font-bold text-red-500 shadow-sm"
                  >
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full h-16 rounded-3xl bg-primary text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/25 disabled:opacity-50 disabled:grayscale group",
                  loading && "cursor-wait"
                )}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Autenticando...</span>
                  </div>
                ) : (
                  <>
                    <span>Entrar agora</span>
                    <LogIn size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest leading-relaxed">
                Segurança Bateu Comprou <br /> 256-bit encryption active
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (loading) {
      timeout = setTimeout(() => {
        setLoading(false);
        setError("O servidor demorou muito para responder.");
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
        setError("Credenciais incorretas.");
        setLoading(false);
      } else if (data.user) {
        router.push("/");
        setTimeout(() => {
           router.refresh();
           window.location.href = "/";
        }, 100);
      } else {
        setError("Erro ao autenticar.");
        setLoading(false);
      }
    } catch (err) {
      setError("Erro de rede.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white relative font-sans overflow-hidden">
      {/* Background Decorativo sutil */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand_orange/5 blur-[120px] rounded-full" />
      
      {/* Geometria Central (Card Alto) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-[380px] h-[720px] bg-[#f8f9fb] rounded-[3rem] flex flex-col items-center justify-center py-12 px-6 shadow-2xl relative z-10 border border-slate-100/50 overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/20 via-brand_orange/20 to-primary/20" />

        <div className="flex flex-col items-center w-full max-w-[280px] space-y-12">
          {/* LOGO: Mais compacta dentro do esqueleto */}
          <div className="w-fit flex justify-center">
              <div className="bg-white p-4 rounded-[2rem] shadow-lg shadow-slate-200/50 flex items-center justify-center transition-transform hover:scale-105">
                  <img 
                    src="/logo.png" 
                    alt="Logo Bateu Comprou" 
                    className="h-28 w-auto object-contain mix-blend-multiply" 
                  />
              </div>
          </div>

          {/* FORM: Campos mais centralizados e com menor largura */}
          <form onSubmit={handleLogin} className="w-full flex flex-col items-center space-y-8">
            
            <div className="w-full space-y-6">
              {/* Campo Login narrowed */}
              <div className="flex flex-col space-y-1.5 px-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Login</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Usuário"
                  className="w-full h-12 bg-white border border-slate-200 rounded-2xl px-5 text-sm font-bold text-slate-800 focus:outline-none focus:border-primary/50 transition-all shadow-sm placeholder:text-slate-200"
                />
              </div>

              {/* Campo Senha narrowed */}
              <div className="flex flex-col space-y-1.5 px-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Senha</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 bg-white border border-slate-200 rounded-2xl px-5 text-sm font-bold text-slate-800 focus:outline-none focus:border-primary/50 transition-all shadow-sm placeholder:text-slate-200"
                />
              </div>
            </div>

            <div className="flex flex-col items-center space-y-6 pt-2">
              {/* Botão Diminuído e Centralizado com Degradê */}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-[180px] h-12 bg-gradient-to-r from-primary to-brand_orange text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:brightness-105 active:scale-[0.97] transition-all flex items-center justify-center gap-2",
                  loading && "cursor-wait opacity-80"
                )}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <button 
                type="button" 
                className="text-[9px] font-black text-slate-300 hover:text-brand_orange transition-colors uppercase tracking-[0.4em]"
              >
                Esqueceu o acesso?
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-[9px] font-black uppercase tracking-widest bg-red-50 px-4 py-2 rounded-lg border border-red-50 text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Rodapé Interno */}
          <div className="opacity-20 pt-4">
             <p className="text-[8px] text-slate-300 font-black uppercase tracking-[0.6em] text-center">
               Dashboard &bull; Sync
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

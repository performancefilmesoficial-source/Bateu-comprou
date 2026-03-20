"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Key, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Fail-safe para o estado de loading
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
        setError("E-mail ou senha incorretos.");
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
      setError("Erro de conexão.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      {/* Container Principal Baseado no Wireframe: Minimalista, Fundo Branco e Card Cinza */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[420px] bg-[#f2f4f7] rounded-[3rem] p-10 md:p-12 shadow-sm border border-slate-200/50"
      >
        <div className="space-y-10">
          {/* Logo Centralizada no Topo do Card */}
          <div className="flex justify-center">
            <img 
              src="/logo.png" 
              alt="Bateu Comprou" 
              className="h-24 w-auto object-contain drop-shadow-sm"
            />
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Campo E-mail */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Login</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu usuário ou e-mail"
                  className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-200 rounded-3xl text-sm font-bold text-slate-700 placeholder:text-slate-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Senha</label>
              <div className="relative group">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-200 rounded-3xl text-sm font-bold text-slate-700 placeholder:text-slate-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Opção Esqueceu a Senha */}
            <div className="flex justify-end pr-2">
              <button 
                type="button" 
                className="text-[10px] font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-widest"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Mensagens de Erro */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 px-5 py-3.5 bg-red-50 text-red-500 rounded-2xl text-[11px] font-bold border border-red-100"
                >
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botão de Entrar */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-16 rounded-[2rem] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:brightness-105 active:scale-95 shadow-xl shadow-primary/20",
                loading && "cursor-wait opacity-80"
              )}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <LogIn size={20} />
                </>
              )}
            </button>
          </form>

          {/* Rodapé do Card */}
          <div className="text-center">
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">
              Bateu Comprou &copy; 2026
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

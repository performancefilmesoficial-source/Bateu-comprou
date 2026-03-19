"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Lock, LogIn, Sparkles, Mail, Key } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email ou senha inválidos. Tente novamente.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#3b82f615_0%,transparent_50%)]">
      {/* Decorative Blur */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-[420px] space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-white shadow-xl shadow-primary/10 rounded-[2rem] border border-primary/10 mb-2">
            <Lock className="text-primary animate-pulse" size={32} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
              <Sparkles size={12} />
              <span>Acesso Restrito</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase italic leading-none">
              Bateu <span className="text-primary">Comprou</span>
            </h1>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white p-1 rounded-[2.8rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="p-10 space-y-8 bg-gradient-to-b from-white to-slate-50/50 rounded-[2.5rem]">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-200 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Senha</label>
                <div className="relative group">
                  <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-200 shadow-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="px-5 py-3 bg-red-50 border border-red-100 rounded-xl text-[10px] font-bold text-red-500 text-center animate-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full h-16 rounded-[1.5rem] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20 group",
                  loading && "opacity-70 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar no Dashboard</span>
                    <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                Apenas usuários autorizados. <br /> Se esqueceu a senha, peça ao administrador.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

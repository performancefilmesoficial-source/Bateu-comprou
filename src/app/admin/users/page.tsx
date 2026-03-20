"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Trash2, Mail, Lock, Loader2, ShieldCheck, MailCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SupabaseUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
      else if (data.error) setError(data.error);
    } catch (err) {
      setError("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.user) {
        setEmail("");
        setPassword("");
        fetchUsers();
        alert("Usuário criado com sucesso!");
      } else {
        setError(data.error || "Erro ao criar usuário.");
      }
    } catch (err) {
      setError("Falha na requisição.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este acesso?")) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) fetchUsers();
      else alert(data.error || "Erro ao deletar.");
    } catch (err) {
      alert("Erro ao deletar.");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <ShieldCheck className="text-primary" size={32} />
          Gestão de Usuários
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Controle quem tem acesso ao dashboard administrativo.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Formulário de Criação */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <UserPlus size={16} />
              Novo Usuário
            </h2>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full h-12 bg-primary text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="animate-spin" size={16} /> : "Criar Acesso"}
              </button>
            </form>

            <AnimatePresence>
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-2">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Usuários Ativos</h2>
              <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase">
                {users.length} Total
              </span>
            </div>

            <div className="divide-y divide-border">
              {loading ? (
                <div className="p-10 flex flex-col items-center justify-center text-slate-300 gap-3">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Carregando Master List...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-10 text-center text-slate-400 font-bold text-sm">Nenhum usuário encontrado.</div>
              ) : (
                users.map((u) => (
                  <div key={u.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <MailCheck size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-700">{u.email}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          ID: {u.id.substring(0, 8)}... &bull; Criado em {new Date(u.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      title="Excluir Usuário"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-2 text-yellow-600 bg-yellow-50 p-4 rounded-xl border border-yellow-100 italic text-[11px] font-medium leading-tight">
             <AlertCircle size={16} className="shrink-0" />
             <span>Atenção: A criação de usuários requer a <b>Service Role Key</b> configurada no servidor. Caso a lista não carregue em produção, verifique as variáveis de ambiente.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

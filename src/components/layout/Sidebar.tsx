"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Trophy, 
  Play, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Users,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Trophy, label: "Ranking & Oportunidades", href: "/ranking" },
  { icon: Play, label: "Vídeos Virais", href: "#" },
  { icon: Settings, label: "Configurações de Afiliado", href: "/settings" },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-border z-45 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8 flex flex-col items-center">
            <img 
              src="/logo.png" 
              alt="Bateu Comprou" 
              className="w-full max-w-[160px] h-auto"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors group"
                onClick={() => setIsOpen(false)}
              >
                <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 mt-auto border-t border-slate-100 space-y-4">
            <button 
              onClick={async () => {
                try {
                  const res = await fetch("http://ags8wkowgwgccswk8o8cok4o.187.77.53.227.sslip.io:8000/scrape");
                  if (res.ok) alert("🚀 Sincronização iniciada em background!");
                  else alert("❌ Erro ao iniciar sincronização.");
                } catch (e) {
                  alert("❌ Erro de conexão com o Scraper.");
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 group"
            >
              <Zap size={16} className="group-hover:animate-pulse" />
              <span>Sincronizar Agora</span>
            </button>

            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  A
                </div>
                <p className="text-sm font-bold text-slate-700">Admin User</p>
              </div>
              <button 
                onClick={async () => {
                  const { supabase } = await import("@/lib/supabaseClient");
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

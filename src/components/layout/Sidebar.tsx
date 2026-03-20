"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Trophy, 
  Play, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Zap,
  User
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
  const pathname = usePathname();
  
  // Ocultar Sidebar na página de login
  if (pathname === "/login") return null;

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
        "fixed top-0 left-0 h-full w-64 bg-white border-r border-border z-45 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Area - Hero in Sidebar */}
          <div className="p-10 flex flex-col items-center border-b border-muted/50">
            <Link href="/" onClick={() => setIsOpen(false)} className="block group">
              <img 
                src="/logo.png" 
                alt="Bateu Comprou" 
                className="w-full max-w-[140px] h-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon size={20} className={cn("transition-transform group-hover:scale-110", isActive && "scale-110")} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </Link>
            )})}
          </nav>

          {/* User Section & Footer */}
          <div className="p-4 mt-auto border-t border-muted/50 space-y-4 bg-muted/5">
            <button 
              onClick={async () => {
                try {
                  const res = await fetch("http://ags8wkowgwgccswk8o8cok4o.187.77.53.227.sslip.io:8000/scrape");
                  if (res.ok) alert("🚀 Sincronização iniciada!");
                  else alert("❌ Erro no Scraper.");
                } catch (e) {
                  alert("❌ Erro de conexão.");
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md group"
            >
              <Zap size={14} className="fill-white animate-pulse" />
              <span>Sincronizar Dados</span>
            </button>

            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/10">
                   <img src="/logo.png" alt="Brand" className="w-5 h-auto opacity-70" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-primary tracking-tighter">Bateu Comprou</span>
                  <span className="text-[9px] text-muted-foreground font-bold">Admin</span>
                </div>
              </div>
              <button 
                onClick={async () => {
                  const { createClient } = await import("@/lib/supabase/client");
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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


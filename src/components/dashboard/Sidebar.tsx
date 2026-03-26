"use client"

import { useState, useEffect } from "react"
import { LayoutDashboard, TrendingUp, Package, Send, Settings, LogOut, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "@/app/actions"
import { createClient } from "@/utils/supabase/client"
import Image from "next/image"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: TrendingUp, label: "Tendências", href: "/trends" },
  { icon: Package, label: "Meus Produtos", href: "/favorites" },
  { icon: Send, label: "Postagem Auto", href: "/automation" },
  { icon: Settings, label: "Configurações", href: "/settings" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [profile, setProfile] = useState({ full_name: "Carregando...", avatar_url: "" });
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfile({
            full_name: data.full_name || "Usuário",
            avatar_url: data.avatar_url || ""
          });
        }
      }
    }
    loadProfile();
  }, []);

  return (
    <aside className="sidebar-light" style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 1.25rem',
      zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ marginBottom: '3.5rem', padding: '0 0.5rem' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ 
            padding: '12px', 
            background: 'white', 
            borderRadius: '20px', 
            border: '1px solid var(--border-light)', 
            boxShadow: 'var(--soft-shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Image 
              src="/logo.png" 
              alt="Bateu Comprou Logo" 
              width={240} 
              height={70} 
              style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
              priority
            />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                color: isActive ? 'white' : 'var(--text-muted)',
                background: isActive ? 'var(--vibrant-orange)' : 'transparent',
                boxShadow: isActive ? '0 4px 12px rgba(255, 107, 0, 0.2)' : 'none',
                transition: 'all 0.3s ease',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <Icon size={22} />
              <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer / User */}
      <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: '#E2E8F0', 
            border: '2px solid white', 
            boxShadow: 'var(--soft-shadow)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={20} color="#94A3B8" />
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile.full_name}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Afiliado Autorizado</span>
          </div>
        </div>
        <button 
          onClick={async () => {
            await signOut();
            window.location.href = '/login';
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px',
            color: '#EF4444',
            background: 'transparent',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  )
}

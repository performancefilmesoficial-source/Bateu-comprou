"use client"

import { ShieldCheck, Database, Sliders } from "lucide-react"

export default function ConfigPanel() {
  return (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      padding: '2.5rem',
      boxShadow: 'var(--soft-shadow)',
      border: '1px solid var(--border-light)',
      height: 'fit-content',
      position: 'sticky',
      top: '2rem'
    }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Configurações</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Gerencie suas chaves e acessos.</p>
      </div>

      {/* API Stats Section */}
      <div style={{
        background: 'var(--bg-secondary)',
        padding: '1.5rem',
        borderRadius: '16px',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div style={{ 
          background: 'var(--vibrant-orange)', 
          padding: '10px', 
          borderRadius: '12px',
          color: 'white'
        }}>
          <ShieldCheck size={24} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS DA CONTA</span>
          <div style={{ fontWeight: 800, color: 'var(--success-green)' }}>Premium Ativo</div>
        </div>
      </div>

      {/* Keys Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
        <InputItem label="Amazon Associate ID" placeholder="tag-20" />
        <InputItem label="Mercado Livre Token" placeholder="APP_USR-..." />
        <InputItem label="Shopee Affiliate ID" placeholder="SHP-ID" />
        
        <button style={{
          background: 'var(--text-main)',
          color: 'white',
          padding: '14px',
          borderRadius: '12px',
          fontWeight: 700,
          marginTop: '1rem',
          fontSize: '1rem'
        }}>
          Salvar Alterações
        </button>
      </div>
    </div>
  )
}

function InputItem({ label, placeholder }: { label: string, placeholder: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{label}</label>
      <input 
        type="text" 
        placeholder={placeholder}
        style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '0.95rem',
          outline: 'none',
          color: 'var(--text-main)'
        }}
      />
    </div>
  )
}

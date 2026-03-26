"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { signIn } from '@/app/actions'
import Image from 'next/image'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result = await signIn(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '2rem'
    }}>
      <div className="card-light" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '4rem',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '3rem' }}>
          <Image 
            src="/logo.png" 
            alt="Bateu Comprou Logo" 
            width={400} 
            height={120} 
            style={{ objectFit: 'contain', margin: '0 auto', width: '100%', height: 'auto' }}
            priority
          />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Bem-vindo de volta!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Acesse sua conta para gerenciar seus achados.</p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                name="email"
                type="email" 
                placeholder="seu@email.com"
                required
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 45px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  background: '#f8f9fa',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--vibrant-blue)';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 4px rgba(0, 123, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-light)';
                  e.target.style.background = '#f8f9fa';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                name="password"
                type="password" 
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 45px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  background: '#f8f9fa',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--vibrant-blue)';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 4px rgba(0, 123, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-light)';
                  e.target.style.background = '#f8f9fa';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '2.5rem' }}>
            <Link href="#" style={{ fontSize: '0.85rem', color: 'var(--vibrant-blue)', fontWeight: 600, textDecoration: 'none' }}>Esqueceu a senha?</Link>
          </div>

          {error && (
            <div style={{ 
              padding: '12px', 
              background: '#fff5f5', 
              color: '#e53e3e', 
              borderRadius: '10px', 
              fontSize: '0.9rem', 
              marginBottom: '1.5rem',
              border: '1px solid #feb2b2',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="btn-modern" 
            style={{ 
              width: '100%', 
              padding: '18px', 
              fontSize: '1.1rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px',
              background: 'linear-gradient(135deg, var(--vibrant-orange) 0%, #E65100 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 10px 20px -5px rgba(255, 107, 0, 0.4)'
            }}
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : (
              <>Entrar na Conta <ArrowRight size={24} /></>
            )}
          </button>
        </form>

        <p style={{ marginTop: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 700 }}>
          Ambiente Restrito para Afiliados
        </p>
      </div>
    </div>
  )
}

"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona para o login pois o cadastro público está desabilitado
    router.replace('/login')
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f9fa'
    }}>
      <p style={{ color: 'var(--text-muted)' }}>Redirecionando...</p>
    </div>
  )
}

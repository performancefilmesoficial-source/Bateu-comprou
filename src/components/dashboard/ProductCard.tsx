"use client"

import { useState } from "react"
import { Heart, Copy, MessageCircle, Download, Zap, Loader2, FileText, X } from "lucide-react"
import MarketplaceLogo from "./MarketplaceLogo"
import { toggleFavorite, AffiliateKeys } from "@/app/actions"
import { buildAffiliateLink } from "@/utils/affiliate"

interface ProductCardProps {
  id: string
  name: string
  price: number | string
  marketplace: 'amazon' | 'ml' | 'shopee'
  viralScore?: number
  imageUrl: string
  discount?: number
  videoUrl?: string
  originalUrl?: string
  apiKeys?: AffiliateKeys
}

export default function ProductCard({ id, name, price, marketplace, viralScore, imageUrl, discount, videoUrl, originalUrl, apiKeys }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [showCaptionModal, setShowCaptionModal] = useState(false)
  const [caption, setCaption] = useState("")

  const affiliateLink = buildAffiliateLink(originalUrl || "#", marketplace, apiKeys || {})

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await toggleFavorite(id)
      setIsFavorited(!isFavorited)
    } catch (error) {
      console.error("Erro ao favoritar:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateLink)
    alert("Link de Afiliado copiado! 🎉")
  }

  const handleWhatsApp = () => {
    const text = `🔥 Olha esse achado que vi no Bateu Comprou!\n\n📦 ${name}\n💰 Por apenas R$ ${price}\n\nConfira aqui: ${affiliateLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  const handleDownload = async () => {
    if (!videoUrl) return alert("Vídeo não disponível para este produto.")
    
    setDownloading(true)
    try {
      const response = await fetch(videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `video-bateu-comprou-${id}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Erro no download:", error)
      alert("Erro ao baixar o vídeo.")
    } finally {
      setDownloading(false)
    }
  }

  const generateCaption = () => {
    const templates = [
      `Gente, olha que incrível esse(a) ${name}! 😍\n\nPor apenas R$ ${price} 💸\n\nComenta "EU QUERO" que mando o link! 👇\n\nOu compre agora: ${affiliateLink}`,
      `🔥 ACHADINHO DO DIA! 🔥\n\n${name}\nDe R$ XXX por apenas R$ ${price} 😱\n\nCorre que o estoque acaba rápido! 🛒\n\nLink no comentário fixado ou aqui: ${affiliateLink}`,
      `Você precisa ver isso! 🤩 ${name} em oferta imperdível.\n\nAproveite agora por R$ ${price} no Bateu Comprou! 🚀\n\nLink: ${affiliateLink}`
    ]
    setCaption(templates[Math.floor(Math.random() * templates.length)])
    setShowCaptionModal(true)
  }

  return (
    <div className="card-light" style={{ 
      position: 'relative', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Product Image & Overlays */}
      <div style={{ position: 'relative', height: '240px', background: '#f8f9fa' }}>
        <img 
          src={imageUrl} 
          alt={name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        
        {/* Marketplace Overlay (Top Right) */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          padding: '8px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <MarketplaceLogo type={marketplace} size={20} />
        </div>

        {/* Viral Score (Bottom Left) */}
        {viralScore && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'linear-gradient(135deg, #FF6B00 0%, #FF8A00 100%)',
            color: 'white',
            padding: '5px 12px',
            borderRadius: '10px',
            fontSize: '0.75rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 15px rgba(255, 107, 0, 0.4)',
            zIndex: 2
          }}>
            <Zap size={14} fill="white" /> {viralScore}% VIRAL
          </div>
        )}

        {/* Favorite Button (Top Left) */}
        <button 
          onClick={handleFavorite}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'white',
            border: 'none',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isFavorited ? '#EF4444' : '#64748B',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            zIndex: 2
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Heart size={20} fill={isFavorited ? "#EF4444" : "none"} />}
        </button>
      </div>

      {/* Product Content */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ 
          fontSize: '1.15rem', 
          fontWeight: 700, 
          marginBottom: '0.75rem', 
          lineHeight: '1.4', 
          height: '3.2rem', 
          overflow: 'hidden', 
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical',
          color: 'var(--text-main)'
        }}>
          {name}
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--vibrant-orange)' }}>
            R$ {typeof price === 'number' ? price.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : price}
          </span>
          {discount && (
            <span style={{ fontSize: '0.95rem', color: 'var(--success-green)', fontWeight: 800, background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
              -{discount}% OFF
            </span>
          )}
        </div>

        {/* Modern Buttons Stack */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button onClick={copyToClipboard} className="btn-modern btn-copy" style={{ padding: '10px' }}>
              <Copy size={18} /> Link
            </button>
            <button onClick={handleWhatsApp} className="btn-modern btn-whatsapp" style={{ padding: '10px' }}>
              <MessageCircle size={18} /> Zap
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button 
              onClick={handleDownload} 
              disabled={downloading}
              className="btn-modern btn-download" 
              style={{ 
                background: 'linear-gradient(135deg, #FFB800 0%, #FF9100 100%)',
                color: 'var(--text-main)',
                padding: '10px'
              }}
            >
              {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
              {downloading ? "Baixando" : "Vídeo"}
            </button>
            <button 
              onClick={generateCaption}
              className="btn-modern" 
              style={{ 
                background: 'var(--vibrant-blue)',
                color: 'white',
                padding: '10px'
              }}
            >
              <FileText size={18} /> Legenda
            </button>
          </div>
        </div>
      </div>

      {/* Caption Modal */}
      {showCaptionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div className="card-light" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setShowCaptionModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <X size={24} color="var(--text-muted)" />
            </button>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Sua Legenda Viral</h3>
            <textarea 
              rows={8}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '1rem', 
                borderRadius: '12px', 
                border: '1px solid var(--border-light)', 
                fontSize: '1rem',
                marginBottom: '1.5rem',
                fontFamily: 'inherit'
              }}
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(caption)
                alert("Legenda copiada! ✨")
              }}
              className="btn-modern btn-copy"
              style={{ width: '100%' }}
            >
              <Copy size={20} /> Copiar Legenda
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

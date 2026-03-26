"use client"

interface MarketplaceLogoProps {
  type: 'amazon' | 'ml' | 'shopee';
  size?: number;
}

export default function MarketplaceLogo({ type, size = 20 }: MarketplaceLogoProps) {
  const logos = {
    amazon: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    ml: "https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__small@2x.png",
    shopee: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg"
  }

  if (type === 'ml') {
    return (
      <img 
        src={logos.ml} 
        alt="Mercado Livre" 
        style={{ height: `${size}px`, objectFit: 'contain' }} 
      />
    )
  }

  return (
    <img 
      src={logos[type]} 
      alt={type} 
      style={{ height: `${size}px`, objectFit: 'contain' }} 
    />
  )
}

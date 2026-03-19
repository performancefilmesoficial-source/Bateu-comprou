/**
 * lib/affiliate.ts
 * Conversor de links de afiliado para Mercado Livre, Amazon e Shopee.
 * Detecta automaticamente a loja pelo domínio e injeta o ID correto.
 */

export type Loja = "mercadolivre" | "amazon" | "shopee" | "desconhecida";

interface AfiliateResult {
  linkAfiliado: string;
  loja: Loja;
  idUsado: string | null;
}

/**
 * Detecta a loja a partir do domínio da URL.
 */
export function detectarLoja(url: string): Loja {
  try {
    const { hostname } = new URL(url);
    if (hostname.includes("mercadolivre") || hostname.includes("mercadolibre") || hostname.includes("mlstatic")) return "mercadolivre";
    if (hostname.includes("amazon")) return "amazon";
    if (hostname.includes("shopee")) return "shopee";
    return "desconhecida";
  } catch {
    return "desconhecida";
  }
}

/**
 * Auxiliar para buscar configuração salva no navegador ou fallback para .env
 */
function getConfig(key: string, envFallback: string): string {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("bateu_comprou_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed[key] || envFallback;
      }
    } catch (e) {
      console.error("Erro ao ler config local:", e);
    }
  }
  return envFallback;
}

/**
 * Converte um link de produto para link de afiliado.
 * Injeta o ID de afiliado correto com base na loja detectada.
 */
export function converterParaAfiliado(linkOriginal: string): AfiliateResult {
  const loja = detectarLoja(linkOriginal);

  try {
    const url = new URL(linkOriginal);

    switch (loja) {
      case "mercadolivre": {
        const id = getConfig("AFFILIATE_ID_ML", process.env.NEXT_PUBLIC_AFFILIATE_ID_ML || "");
        if (id) {
          // Remove parâmetros de rastreio anteriores
          url.searchParams.delete("utm_source");
          url.searchParams.delete("utm_campaign");
          url.searchParams.set("aff_id", id);
          url.searchParams.set("utm_source", "bateucomprou");
          url.searchParams.set("utm_medium", "afiliado");
        }
        return { linkAfiliado: url.toString(), loja, idUsado: id || null };
      }

      case "amazon": {
        const tag = getConfig("AFFILIATE_ID_AMAZON", process.env.NEXT_PUBLIC_AFFILIATE_ID_AMAZON || "");
        if (tag) {
          // Amazon usa o parâmetro 'tag'
          url.searchParams.set("tag", tag);
          // Remove parâmetros desnecessários
          ["linkCode", "ref_", "ref"].forEach(p => url.searchParams.delete(p));
        }
        return { linkAfiliado: url.toString(), loja, idUsado: tag || null };
      }

      case "shopee": {
        const id = getConfig("AFFILIATE_ID_SHOPEE", process.env.NEXT_PUBLIC_AFFILIATE_ID_SHOPEE || "");
        if (id) {
          // Shopee usa o formato de link de afiliado próprio
          const linkShopee = `https://s.shopee.com.br/aff?aff_id=${id}&url=${encodeURIComponent(linkOriginal)}`;
          return { linkAfiliado: linkShopee, loja, idUsado: id };
        }
        return { linkAfiliado: linkOriginal, loja, idUsado: null };
      }

      default:
        return { linkAfiliado: linkOriginal, loja, idUsado: null };
    }
  } catch {
    return { linkAfiliado: linkOriginal, loja, idUsado: null };
  }
}

/**
 * Retorna o número de WhatsApp configurado (local ou env)
 */
export function getWhatsAppNumber(): string {
  return getConfig("WHATSAPP_NUMBER", process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "");
}

/**
 * Versão simplificada — retorna apenas a URL do link de afiliado.
 */
export function gerarLinkAfiliado(linkOriginal: string): string {
  return converterParaAfiliado(linkOriginal).linkAfiliado;
}

/**
 * Utilitário para construir links de afiliado dinâmicos.
 */

export interface AffiliateKeys {
  amazon_tag?: string;
  shopee_key?: string;
  ml_credentials?: string;
}

export function buildAffiliateLink(originalUrl: string, marketplace: string, keys: AffiliateKeys): string {
  if (!originalUrl || originalUrl === "#") return originalUrl;

  try {
    const url = new URL(originalUrl);

    switch (marketplace.toLowerCase()) {
      case 'amazon':
        if (keys.amazon_tag) {
          url.searchParams.set('tag', keys.amazon_tag);
        }
        break;

      case 'shopee':
        // Shopee geralmente requer uma estrutura diferente ou parâmetro 'smtt' / 'referral'
        // Mas como padrão de link de afiliado simples, usamos o que o usuário tem
        if (keys.shopee_key) {
           // Exemplo: shopee.com.br/product-slug?universal_link_param=...
           // Aqui apenas garantimos que o ID esteja presente se a URL permitir
           url.searchParams.set('referral', keys.shopee_key);
        }
        break;

      case 'ml':
      case 'mercadolivre':
        if (keys.ml_credentials) {
          // Links do ML geralmente usam um parâmetro de afiliado ou redirecionamento
          url.searchParams.set('reftoken', keys.ml_credentials);
        }
        break;
    }

    return url.toString();
  } catch (e) {
    return originalUrl;
  }
}

/**
 * lib/whatsapp.ts
 * Gera mensagens formatadas para WhatsApp com emojis, preços e link de afiliado.
 */

import { gerarLinkAfiliado } from "./affiliate";

interface ProdutoWhatsApp {
  nome: string;
  preco: number;
  precoOriginal?: number | null;
  descontoPct?: number | null;
  linkOriginal: string;
  loja: string;
  estoqueDisponivel?: boolean;
  poucasUnidades?: boolean;
  nota?: number | null;
  legendaIA?: string | null;
}

const EMOJI_LOJA: Record<string, string> = {
  mercadolivre: "🛒",
  amazon: "📦",
  shopee: "🧡",
};

/**
 * Formata valor em Real Brasileiro.
 */
function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Gera o texto completo formatado para envio via WhatsApp.
 */
export function gerarMensagemWhatsApp(produto: ProdutoWhatsApp): string {
  const linkAfiliado = gerarLinkAfiliado(produto.linkOriginal);
  const eLojaEmoji = EMOJI_LOJA[produto.loja] || "🏪";

  const linhas: string[] = [];

  // Cabeçalho
  linhas.push(`🔥 *BATEU, COMPROU!* 🔥`);
  linhas.push(`${eLojaEmoji} ${produto.loja.charAt(0).toUpperCase() + produto.loja.slice(1)}`);
  linhas.push(``);

  // Nome do produto
  linhas.push(`*${produto.nome}*`);
  linhas.push(``);

  // Legenda da IA (se disponível)
  if (produto.legendaIA) {
    linhas.push(`💬 _${produto.legendaIA}_`);
    linhas.push(``);
  }

  // Preços
  if (produto.precoOriginal && produto.precoOriginal > produto.preco) {
    linhas.push(`~~De: ${formatarPreco(produto.precoOriginal)}~~`);
  }
  if (produto.descontoPct) {
    linhas.push(`💰 *Por: ${formatarPreco(produto.preco)}* (-${produto.descontoPct.toFixed(0)}% OFF)`);
  } else {
    linhas.push(`💰 *${formatarPreco(produto.preco)}*`);
  }
  linhas.push(``);

  // Avaliação
  if (produto.nota) {
    const estrelas = Math.round(produto.nota);
    linhas.push(`⭐ ${produto.nota.toFixed(1)} ${"★".repeat(estrelas)}${"☆".repeat(5 - estrelas)}`);
    linhas.push(``);
  }

  // Status do estoque
  if (!produto.estoqueDisponivel) {
    linhas.push(`❌ *Produto indisponível no momento*`);
  } else if (produto.poucasUnidades) {
    linhas.push(`⚡ *ÚLTIMAS UNIDADES! Corre!*`);
  } else {
    linhas.push(`✅ *Estoque disponível*`);
  }
  linhas.push(``);

  // Link
  linhas.push(`👉 *COMPRE AQUI:*`);
  linhas.push(linkAfiliado);
  linhas.push(``);

  // Rodapé
  linhas.push(`_Bateu, Comprou — Os melhores achados do Brasil_ 🇧🇷`);

  return linhas.join("\n");
}

/**
 * Abre o WhatsApp Web/App com a mensagem pré-preenchida.
 * Pode enviar para um número específico ou apenas abrir o compartilhamento.
 */
export function abrirWhatsApp(mensagem: string, numero?: string): void {
  const encoded = encodeURIComponent(mensagem);
  const url = numero
    ? `https://wa.me/${numero}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  window.open(url, "_blank");
}

/**
 * Copia a mensagem para a área de transferência.
 * Retorna true se copiou com sucesso.
 */
export async function copiarParaClipboard(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Fallback para browsers mais antigos
    const el = document.createElement("textarea");
    el.value = texto;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    return true;
  }
}

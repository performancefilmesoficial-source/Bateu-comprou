/**
 * API Route: /api/ai-caption
 * Gera legenda persuasiva para produto usando OpenAI GPT-4o-mini.
 * Implementa cache em memória para evitar chamadas repetidas.
 */
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Cache em memória: chave = nome do produto
const cache = new Map<string, string>();

export const dynamic = 'force-dynamic';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-placeholder-for-build",
});

export async function POST(request: NextRequest) {
  try {
    const { nome, preco, descontoPct, loja, nota } = await request.json();

    if (!nome) {
      return NextResponse.json(
        { error: "Parâmetro 'nome' é obrigatório." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY não configurada." },
        { status: 503 }
      );
    }

    // Checa cache
    const cacheKey = `${nome}-${preco}`;
    if (cache.has(cacheKey)) {
      return NextResponse.json({ legenda: cache.get(cacheKey) });
    }

    // Monta o prompt contextualizado
    const contexto = [
      nome && `Produto: "${nome}"`,
      preco && `Preço: R$ ${Number(preco).toFixed(2)}`,
      descontoPct && `Desconto: ${descontoPct}% OFF`,
      loja && `Loja: ${loja}`,
      nota && `Avaliação: ${nota} estrelas`,
    ]
      .filter(Boolean)
      .join(" | ");

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um copywriter expert em marketing de afiliados brasileiro.
Crie legendas curtíssimas (máximo 2 frases, até 120 caracteres) para produtos com:
- Gatilho de urgência ou escassez
- Linguagem casual e animada com 1 emoji relevante
- Foco no benefício principal
- Tom próximo e entusiasmado como uma amiga contando uma promoção
NÃO use " ou ' nas respostas. Responda APENAS a legenda, sem explicações.`,
        },
        {
          role: "user",
          content: `Crie uma legenda para: ${contexto}`,
        },
      ],
      max_tokens: 80,
      temperature: 0.85,
    });

    const legenda =
      completion.choices[0]?.message?.content?.trim() ??
      "Oferta imperdível! Corre que é por tempo limitado 🔥";

    // Salva no cache
    cache.set(cacheKey, legenda);

    // Limpa cache após 1h para não acumular
    setTimeout(() => cache.delete(cacheKey), 60 * 60 * 1000);

    return NextResponse.json({ legenda });
  } catch (error: unknown) {
    console.error("[ai-caption] Erro:", error);

    // Retorna legenda fallback se a API falhar
    const fallbacks = [
      "Oferta imperdível por tempo limitado! 🔥",
      "Preço que não vai durar, aproveita agora! ⚡",
      "O melhor custo-benefício do momento! 💸",
      "Achado do dia, não deixa passar! 🛒",
    ];
    const legenda = fallbacks[Math.floor(Math.random() * fallbacks.length)];

    return NextResponse.json({ legenda, fallback: true });
  }
}

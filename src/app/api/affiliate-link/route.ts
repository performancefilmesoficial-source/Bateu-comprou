/**
 * API Route: /api/affiliate-link
 * Converte um link original no link de afiliado correto.
 * Usado pelo frontend para evitar expor as chaves de afiliado.
 */
import { NextRequest, NextResponse } from "next/server";
import { converterParaAfiliado } from "@/lib/affiliate";

export async function POST(request: NextRequest) {
  try {
    const { link } = await request.json();

    if (!link || typeof link !== "string") {
      return NextResponse.json(
        { error: "Parâmetro 'link' é obrigatório." },
        { status: 400 }
      );
    }

    const result = converterParaAfiliado(link);

    return NextResponse.json({
      linkAfiliado: result.linkAfiliado,
      loja: result.loja,
      idUsado: result.idUsado,
    });
  } catch (error) {
    console.error("[affiliate-link] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao processar o link." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/realtime-search
 *
 * Uses Claude with web_search tool to fetch real-time destination data:
 * prices, climate, events, travel alerts.
 *
 * API key stays server-side. Never exposed to client.
 */

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const schema = z.object({
  destination: z.string().min(2).max(100),
  query: z.string().min(3).max(300).optional(),
});

export interface RealtimeSearchResult {
  destination: string;
  summary: string;
  dataPoints: {
    category: "precio" | "clima" | "eventos" | "alertas" | "general";
    label: string;
    value: string;
    source?: string;
  }[];
  usedWebSearch: boolean;
  searchedAt: string;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { destination, query } = parsed.data;

  const userQuery = query
    ? `${query} en ${destination}`
    : `Para viajar a ${destination} en los próximos 30 días:
1) Precios orientativos de vuelos y hoteles desde Europa
2) Clima actual y previsión
3) Eventos o festivales destacados
4) Alertas de viaje o requisitos de entrada actuales`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        },
      ],
      system: `Eres un asistente de viajes que busca información real y actualizada.
Responde SOLO con un JSON válido con esta estructura exacta (sin markdown):
{
  "summary": "resumen breve en 1-2 frases",
  "dataPoints": [
    { "category": "precio|clima|eventos|alertas|general", "label": "...", "value": "...", "source": "URL o nombre fuente (opcional)" }
  ]
}
Incluye entre 4 y 8 dataPoints concretos y verificados. No inventes datos.`,
      messages: [{ role: "user", content: userQuery }],
    });

    const usedWebSearch = response.content.some(
      (block) => block.type === "tool_use" && (block as { name: string }).name === "web_search"
    );

    const textBlock = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { text: string }).text)
      .join("");

    const cleaned = textBlock
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    let aiResult: { summary: string; dataPoints: RealtimeSearchResult["dataPoints"] };
    try {
      aiResult = JSON.parse(cleaned);
    } catch {
      aiResult = { summary: cleaned.slice(0, 300), dataPoints: [] };
    }

    const result: RealtimeSearchResult = {
      destination,
      summary: aiResult.summary,
      dataPoints: aiResult.dataPoints ?? [],
      usedWebSearch,
      searchedAt: new Date().toISOString(),
    };

    return NextResponse.json({ ok: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[realtime-search]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

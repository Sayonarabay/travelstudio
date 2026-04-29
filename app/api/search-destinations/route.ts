/**
 * GET /api/search-destinations
 *
 * Returns available destinations matching query params.
 * Real data only — no AI involvement here.
 *
 * Query params:
 *   types   comma-separated travel types e.g. "Cultural,Playa"
 *   budget  max budget in EUR
 *   days    number of days
 *   origin  IATA code
 */

import { NextRequest, NextResponse } from "next/server";
import { getDestinationsForTypes } from "@/lib/services/aggregator";
import type { ApiResponse } from "@/types";

interface DestinationSummary {
  name: string;
  city: string;
  country: string;
  matchedTypes: string[];
  estimatedPriceEur: number;
  priceIsEstimate: true; // always true at this level — exact prices need generate-trip
  heroImageQuery: string;
  tags: string[];
}

const DESTINATION_META: Record<string, Omit<DestinationSummary, "estimatedPriceEur">> = {
  Tokyo:     { name: "Tokyo", city: "Tokyo", country: "Japan", matchedTypes: ["Urbano", "Cultural", "Gastronomía"], priceIsEstimate: true, heroImageQuery: "Tokyo Japan night skyline", tags: ["Urbano", "Cultural", "Gastronomía"] },
  Bali:      { name: "Bali", city: "Bali", country: "Indonesia", matchedTypes: ["Tropical", "Wellness", "Aventura"], priceIsEstimate: true, heroImageQuery: "Bali Indonesia rice terraces temple", tags: ["Tropical", "Wellness", "Aventura"] },
  Barcelona: { name: "Barcelona", city: "Barcelona", country: "Spain", matchedTypes: ["Urbano", "Cultural", "Gastronomía"], priceIsEstimate: true, heroImageQuery: "Barcelona Spain Sagrada Familia", tags: ["Urbano", "Cultural", "Gastronomía"] },
  Lisbon:    { name: "Lisbon", city: "Lisbon", country: "Portugal", matchedTypes: ["Cultural", "Gastronomía", "Romántico"], priceIsEstimate: true, heroImageQuery: "Lisbon Portugal Alfama tram sunset", tags: ["Cultural", "Gastronomía", "Romántico"] },
  Lapland:   { name: "Lapland", city: "Rovaniemi", country: "Finland", matchedTypes: ["Aventura", "Familiar", "Naturaleza"], priceIsEstimate: true, heroImageQuery: "Lapland Finland northern lights aurora snow", tags: ["Aventura", "Familiar", "Naturaleza"] },
  Malaga:    { name: "Malaga", city: "Málaga", country: "Spain", matchedTypes: ["Playa", "Gastronomía", "Cultural"], priceIsEstimate: true, heroImageQuery: "Malaga Spain beach Mediterranean", tags: ["Playa", "Gastronomía", "Cultural"] },
};

// Very rough baseline prices per destination (flight + hotel estimate)
const BASELINE_PRICES: Record<string, number> = {
  Tokyo: 650, Bali: 600, Barcelona: 380, Lisbon: 320, Lapland: 900, Malaga: 290,
};

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<DestinationSummary[]>>> {
  const { searchParams } = new URL(req.url);
  const typesRaw = searchParams.get("types") ?? "";
  const budget = Number(searchParams.get("budget") ?? 9999);

  const types = typesRaw ? typesRaw.split(",").map((t) => t.trim()) : [];
  const matching = types.length ? getDestinationsForTypes(types) : Object.keys(DESTINATION_META);

  const results: DestinationSummary[] = matching
    .filter((name) => {
      const price = BASELINE_PRICES[name] ?? 500;
      return price <= budget;
    })
    .map((name) => ({
      ...DESTINATION_META[name],
      estimatedPriceEur: BASELINE_PRICES[name] ?? 500,
    }));

  return NextResponse.json({ ok: true, data: results });
}

/**
 * GET /api/search-destinations
 * Real data only — no AI.
 * Returns shuffled destinations matching types + budget.
 */

import { NextRequest, NextResponse } from "next/server";
const meta = { city: name, country: "", travelTypes: [] as string[] };
import type { ApiResponse } from "@/types";

interface DestinationSummary {
  name: string;
  city: string;
  country: string;
  tags: string[];
  estimatedPriceEur: number;
  priceIsEstimate: true;
  heroImageQuery: string;
}

const HERO_QUERIES: Record<string, string> = {
  Barcelona: "Barcelona Spain Sagrada Familia architecture",
  Lisbon: "Lisbon Portugal Alfama tram sunset",
  Malaga: "Malaga Spain beach Mediterranean coast",
  Porto: "Porto Portugal river bridge wine",
  Seville: "Seville Spain flamenco cathedral",
  Valencia: "Valencia Spain paella beach",
  Rome: "Rome Italy Colosseum ancient",
  Florence: "Florence Italy Duomo Tuscany",
  Naples: "Naples Italy pizza Vesuvius",
  Amalfi: "Amalfi Coast Italy cliffs sea",
  Sicily: "Sicily Italy temples sea",
  Athens: "Athens Greece Acropolis Parthenon",
  Santorini: "Santorini Greece white blue sunset",
  Mykonos: "Mykonos Greece windmills beach party",
  Crete: "Crete Greece beach mountains",
  Split: "Split Croatia old town Adriatic",
  Dubrovnik: "Dubrovnik Croatia walls sea",
  Kotor: "Kotor Montenegro bay mountains",
  Amsterdam: "Amsterdam Netherlands canals bikes",
  Prague: "Prague Czech Republic castle bridge",
  Vienna: "Vienna Austria palace music",
  Budapest: "Budapest Hungary parliament Danube",
  Krakow: "Krakow Poland old town market",
  Warsaw: "Warsaw Poland old town city",
  Berlin: "Berlin Germany Brandenburg Gate",
  Munich: "Munich Germany Oktoberfest Alps",
  Zurich: "Zurich Switzerland lake Alps",
  Copenhagen: "Copenhagen Denmark colorful Nyhavn",
  Stockholm: "Stockholm Sweden archipelago",
  Helsinki: "Helsinki Finland design cathedral",
  Lapland: "Lapland Finland northern lights aurora",
  Reykjavik: "Reykjavik Iceland northern lights geysir",
  Edinburgh: "Edinburgh Scotland castle highlands",
  London: "London UK Big Ben Thames",
  Paris: "Paris France Eiffel Tower Seine",
  Marseille: "Marseille France port calanques",
  Nice: "Nice France promenade beach Riviera",
  Tokyo: "Tokyo Japan night skyline neon",
  Kyoto: "Kyoto Japan temple cherry blossom",
  Osaka: "Osaka Japan street food castle",
  Bangkok: "Bangkok Thailand temple golden",
  ChiangMai: "Chiang Mai Thailand temple elephant jungle",
  Bali: "Bali Indonesia rice terraces temple",
  Singapore: "Singapore skyline Marina Bay night",
  HongKong: "Hong Kong skyline harbour night",
  Vietnam: "Hanoi Vietnam old quarter street",
  HoiAn: "Hoi An Vietnam lanterns river",
  Nepal: "Nepal Himalayas mountains trekking",
  SriLanka: "Sri Lanka tea mountains elephant",
  Morocco: "Marrakech Morocco medina spices",
  Zanzibar: "Zanzibar Tanzania beach turquoise",
  Dubai: "Dubai UAE skyline desert luxury",
  NewYork: "New York USA skyline Manhattan",
  Mexico: "Cancun Mexico beach Caribbean",
  Colombia: "Cartagena Colombia colonial colorful",
  CostaRica: "Costa Rica jungle waterfall wildlife",
  Tenerife: "Tenerife Spain Teide volcano beach",
  Lanzarote: "Lanzarote Spain volcanic landscape",
  Madeira: "Madeira Portugal cliffs flowers ocean",
};

const BASELINE_PRICES: Record<string, number> = {
  Barcelona:350, Lisbon:300, Malaga:260, Porto:280, Seville:290, Valencia:270,
  Rome:380, Florence:380, Naples:320, Amalfi:450, Sicily:320, Athens:340,
  Santorini:560, Mykonos:650, Crete:330, Split:330, Dubrovnik:430, Kotor:300,
  Amsterdam:400, Prague:300, Vienna:360, Budapest:280, Krakow:230, Warsaw:250,
  Berlin:330, Munich:380, Zurich:650, Copenhagen:440, Stockholm:440, Helsinki:420,
  Lapland:800, Reykjavik:750, Edinburgh:360, London:450, Paris:400, Marseille:310,
  Nice:420, Tokyo:620, Kyoto:600, Osaka:580, Bangkok:450, ChiangMai:400,
  Bali:500, Singapore:650, HongKong:600, Vietnam:520, HoiAn:500, Nepal:650,
  SriLanka:580, Morocco:320, Zanzibar:650, Dubai:750, NewYork:750, Mexico:650,
  Colombia:580, CostaRica:700, Tenerife:270, Lanzarote:250, Madeira:310,
};

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<DestinationSummary[]>>> {
  const { searchParams } = new URL(req.url);
  const typesRaw = searchParams.get("types") ?? "";
  const budget = Number(searchParams.get("budget") ?? 9999);
  const count = Number(searchParams.get("count") ?? 6);

  const types = typesRaw ? typesRaw.split(",").map((t) => t.trim()) : [];
  const names = getDestinationsForTypes(types, budget, count);

  const results: DestinationSummary[] = names.map((name) => {
    const meta = getDestinationMeta(name)!;
    return {
      name,
      city: meta.city,
      country: meta.country,
      tags: meta.travelTypes.slice(0, 3),
      estimatedPriceEur: BASELINE_PRICES[name] ?? 400,
      priceIsEstimate: true,
      heroImageQuery: HERO_QUERIES[name] ?? `${meta.city} ${meta.country} travel`,
    };
  });

  return NextResponse.json({ ok: true, data: results });
}

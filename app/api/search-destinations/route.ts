import { NextRequest, NextResponse } from "next/server";
import { getDestinationsForTypes } from "@/lib/services/aggregator";
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

const DEST_META: Record<string, { city: string; country: string; tags: string[]; price: number; query: string }> = {
  Barcelona:  { city:"Barcelona",   country:"Spain",       tags:["Urbano","Cultural","Gastronomía"],      price:350, query:"Barcelona Spain Sagrada Familia" },
  Lisbon:     { city:"Lisbon",      country:"Portugal",    tags:["Cultural","Gastronomía","Romántico"],    price:300, query:"Lisbon Portugal Alfama tram sunset" },
  Malaga:     { city:"Málaga",      country:"Spain",       tags:["Playa","Gastronomía","Cultural"],        price:260, query:"Malaga Spain beach Mediterranean" },
  Porto:      { city:"Porto",       country:"Portugal",    tags:["Cultural","Gastronomía","Romántico"],    price:280, query:"Porto Portugal river bridge wine" },
  Seville:    { city:"Sevilla",     country:"Spain",       tags:["Cultural","Gastronomía","Romántico"],    price:290, query:"Seville Spain cathedral flamenco" },
  Valencia:   { city:"Valencia",    country:"Spain",       tags:["Playa","Gastronomía","Urbano"],          price:270, query:"Valencia Spain beach paella" },
  Rome:       { city:"Roma",        country:"Italy",       tags:["Cultural","Gastronomía","Romántico"],    price:380, query:"Rome Italy Colosseum ancient" },
  Florence:   { city:"Florencia",   country:"Italy",       tags:["Cultural","Romántico","Gastronomía"],    price:380, query:"Florence Italy Duomo Tuscany" },
  Naples:     { city:"Nápoles",     country:"Italy",       tags:["Cultural","Gastronomía","Playa"],        price:320, query:"Naples Italy pizza Vesuvius" },
  Amalfi:     { city:"Costa Amalfi",country:"Italy",       tags:["Romántico","Playa","Lujo"],              price:450, query:"Amalfi Coast Italy cliffs sea" },
  Sicily:     { city:"Sicilia",     country:"Italy",       tags:["Cultural","Playa","Gastronomía"],        price:320, query:"Sicily Italy temples sea" },
  Athens:     { city:"Atenas",      country:"Greece",      tags:["Cultural","Gastronomía","Urbano"],       price:340, query:"Athens Greece Acropolis Parthenon" },
  Santorini:  { city:"Santorini",   country:"Greece",      tags:["Romántico","Playa","Lujo"],              price:560, query:"Santorini Greece white blue sunset" },
  Mykonos:    { city:"Mykonos",     country:"Greece",      tags:["Playa","Lujo","Romántico"],              price:650, query:"Mykonos Greece windmills beach" },
  Crete:      { city:"Creta",       country:"Greece",      tags:["Playa","Cultural","Aventura"],           price:330, query:"Crete Greece beach mountains" },
  Split:      { city:"Split",       country:"Croatia",     tags:["Cultural","Playa","Romántico"],          price:330, query:"Split Croatia old town Adriatic" },
  Dubrovnik:  { city:"Dubrovnik",   country:"Croatia",     tags:["Cultural","Playa","Romántico"],          price:430, query:"Dubrovnik Croatia walls sea" },
  Kotor:      { city:"Kotor",       country:"Montenegro",  tags:["Cultural","Playa","Aventura"],           price:300, query:"Kotor Montenegro bay mountains" },
  Amsterdam:  { city:"Ámsterdam",   country:"Netherlands", tags:["Urbano","Cultural","Gastronomía"],       price:400, query:"Amsterdam Netherlands canals bikes" },
  Prague:     { city:"Praga",       country:"Czech Rep.",  tags:["Cultural","Gastronomía","Romántico"],    price:300, query:"Prague Czech Republic castle bridge" },
  Vienna:     { city:"Viena",       country:"Austria",     tags:["Cultural","Gastronomía","Romántico"],    price:360, query:"Vienna Austria palace music" },
  Budapest:   { city:"Budapest",    country:"Hungary",     tags:["Cultural","Gastronomía","Romántico"],    price:280, query:"Budapest Hungary parliament Danube" },
  Krakow:     { city:"Cracovia",    country:"Poland",      tags:["Cultural","Gastronomía","Urbano"],       price:230, query:"Krakow Poland old town market" },
  Berlin:     { city:"Berlín",      country:"Germany",     tags:["Urbano","Cultural","Gastronomía"],       price:330, query:"Berlin Germany Brandenburg Gate" },
  Munich:     { city:"Múnich",      country:"Germany",     tags:["Cultural","Gastronomía","Familiar"],     price:380, query:"Munich Germany Oktoberfest Alps" },
  Copenhagen: { city:"Copenhague",  country:"Denmark",     tags:["Urbano","Cultural","Gastronomía"],       price:440, query:"Copenhagen Denmark colorful Nyhavn" },
  Stockholm:  { city:"Estocolmo",   country:"Sweden",      tags:["Urbano","Cultural","Naturaleza"],        price:440, query:"Stockholm Sweden archipelago" },
  Lapland:    { city:"Laponia",     country:"Finland",     tags:["Aventura","Naturaleza","Familiar"],      price:800, query:"Lapland Finland northern lights aurora" },
  Reykjavik:  { city:"Reikiavik",   country:"Iceland",     tags:["Aventura","Naturaleza","Romántico"],     price:750, query:"Reykjavik Iceland northern lights" },
  Edinburgh:  { city:"Edimburgo",   country:"Scotland",    tags:["Cultural","Gastronomía","Aventura"],     price:360, query:"Edinburgh Scotland castle highlands" },
  London:     { city:"Londres",     country:"UK",          tags:["Urbano","Cultural","Familiar"],          price:450, query:"London UK Big Ben Thames" },
  Paris:      { city:"París",       country:"France",      tags:["Romántico","Cultural","Lujo"],           price:400, query:"Paris France Eiffel Tower Seine" },
  Nice:       { city:"Niza",        country:"France",      tags:["Playa","Romántico","Lujo"],              price:420, query:"Nice France promenade beach Riviera" },
  Tokyo:      { city:"Tokio",       country:"Japan",       tags:["Urbano","Cultural","Gastronomía"],       price:620, query:"Tokyo Japan night skyline neon" },
  Kyoto:      { city:"Kioto",       country:"Japan",       tags:["Cultural","Romántico","Wellness"],       price:600, query:"Kyoto Japan temple cherry blossom" },
  Osaka:      { city:"Osaka",       country:"Japan",       tags:["Gastronomía","Urbano","Cultural"],       price:580, query:"Osaka Japan street food castle" },
  Bangkok:    { city:"Bangkok",     country:"Thailand",    tags:["Urbano","Cultural","Gastronomía"],       price:450, query:"Bangkok Thailand temple golden" },
  ChiangMai:  { city:"Chiang Mai",  country:"Thailand",    tags:["Cultural","Wellness","Aventura"],        price:400, query:"Chiang Mai Thailand temple elephant" },
  Bali:       { city:"Bali",        country:"Indonesia",   tags:["Tropical","Wellness","Aventura"],        price:500, query:"Bali Indonesia rice terraces temple" },
  Singapore:  { city:"Singapur",    country:"Singapore",   tags:["Urbano","Gastronomía","Lujo"],           price:650, query:"Singapore skyline Marina Bay night" },
  Vietnam:    { city:"Hanói",       country:"Vietnam",     tags:["Cultural","Aventura","Gastronomía"],     price:520, query:"Hanoi Vietnam old quarter street" },
  Morocco:    { city:"Marrakech",   country:"Morocco",     tags:["Cultural","Gastronomía","Aventura"],     price:320, query:"Marrakech Morocco medina spices" },
  Zanzibar:   { city:"Zanzíbar",    country:"Tanzania",    tags:["Tropical","Playa","Aventura"],           price:650, query:"Zanzibar Tanzania beach turquoise" },
  Dubai:      { city:"Dubái",       country:"UAE",         tags:["Lujo","Urbano","Gastronomía"],           price:750, query:"Dubai UAE skyline desert luxury" },
  NewYork:    { city:"Nueva York",  country:"USA",         tags:["Urbano","Cultural","Familiar"],          price:750, query:"New York USA skyline Manhattan" },
  Mexico:     { city:"Cancún",      country:"Mexico",      tags:["Playa","Tropical","Familiar"],           price:650, query:"Cancun Mexico beach Caribbean" },
  CostaRica:  { city:"Costa Rica",  country:"Costa Rica",  tags:["Aventura","Tropical","Naturaleza"],      price:700, query:"Costa Rica jungle waterfall wildlife" },
  Tenerife:   { city:"Tenerife",    country:"Spain",       tags:["Playa","Familiar","Naturaleza"],         price:270, query:"Tenerife Spain Teide volcano beach" },
  Lanzarote:  { city:"Lanzarote",   country:"Spain",       tags:["Playa","Aventura","Naturaleza"],         price:250, query:"Lanzarote Spain volcanic landscape" },
  Madeira:    { city:"Madeira",     country:"Portugal",    tags:["Naturaleza","Wellness","Romántico"],     price:280, query:"Madeira Portugal cliffs flowers ocean" },
};

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<DestinationSummary[]>>> {
  const { searchParams } = new URL(req.url);
  const typesRaw = searchParams.get("types") ?? "";
  const budget = Number(searchParams.get("budget") ?? 9999);
  const count = Number(searchParams.get("count") ?? 6);

  const types = typesRaw ? typesRaw.split(",").map((t) => t.trim()) : [];
  const names = getDestinationsForTypes(types, budget, count);

  const results: DestinationSummary[] = names
    .map((name) => {
      const m = DEST_META[name];
      if (!m) return null;
      return {
        name,
        city: m.city,
        country: m.country,
        tags: m.tags,
        estimatedPriceEur: m.price,
        priceIsEstimate: true as const,
        heroImageQuery: m.query,
      };
    })
    .filter(Boolean) as DestinationSummary[];

  return NextResponse.json({ ok: true, data: results });
}

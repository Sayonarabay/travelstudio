/**
 * Anthropic Trip Generation Service
 *
 * The AI layer ONLY operates on real provider data from the aggregator.
 * It ranks, formats, and personalises — it never invents prices,
 * places, or availability. If data is absent it says so explicitly.
 *
 * Anti-hallucination rules are embedded in the system prompt.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { ProviderBundle, TripSearchParams, GeneratedTrip, RawFlight, RawHotel, RawExperience } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a travel itinerary engine. Your job is to format, rank, and personalise trip data.

CRITICAL RULES — violating these is a production bug:
1. You NEVER invent prices, places, hotel names, or airline names.
2. You ONLY use data from the JSON bundle provided in the user message.
3. If a field is missing from the bundle, set it to null or "data unavailable" — never guess.
4. The priceIsEstimate field must be true if ANY price came from a source tagged "simulated".
5. Return ONLY valid JSON that matches the GeneratedTrip schema. No markdown, no prose outside JSON.

Your role: select the best flight/hotel/experiences from the bundle, write editorial copy (tagline, description, aiReasoning, tip texts), build the itinerary using real experience titles and times, and calculate honest totals.`;

export async function generateTrip(
  params: TripSearchParams,
  bundle: ProviderBundle,
  destinationName: string
): Promise<GeneratedTrip> {
  const hasSimulated = [
    ...bundle.flights,
    ...bundle.hotels,
    ...bundle.experiences,
  ].some((item) => item.source === "simulated");

  const userPrompt = buildPrompt(params, bundle, destinationName, hasSimulated);

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;

  try {
    return JSON.parse(raw) as GeneratedTrip;
  } catch {
    throw new Error(`AI returned invalid JSON: ${raw.slice(0, 200)}`);
  }
}

function buildPrompt(
  params: TripSearchParams,
  bundle: ProviderBundle,
  destination: string,
  hasSimulated: boolean
): string {
  return `Generate a trip to ${destination} based ONLY on the data below.

SEARCH PARAMS:
${JSON.stringify(params, null, 2)}

PROVIDER DATA (use only this):
${JSON.stringify(bundle, null, 2)}

HAS_SIMULATED_DATA: ${hasSimulated}
DATA_GAPS: ${bundle.dataGaps.join(", ") || "none"}

Return a single JSON object matching this TypeScript type exactly:

{
  destination: string,
  country: string,
  city: string,
  tagline: string,             // 1 punchy line, editorial tone
  description: string,         // 2-3 sentences, editorial
  categories: string[],        // from travelTypes
  heroImageUnsplashQuery: string, // e.g. "Tokyo Japan night skyline"

  totalPriceEur: number,       // sum of selected items, never invented
  priceBreakdown: { flights: number, accommodation: number, experiences: number },
  priceIsEstimate: boolean,    // true if ANY source is "simulated"

  selectedFlight: RawFlight | null,   // pick best value from bundle.flights
  selectedHotel: RawHotel | null,     // pick best fit from bundle.hotels
  recommendedExperiences: RawExperience[], // top 3 from bundle.experiences

  itinerary: Array<{
    day: number,
    title: string,
    items: Array<{
      time: string,           // e.g. "09:00"
      type: "included" | "suggested" | "transport" | "meal",
      title: string,          // MUST match a real experience title or generic activity
      description: string,
      priceEur: number | null,
      sourceId: string | null  // experience id if sourced from bundle
    }>
  }>,

  tips: Array<{ icon: string, title: string, body: string }>,  // 3 practical tips

  aiReasoning: string,         // 1-2 sentences: why this trip matches the request
  generatedAt: string          // ISO timestamp
}

If bundle.flights is empty, set selectedFlight to null and set priceIsEstimate to true.
If bundle.hotels is empty, set selectedHotel to null and set priceIsEstimate to true.
The generatedAt field must equal "${new Date().toISOString()}".`;
}

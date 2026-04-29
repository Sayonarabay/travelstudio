import Anthropic from "@anthropic-ai/sdk";
import type { ProviderBundle, TripSearchParams, GeneratedTrip } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a travel itinerary engine. Return ONLY valid JSON — no markdown, no backticks, no prose.
RULES:
1. Never invent prices, places, or hotels — use only data provided.
2. If data is missing set to null, never guess.
3. priceIsEstimate=true if any source="simulated".`;

export async function generateTrip(
  params: TripSearchParams,
  bundle: ProviderBundle,
  destinationName: string
): Promise<GeneratedTrip> {
  const hasSimulated = [...bundle.flights, ...bundle.hotels, ...bundle.experiences]
    .some((item) => item.source === "simulated");

  // Slim bundle — only essential fields to minimize token cost
  const slim = {
    flights: bundle.flights.slice(0, 2).map(f => ({
      id: f.id, airline: f.airline, stops: f.stops,
      durationMin: f.durationMinutes, price: f.priceEur, source: f.source,
      dep: f.departureAt, arr: f.arrivalAt, origin: f.origin, dest: f.destination,
    })),
    hotels: bundle.hotels.slice(0, 3).map(h => ({
      id: h.id, name: h.name, stars: h.starRating, score: h.reviewScore,
      pricePerNight: h.pricePerNightEur, amenities: h.amenities.slice(0, 4),
      city: h.city, country: h.country, source: h.source, link: h.deepLink,
    })),
    experiences: bundle.experiences.slice(0, 4).map(e => ({
      id: e.id, title: e.title, price: e.priceEur,
      hours: e.durationHours, category: e.category, source: e.source,
      desc: e.description, img: e.imageUrl, link: e.deepLink,
    })),
    gaps: bundle.dataGaps,
  };

  const userPrompt = `Trip to ${destinationName}.
budget=${params.budget}€ days=${params.days} origin=${params.origin} types=${params.travelTypes.join(",")} simulated=${hasSimulated}
DATA:${JSON.stringify(slim)}

Return JSON:
{"destination":"...","country":"...","city":"...","tagline":"...","description":"...","categories":[...],"heroImageUnsplashQuery":"...","totalPriceEur":0,"priceBreakdown":{"flights":0,"accommodation":0,"experiences":0},"priceIsEstimate":true,"selectedFlight":null,"selectedHotel":null,"recommendedExperiences":[],"itinerary":[{"day":1,"title":"...","items":[{"time":"09:00","type":"suggested","title":"...","description":"...","priceEur":null,"sourceId":null}]}],"tips":[{"icon":"🗺","title":"...","body":"..."}],"aiReasoning":"...","generatedAt":"${new Date().toISOString()}"}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

  try {
    return JSON.parse(cleaned) as GeneratedTrip;
  } catch {
    throw new Error(`AI returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }
}

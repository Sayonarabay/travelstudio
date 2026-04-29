/**
 * TripAdvisor Content API Service
 * Docs: https://tripadvisor.com/developers
 *
 * Used for experiences, attractions, and review enrichment.
 */

import { RawExperience } from "@/types";

const TA_BASE = "https://api.content.tripadvisor.com/api/v1";

interface TAAttraction {
  location_id: string;
  name: string;
  description: string;
  subcategory?: Array<{ name: string }>;
  photo?: { images?: { medium?: { url: string } } };
  web_url: string;
  price_level?: string; // "$", "$$", "$$$", "$$$$"
}

interface TASearchResponse {
  data: TAAttraction[];
}

const PRICE_MAP: Record<string, number> = {
  $: 20,
  $$: 50,
  $$$: 90,
  $$$$: 160,
};

export async function searchAttractions(
  locationQuery: string
): Promise<RawExperience[]> {
  const apiKey = process.env.TRIPADVISOR_API_KEY;

  if (!apiKey || apiKey === "your-tripadvisor-key-here") {
    console.warn("[tripadvisor] No API key — returning simulated data");
    return simulateExperiences(locationQuery);
  }

  try {
    // Step 1: get location id
    const locRes = await fetch(
      `${TA_BASE}/location/search?searchQuery=${encodeURIComponent(locationQuery)}&key=${apiKey}`,
      { next: { revalidate: 86400 } }
    );
    if (!locRes.ok) throw new Error(`TA location search ${locRes.status}`);
    const locJson = await locRes.json();
    const locationId: string | undefined = locJson.data?.[0]?.location_id;
    if (!locationId) throw new Error("No location found");

    // Step 2: get attractions
    const attRes = await fetch(
      `${TA_BASE}/location/${locationId}/attractions?key=${apiKey}&limit=6`,
      { next: { revalidate: 3600 } }
    );
    if (!attRes.ok) throw new Error(`TA attractions ${attRes.status}`);
    const attJson: TASearchResponse = await attRes.json();

    return attJson.data.slice(0, 6).map((a): RawExperience => ({
      id: `ta-${a.location_id}`,
      title: a.name,
      description: a.description ?? "Local attraction",
      durationHours: 2,
      priceEur: PRICE_MAP[a.price_level ?? "$"] ?? 30,
      category: a.subcategory?.[0]?.name ?? "Experience",
      imageUrl: a.photo?.images?.medium?.url ?? null,
      deepLink: a.web_url,
      source: "simulated", // TA content API doesn't return bookable prices
    }));
  } catch (err) {
    console.error("[tripadvisor] fetch failed:", err);
    return simulateExperiences(locationQuery);
  }
}

// ─── Simulation ───────────────────────────────────────────────────────────────

const CITY_EXPERIENCES: Record<string, Array<Omit<RawExperience, "source">>> = {
  Tokyo: [
    { id: "sim-tok-e1", title: "Ceremonia del té tradicional", description: "Auténtica ceremonia del té en un jardín zen privado.", durationHours: 2, priceEur: 55, category: "Cultural", imageUrl: "https://images.unsplash.com/photo-1563485651-7b7d3b73b30b?w=400&q=70", deepLink: "https://tripadvisor.com" },
    { id: "sim-tok-e2", title: "Tour nocturno por Shinjuku", description: "Explora la vida nocturna de Tokio con guía local bilingüe.", durationHours: 3, priceEur: 85, category: "Urban", imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=70", deepLink: "https://tripadvisor.com" },
    { id: "sim-tok-e3", title: "Clase de cocina japonesa", description: "Aprende a preparar sushi y ramen con chef profesional.", durationHours: 4, priceEur: 75, category: "Gastronomy", imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70", deepLink: "https://tripadvisor.com" },
  ],
  Bali: [
    { id: "sim-bal-e1", title: "Retiro de yoga al amanecer", description: "Sesión de yoga frente al volcán Agung.", durationHours: 2, priceEur: 25, category: "Wellness", imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=70", deepLink: "https://tripadvisor.com" },
    { id: "sim-bal-e2", title: "Snorkel en Nusa Penida", description: "Nada con mantas rayas y tortugas marinas.", durationHours: 6, priceEur: 45, category: "Adventure", imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=70", deepLink: "https://tripadvisor.com" },
    { id: "sim-bal-e3", title: "Cocina balinesa en familia", description: "Mercado local + cocina en casa familiar balinesa.", durationHours: 4, priceEur: 35, category: "Gastronomy", imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70", deepLink: "https://tripadvisor.com" },
  ],
  Barcelona: [
    { id: "sim-bcn-e1", title: "Tour Gaudí completo", description: "Sagrada Família, Casa Batlló y Casa Milà con arquitecto guía.", durationHours: 4, priceEur: 65, category: "Cultural", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&q=70", deepLink: "https://tripadvisor.com" },
    { id: "sim-bcn-e2", title: "Clase de cocina catalana", description: "Aprende pan con tomate, croquetas y crema catalana.", durationHours: 3, priceEur: 45, category: "Gastronomy", imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70", deepLink: "https://tripadvisor.com" },
    { id: "sim-bcn-e3", title: "Tour en bici por el Born", description: "Barrios medievales en bicicleta con guía local.", durationHours: 2, priceEur: 28, category: "Urban", imageUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&q=70", deepLink: "https://tripadvisor.com" },
  ],
  Lisbon: [
    { id: "sim-lis-e1", title: "Fado + cena en taberna", description: "Cena en taberna histórica con espectáculo de fado en vivo.", durationHours: 3, priceEur: 55, category: "Cultural", imageUrl: "https://images.unsplash.com/photo-1513735492246-483525079686?w=400&q=70", deepLink: "https://tripadvisor.com" },
    { id: "sim-lis-e2", title: "Tuk-tuk por Alfama", description: "Miradores secretos de Lisboa en tuk-tuk eléctrico.", durationHours: 1.5, priceEur: 30, category: "Urban", imageUrl: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&q=70", deepLink: "https://tripadvisor.com" },
    { id: "sim-lis-e3", title: "Cata de vinos del Alentejo", description: "Cinco vinos con maridaje de quesos y jamón ibérico.", durationHours: 2, priceEur: 40, category: "Gastronomy", imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=70", deepLink: "https://tripadvisor.com" },
  ],
  Lapland: [
    { id: "sim-lap-e1", title: "Safari de auroras boreales", description: "4h en moto de nieve buscando auroras con guía experto.", durationHours: 4, priceEur: 120, category: "Adventure", imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=70", deepLink: "https://tripadvisor.com" },
    { id: "sim-lap-e2", title: "Trineo de huskies", description: "Guía tu propio trineo por el bosque ártico con 6 huskies.", durationHours: 2, priceEur: 95, category: "Adventure", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70", deepLink: "https://tripadvisor.com" },
    { id: "sim-lap-e3", title: "Cena en iglú de cristal", description: "Gourmet bajo el cielo con vistas a las auroras.", durationHours: 3, priceEur: 180, category: "Luxury", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=70", deepLink: "https://tripadvisor.com" },
  ],
  Malaga: [
    { id: "sim-mal-e1", title: "Tour gastronómico Málaga", description: "Los mejores bares de tapas del centro con guía foodie.", durationHours: 3, priceEur: 45, category: "Gastronomy", imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70", deepLink: "https://tripadvisor.com" },
    { id: "sim-mal-e2", title: "Kayak en Costa del Sol", description: "Pádel surf y kayak desde La Malagueta.", durationHours: 2, priceEur: 25, category: "Sport", imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=70", deepLink: "https://tripadvisor.com" },
    { id: "sim-mal-e3", title: "Flamenco en cueva auténtica", description: "Actuación en cueva con cena flamenca incluida.", durationHours: 2.5, priceEur: 55, category: "Cultural", imageUrl: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&q=70", deepLink: "https://tripadvisor.com" },
  ],
};

function simulateExperiences(locationQuery: string): RawExperience[] {
  const key =
    Object.keys(CITY_EXPERIENCES).find((k) =>
      locationQuery.toLowerCase().includes(k.toLowerCase())
    ) ?? "Barcelona";

  return (CITY_EXPERIENCES[key] ?? CITY_EXPERIENCES.Barcelona).map((e) => ({
    ...e,
    source: "simulated" as const,
  }));
}

/**
 * Fever Event Discovery Service
 * Docs: Partner API — contact partnerships@feverup.com for access
 *
 * Used for local events, concerts, pop-ups, and unique experiences.
 * Falls back to simulation when key absent.
 */

import { RawExperience } from "@/types";

const FEVER_BASE = "https://data-search.apigw.feverup.com/api";

interface FeverEvent {
  id: string;
  title: string;
  description: string;
  categories: string[];
  price_range: { min: number; max: number; currency: string };
  duration_minutes: number;
  image_url: string | null;
  url: string;
}

interface FeverResponse {
  data: { events: FeverEvent[] };
}

export async function searchEvents(
  city: string,
  startDate: string,
  endDate: string
): Promise<RawExperience[]> {
  const apiKey = process.env.FEVER_API_KEY;

  if (!apiKey || apiKey === "your-fever-key-here") {
    console.warn("[fever] No API key — returning empty (Tripadvisor covers experiences)");
    return []; // TripAdvisor is primary; Fever augments when available
  }

  try {
    const params = new URLSearchParams({
      city,
      start_date: startDate,
      end_date: endDate,
      limit: "4",
    });

    const res = await fetch(`${FEVER_BASE}/search?${params}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Fever responded ${res.status}`);

    const json: FeverResponse = await res.json();

    return json.data.events.map((ev): RawExperience => ({
      id: `fever-${ev.id}`,
      title: ev.title,
      description: ev.description,
      durationHours: Math.round(ev.duration_minutes / 60),
      priceEur: ev.price_range.min,
      category: ev.categories[0] ?? "Event",
      imageUrl: ev.image_url,
      deepLink: ev.url,
      source: "fever",
    }));
  } catch (err) {
    console.error("[fever] fetch failed:", err);
    return [];
  }
}

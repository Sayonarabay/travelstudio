/**
 * Trivago API Service
 * Docs: https://developer.trivago.com
 *
 * Used as secondary accommodation source / price comparison.
 * Falls back to simulation when key absent.
 */

import { RawHotel } from "@/types";

const TRIVAGO_BASE = "https://api.trivago.com/v1";

interface TrivagoItem {
  item_id: string;
  name: string;
  location: { city: string; country_code: string };
  stars: number;
  rating: { overall: number };
  best_offer: { price_per_night: number; currency: string };
  images?: Array<{ url: string }>;
  booking_link: string;
}

interface TrivagoResponse {
  items: TrivagoItem[];
}

export async function searchHotelsTrivago(
  city: string,
  checkin: string,
  checkout: string
): Promise<RawHotel[]> {
  const apiKey = process.env.TRIVAGO_API_KEY;

  if (!apiKey || apiKey === "your-trivago-key-here") {
    console.warn("[trivago] No API key — skipping (Booking is primary)");
    return []; // Trivago is secondary; no simulation needed
  }

  try {
    const params = new URLSearchParams({
      location: city,
      checkin,
      checkout,
      currency: "EUR",
      limit: "3",
    });

    const res = await fetch(`${TRIVAGO_BASE}/hotels/search?${params}`, {
      headers: { "X-Api-Key": apiKey },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Trivago responded ${res.status}`);

    const json: TrivagoResponse = await res.json();

    return json.items.map((item): RawHotel => ({
      id: `trv-${item.item_id}`,
      name: item.name,
      city: item.location.city,
      country: item.location.country_code,
      starRating: item.stars,
      reviewScore: item.rating.overall,
      pricePerNightEur: item.best_offer.price_per_night,
      amenities: [],
      imageUrl: item.images?.[0]?.url ?? null,
      deepLink: item.booking_link,
      source: "trivago",
    }));
  } catch (err) {
    console.error("[trivago] fetch failed:", err);
    return [];
  }
}

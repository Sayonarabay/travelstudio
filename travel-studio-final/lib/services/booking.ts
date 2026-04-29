/**
 * Booking.com Demand API Service
 * Docs: https://developers.booking.com/demandapi/
 *
 * Falls back to clearly-labelled simulation when credentials absent.
 */

import { RawHotel } from "@/types";

const BOOKING_BASE = "https://demandapi.booking.com/3.1";

interface BookingProperty {
  id: number;
  name: string;
  city: string;
  country_code: string;
  property_class: number;
  review_score: number;
  price_breakdown: { gross_price: { value: number } };
  facilities_block?: { facilities: Array<{ name: string }> };
  main_photo_url?: string;
  url?: string;
}

interface BookingSearchResponse {
  result: BookingProperty[];
}

export async function searchHotels(
  city: string,
  checkin: string,
  checkout: string,
  adults = 2
): Promise<RawHotel[]> {
  const apiKey = process.env.BOOKING_API_KEY;
  const apiSecret = process.env.BOOKING_API_SECRET;

  if (!apiKey || apiKey === "your-booking-key-here") {
    console.warn("[booking] No credentials — returning simulated data");
    return simulateHotels(city);
  }

  try {
    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    const body = {
      checkin,
      checkout,
      city,
      adults,
      room_number: 1,
      currency: "EUR",
      rows: 5,
    };

    const res = await fetch(`${BOOKING_BASE}/accommodations/search`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip",
      },
      body: JSON.stringify(body),
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Booking responded ${res.status}`);

    const json: BookingSearchResponse = await res.json();

    return json.result.map((p): RawHotel => ({
      id: String(p.id),
      name: p.name,
      city: p.city,
      country: p.country_code,
      starRating: p.property_class,
      reviewScore: p.review_score,
      pricePerNightEur: p.price_breakdown.gross_price.value,
      amenities: p.facilities_block?.facilities.map((f) => f.name) ?? [],
      imageUrl: p.main_photo_url ?? null,
      deepLink: p.url ?? "https://booking.com",
      source: "booking",
    }));
  } catch (err) {
    console.error("[booking] fetch failed:", err);
    return simulateHotels(city);
  }
}

// ─── Simulation ───────────────────────────────────────────────────────────────

const CITY_HOTELS: Record<string, Array<Omit<RawHotel, "source">>> = {
  Tokyo: [
    { id: "sim-tok-1", name: "Hotel Gracery Shinjuku", city: "Tokyo", country: "JP", starRating: 4, reviewScore: 8.4, pricePerNightEur: 115, amenities: ["WiFi", "Restaurant", "Bar"], imageUrl: null, deepLink: "https://booking.com" },
    { id: "sim-tok-2", name: "APA Hotel Asakusa", city: "Tokyo", country: "JP", starRating: 3, reviewScore: 7.9, pricePerNightEur: 72, amenities: ["WiFi", "24h Front Desk"], imageUrl: null, deepLink: "https://booking.com" },
    { id: "sim-tok-3", name: "Park Hyatt Tokyo", city: "Tokyo", country: "JP", starRating: 5, reviewScore: 9.2, pricePerNightEur: 340, amenities: ["WiFi", "Pool", "Spa", "Restaurant"], imageUrl: null, deepLink: "https://booking.com" },
  ],
  Bali: [
    { id: "sim-bal-1", name: "The Layar Private Villas", city: "Seminyak", country: "ID", starRating: 5, reviewScore: 9.1, pricePerNightEur: 195, amenities: ["Pool", "WiFi", "Spa", "Restaurant"], imageUrl: null, deepLink: "https://booking.com" },
    { id: "sim-bal-2", name: "Komaneka Bisma Ubud", city: "Ubud", country: "ID", starRating: 4, reviewScore: 9.3, pricePerNightEur: 148, amenities: ["Pool", "WiFi", "Breakfast"], imageUrl: null, deepLink: "https://booking.com" },
  ],
  Barcelona: [
    { id: "sim-bcn-1", name: "Hotel Arts Barcelona", city: "Barcelona", country: "ES", starRating: 5, reviewScore: 9.0, pricePerNightEur: 185, amenities: ["Pool", "WiFi", "Spa", "Restaurant"], imageUrl: null, deepLink: "https://booking.com" },
    { id: "sim-bcn-2", name: "DO: Plaça Reial", city: "Barcelona", country: "ES", starRating: 4, reviewScore: 8.7, pricePerNightEur: 148, amenities: ["WiFi", "Rooftop Bar", "Breakfast"], imageUrl: null, deepLink: "https://booking.com" },
    { id: "sim-bcn-3", name: "Praktik Rambla", city: "Barcelona", country: "ES", starRating: 3, reviewScore: 8.2, pricePerNightEur: 88, amenities: ["WiFi", "Terrace"], imageUrl: null, deepLink: "https://booking.com" },
  ],
  Lisbon: [
    { id: "sim-lis-1", name: "Bairro Alto Hotel", city: "Lisbon", country: "PT", starRating: 5, reviewScore: 9.1, pricePerNightEur: 168, amenities: ["WiFi", "Restaurant", "Spa"], imageUrl: null, deepLink: "https://booking.com" },
    { id: "sim-lis-2", name: "LX Boutique Hotel", city: "Lisbon", country: "PT", starRating: 4, reviewScore: 8.5, pricePerNightEur: 98, amenities: ["WiFi", "Bar", "Breakfast"], imageUrl: null, deepLink: "https://booking.com" },
  ],
  Lapland: [
    { id: "sim-lap-1", name: "Arctic TreeHouse Hotel", city: "Rovaniemi", country: "FI", starRating: 4, reviewScore: 9.4, pricePerNightEur: 385, amenities: ["Sauna", "WiFi", "Northern Lights View"], imageUrl: null, deepLink: "https://booking.com" },
    { id: "sim-lap-2", name: "Santa's Hotel Aurora", city: "Rovaniemi", country: "FI", starRating: 4, reviewScore: 8.8, pricePerNightEur: 195, amenities: ["WiFi", "Restaurant", "Spa"], imageUrl: null, deepLink: "https://booking.com" },
  ],
  Malaga: [
    { id: "sim-mal-1", name: "Room Mate Valeria", city: "Málaga", country: "ES", starRating: 4, reviewScore: 8.6, pricePerNightEur: 95, amenities: ["Rooftop Pool", "WiFi", "Bar"], imageUrl: null, deepLink: "https://booking.com" },
    { id: "sim-mal-2", name: "Vincci Málaga", city: "Málaga", country: "ES", starRating: 4, reviewScore: 8.3, pricePerNightEur: 78, amenities: ["WiFi", "Restaurant", "Gym"], imageUrl: null, deepLink: "https://booking.com" },
  ],
};

function simulateHotels(city: string): RawHotel[] {
  const key = Object.keys(CITY_HOTELS).find(
    (k) => k.toLowerCase() === city.toLowerCase()
  ) ?? "Barcelona";

  return (CITY_HOTELS[key] ?? CITY_HOTELS.Barcelona).map((h) => ({
    ...h,
    source: "simulated" as const,
  }));
}

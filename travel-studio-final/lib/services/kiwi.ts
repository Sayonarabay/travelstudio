/**
 * Kiwi (Tequila) Flight Search Service
 * Docs: https://tequila.kiwi.com/portal/docs/tequila-api/search_api
 *
 * Real API shape is preserved. Returns simulated data when key is absent
 * but clearly flags it with source: "simulated" so the AI layer never
 * treats it as verified pricing.
 */

import { RawFlight } from "@/types";

const KIWI_BASE = "https://api.tequila.kiwi.com/v2";

interface KiwiItinerary {
  id: string;
  price: number;
  airlines: string[];
  duration: { departure: number };
  route: Array<{
    flyFrom: string;
    flyTo: string;
    local_departure: string;
    local_arrival: string;
    airline: string;
  }>;
  deep_link: string;
}

interface KiwiSearchResponse {
  data: KiwiItinerary[];
  currency: string;
}

export async function searchFlights(
  origin: string,
  destination: string,
  dateFrom: string,
  dateTo: string,
  adults = 1
): Promise<RawFlight[]> {
  const apiKey = process.env.KIWI_API_KEY;

  if (!apiKey || apiKey === "your-kiwi-key-here") {
    console.warn("[kiwi] No API key — returning simulated data");
    return simulateFlights(origin, destination, dateFrom);
  }

  try {
    const params = new URLSearchParams({
      fly_from: origin,
      fly_to: destination,
      date_from: dateFrom,
      date_to: dateTo,
      adults: String(adults),
      curr: "EUR",
      limit: "5",
      sort: "price",
      one_for_city: "1",
    });

    const res = await fetch(`${KIWI_BASE}/search?${params}`, {
      headers: { apikey: apiKey },
      next: { revalidate: 1800 }, // cache 30 min
    });

    if (!res.ok) {
      throw new Error(`Kiwi responded ${res.status}`);
    }

    const json: KiwiSearchResponse = await res.json();

    return json.data.map((it): RawFlight => {
      const first = it.route[0];
      const last = it.route[it.route.length - 1];
      return {
        id: it.id,
        origin: first.flyFrom,
        destination: last.flyTo,
        departureAt: first.local_departure,
        arrivalAt: last.local_arrival,
        durationMinutes: Math.round(it.duration.departure / 60),
        airline: it.airlines.join(" + "),
        stops: it.route.length - 1,
        priceEur: it.price,
        deepLink: it.deep_link,
        source: "kiwi",
      };
    });
  } catch (err) {
    console.error("[kiwi] fetch failed:", err);
    return simulateFlights(origin, destination, dateFrom);
  }
}

// ─── Simulation (clearly labelled, used only when API is unavailable) ─────────

const ROUTE_DATA: Record<string, { durationMin: number; priceEur: number; airline: string; stops: number }> = {
  "CDG-NRT": { durationMin: 780, priceEur: 620, airline: "Air France / JAL", stops: 0 },
  "CDG-DPS": { durationMin: 960, priceEur: 580, airline: "Singapore Airlines", stops: 1 },
  "CDG-RVN": { durationMin: 280, priceEur: 180, airline: "Finnair", stops: 1 },
  "CDG-BCN": { durationMin: 115, priceEur: 65, airline: "Vueling", stops: 0 },
  "CDG-LIS": { durationMin: 105, priceEur: 72, airline: "TAP Portugal", stops: 0 },
  "CDG-AGP": { durationMin: 165, priceEur: 58, airline: "easyJet", stops: 0 },
  "BCN-NRT": { durationMin: 800, priceEur: 640, airline: "Qatar Airways", stops: 1 },
  "MAD-NRT": { durationMin: 810, priceEur: 610, airline: "Japan Airlines", stops: 0 },
  "LHR-NRT": { durationMin: 720, priceEur: 590, airline: "British Airways", stops: 0 },
};

function simulateFlights(origin: string, destination: string, date: string): RawFlight[] {
  const key = `${origin}-${destination}`;
  const fallbackKey = `CDG-${destination}`;
  const route = ROUTE_DATA[key] || ROUTE_DATA[fallbackKey];

  if (!route) return [];

  const dep = new Date(`${date}T07:30:00`);
  const arr = new Date(dep.getTime() + route.durationMin * 60 * 1000);

  return [
    {
      id: `sim-${origin}-${destination}-${date}`,
      origin,
      destination,
      departureAt: dep.toISOString(),
      arrivalAt: arr.toISOString(),
      durationMinutes: route.durationMin,
      airline: route.airline,
      stops: route.stops,
      priceEur: route.priceEur,
      deepLink: "https://kiwi.com",
      source: "simulated",
    },
  ];
}

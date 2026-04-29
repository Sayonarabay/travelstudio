/**
 * Data Aggregator
 *
 * Orchestrates parallel calls to all providers.
 * Merges results into a single ProviderBundle.
 * Tracks which providers failed (dataGaps) so the AI layer
 * can mark prices as estimates instead of inventing data.
 */

import { searchFlights } from "./kiwi";
import { searchHotels } from "./booking";
import { searchHotelsTrivago } from "./trivago";
import { searchAttractions } from "./tripadvisor";
import { searchEvents } from "./fever";
import type { ProviderBundle, TripSearchParams, RawHotel, RawExperience } from "@/types";

// Destination catalogue — maps user intent to IATA + city name
const DESTINATION_MAP: Record<
  string,
  { iata: string; city: string; country: string; travelTypes: string[] }
> = {
  Tokyo: { iata: "NRT", city: "Tokyo", country: "Japan", travelTypes: ["Urbano", "Cultural", "Gastronomía"] },
  Bali: { iata: "DPS", city: "Bali", country: "Indonesia", travelTypes: ["Tropical", "Wellness", "Aventura"] },
  Barcelona: { iata: "BCN", city: "Barcelona", country: "Spain", travelTypes: ["Urbano", "Cultural", "Gastronomía"] },
  Lisbon: { iata: "LIS", city: "Lisbon", country: "Portugal", travelTypes: ["Cultural", "Gastronomía", "Romántico"] },
  Lapland: { iata: "RVN", city: "Lapland", country: "Finland", travelTypes: ["Aventura", "Familiar", "Naturaleza"] },
  Malaga: { iata: "AGP", city: "Malaga", country: "Spain", travelTypes: ["Playa", "Gastronomía", "Cultural"] },
};

export function getDestinationsForTypes(travelTypes: string[]): string[] {
  if (!travelTypes.length) return Object.keys(DESTINATION_MAP);

  return Object.entries(DESTINATION_MAP)
    .filter(([, meta]) =>
      meta.travelTypes.some((t) => travelTypes.includes(t))
    )
    .map(([name]) => name);
}

export async function fetchProviderBundle(
  params: TripSearchParams,
  destinationName: string
): Promise<ProviderBundle> {
  const dest = DESTINATION_MAP[destinationName];
  if (!dest) {
    return emptyBundle([`Unknown destination: ${destinationName}`]);
  }

  const checkin = params.departureDate;
  const checkout = addDays(checkin, params.days);
  const endDate = checkout;

  const dataGaps: string[] = [];

  // ── Parallel fetches ─────────────────────────────────────────────────────
  const [flights, hotelsBooking, hotelsTrivago, experiences, events] =
    await Promise.allSettled([
      searchFlights(params.origin, dest.iata, checkin, checkin),
      searchHotels(dest.city, checkin, checkout),
      searchHotelsTrivago(dest.city, checkin, checkout),
      searchAttractions(dest.city),
      searchEvents(dest.city, checkin, endDate),
    ]);

  // ── Unwrap results, track gaps ────────────────────────────────────────────
  const resolvedFlights =
    flights.status === "fulfilled" ? flights.value : [];
  if (flights.status === "rejected" || resolvedFlights.length === 0) {
    dataGaps.push("flights");
  }

  const bookingHotels: RawHotel[] =
    hotelsBooking.status === "fulfilled" ? hotelsBooking.value : [];
  const trivagoHotels: RawHotel[] =
    hotelsTrivago.status === "fulfilled" ? hotelsTrivago.value : [];

  // Deduplicate by name (trivago often overlaps booking)
  const seenNames = new Set(bookingHotels.map((h) => h.name.toLowerCase()));
  const uniqueTrivagoHotels = trivagoHotels.filter(
    (h) => !seenNames.has(h.name.toLowerCase())
  );
  const allHotels = [...bookingHotels, ...uniqueTrivagoHotels];

  if (allHotels.length === 0) dataGaps.push("hotels");

  const resolvedExperiences: RawExperience[] = [
    ...(experiences.status === "fulfilled" ? experiences.value : []),
    ...(events.status === "fulfilled" ? events.value : []),
  ];
  if (resolvedExperiences.length === 0) dataGaps.push("experiences");

  return {
    flights: resolvedFlights,
    hotels: allHotels,
    experiences: resolvedExperiences,
    fetchedAt: new Date().toISOString(),
    dataGaps,
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function emptyBundle(gaps: string[]): ProviderBundle {
  return { flights: [], hotels: [], experiences: [], fetchedAt: new Date().toISOString(), dataGaps: gaps };
}

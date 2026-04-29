/**
 * Data Aggregator
 *
 * Destination catalogue is open — 60+ destinations.
 * getDestinationsForTypes() returns shuffled matches so results
 * are never the same twice.
 */

import { searchFlights } from "./kiwi";
import { searchHotels } from "./booking";
import { searchHotelsTrivago } from "./trivago";
import { searchAttractions } from "./tripadvisor";
import { searchEvents } from "./fever";
import type { ProviderBundle, TripSearchParams, RawHotel, RawExperience } from "@/types";

const DESTINATION_MAP: Record<
  string,
  { iata: string; city: string; country: string; travelTypes: string[]; budgetMin: number }
> = {
  // Europe
  Barcelona:    { iata: "BCN", city: "Barcelona",    country: "Spain",       travelTypes: ["Urbano","Cultural","Gastronomía","Romántico"],       budgetMin: 300 },
  Lisbon:       { iata: "LIS", city: "Lisbon",        country: "Portugal",    travelTypes: ["Cultural","Gastronomía","Romántico","Urbano"],        budgetMin: 250 },
  Malaga:       { iata: "AGP", city: "Málaga",        country: "Spain",       travelTypes: ["Playa","Gastronomía","Cultural"],                    budgetMin: 200 },
  Porto:        { iata: "OPO", city: "Porto",         country: "Portugal",    travelTypes: ["Cultural","Gastronomía","Romántico"],                 budgetMin: 220 },
  Seville:      { iata: "SVQ", city: "Sevilla",       country: "Spain",       travelTypes: ["Cultural","Gastronomía","Romántico","Urbano"],        budgetMin: 250 },
  Valencia:     { iata: "VLC", city: "Valencia",      country: "Spain",       travelTypes: ["Playa","Gastronomía","Cultural","Urbano"],            budgetMin: 220 },
  Rome:         { iata: "FCO", city: "Roma",          country: "Italy",       travelTypes: ["Cultural","Gastronomía","Romántico","Urbano"],        budgetMin: 350 },
  Florence:     { iata: "FLR", city: "Florencia",     country: "Italy",       travelTypes: ["Cultural","Romántico","Gastronomía"],                 budgetMin: 350 },
  Naples:       { iata: "NAP", city: "Nápoles",       country: "Italy",       travelTypes: ["Cultural","Gastronomía","Playa"],                    budgetMin: 280 },
  Amalfi:       { iata: "NAP", city: "Costa Amalfi",  country: "Italy",       travelTypes: ["Romántico","Playa","Cultural"],                      budgetMin: 400 },
  Sicily:       { iata: "CTA", city: "Sicilia",       country: "Italy",       travelTypes: ["Cultural","Playa","Gastronomía"],                    budgetMin: 280 },
  Athens:       { iata: "ATH", city: "Atenas",        country: "Greece",      travelTypes: ["Cultural","Gastronomía","Urbano"],                   budgetMin: 300 },
  Santorini:    { iata: "JTR", city: "Santorini",     country: "Greece",      travelTypes: ["Romántico","Playa","Lujo"],                          budgetMin: 500 },
  Mykonos:      { iata: "JMK", city: "Mykonos",       country: "Greece",      travelTypes: ["Playa","Lujo","Romántico"],                          budgetMin: 600 },
  Crete:        { iata: "HER", city: "Creta",         country: "Greece",      travelTypes: ["Playa","Cultural","Aventura"],                       budgetMin: 300 },
  Split:        { iata: "SPU", city: "Split",         country: "Croatia",     travelTypes: ["Cultural","Playa","Romántico"],                      budgetMin: 300 },
  Dubrovnik:    { iata: "DBV", city: "Dubrovnik",     country: "Croatia",     travelTypes: ["Cultural","Playa","Romántico","Lujo"],               budgetMin: 400 },
  Kotor:        { iata: "TIV", city: "Kotor",         country: "Montenegro",  travelTypes: ["Cultural","Playa","Romántico","Aventura"],           budgetMin: 280 },
  Amsterdam:    { iata: "AMS", city: "Ámsterdam",     country: "Netherlands", travelTypes: ["Urbano","Cultural","Gastronomía"],                   budgetMin: 350 },
  Prague:       { iata: "PRG", city: "Praga",         country: "Czech Rep.",  travelTypes: ["Cultural","Gastronomía","Romántico","Urbano"],        budgetMin: 280 },
  Vienna:       { iata: "VIE", city: "Viena",         country: "Austria",     travelTypes: ["Cultural","Gastronomía","Romántico","Urbano"],        budgetMin: 320 },
  Budapest:     { iata: "BUD", city: "Budapest",      country: "Hungary",     travelTypes: ["Cultural","Gastronomía","Romántico","Urbano"],        budgetMin: 250 },
  Krakow:       { iata: "KRK", city: "Cracovia",      country: "Poland",      travelTypes: ["Cultural","Gastronomía","Urbano"],                   budgetMin: 200 },
  Warsaw:       { iata: "WAW", city: "Varsovia",      country: "Poland",      travelTypes: ["Cultural","Urbano","Gastronomía"],                   budgetMin: 220 },
  Berlin:       { iata: "BER", city: "Berlín",        country: "Germany",     travelTypes: ["Urbano","Cultural","Gastronomía"],                   budgetMin: 300 },
  Munich:       { iata: "MUC", city: "Múnich",        country: "Germany",     travelTypes: ["Cultural","Gastronomía","Familiar"],                 budgetMin: 350 },
  Zurich:       { iata: "ZRH", city: "Zúrich",        country: "Switzerland", travelTypes: ["Lujo","Montaña","Cultural"],                        budgetMin: 600 },
  Copenhagen:   { iata: "CPH", city: "Copenhague",    country: "Denmark",     travelTypes: ["Urbano","Cultural","Gastronomía"],                   budgetMin: 400 },
  Stockholm:    { iata: "ARN", city: "Estocolmo",     country: "Sweden",      travelTypes: ["Urbano","Cultural","Naturaleza"],                    budgetMin: 400 },
  Helsinki:     { iata: "HEL", city: "Helsinki",      country: "Finland",     travelTypes: ["Urbano","Cultural","Naturaleza"],                    budgetMin: 380 },
  Lapland:      { iata: "RVN", city: "Laponia",       country: "Finland",     travelTypes: ["Aventura","Familiar","Naturaleza","Wellness"],       budgetMin: 700 },
  Reykjavik:    { iata: "KEF", city: "Reikiavik",     country: "Iceland",     travelTypes: ["Aventura","Naturaleza","Romántico"],                 budgetMin: 700 },
  Edinburgh:    { iata: "EDI", city: "Edimburgo",     country: "Scotland",    travelTypes: ["Cultural","Gastronomía","Aventura"],                 budgetMin: 320 },
  London:       { iata: "LHR", city: "Londres",       country: "UK",          travelTypes: ["Urbano","Cultural","Gastronomía","Familiar"],        budgetMin: 400 },
  Paris:        { iata: "CDG", city: "París",         country: "France",      travelTypes: ["Romántico","Cultural","Gastronomía","Lujo"],         budgetMin: 350 },
  Marseille:    { iata: "MRS", city: "Marsella",      country: "France",      travelTypes: ["Playa","Gastronomía","Cultural"],                    budgetMin: 280 },
  Nice:         { iata: "NCE", city: "Niza",          country: "France",      travelTypes: ["Playa","Romántico","Lujo"],                          budgetMin: 380 },
  // Asia
  Tokyo:        { iata: "NRT", city: "Tokio",         country: "Japan",       travelTypes: ["Urbano","Cultural","Gastronomía","Aventura"],        budgetMin: 500 },
  Kyoto:        { iata: "ITM", city: "Kioto",         country: "Japan",       travelTypes: ["Cultural","Romántico","Wellness","Gastronomía"],     budgetMin: 500 },
  Osaka:        { iata: "KIX", city: "Osaka",         country: "Japan",       travelTypes: ["Gastronomía","Urbano","Cultural"],                   budgetMin: 480 },
  Bangkok:      { iata: "BKK", city: "Bangkok",       country: "Thailand",    travelTypes: ["Urbano","Cultural","Gastronomía","Aventura"],        budgetMin: 400 },
  ChiangMai:    { iata: "CNX", city: "Chiang Mai",    country: "Thailand",    travelTypes: ["Cultural","Wellness","Aventura","Gastronomía"],      budgetMin: 350 },
  Bali:         { iata: "DPS", city: "Bali",          country: "Indonesia",   travelTypes: ["Tropical","Wellness","Aventura","Romántico"],        budgetMin: 450 },
  Singapore:    { iata: "SIN", city: "Singapur",      country: "Singapore",   travelTypes: ["Urbano","Gastronomía","Lujo","Cultural"],            budgetMin: 600 },
  HongKong:     { iata: "HKG", city: "Hong Kong",     country: "Hong Kong",   travelTypes: ["Urbano","Gastronomía","Cultural"],                   budgetMin: 550 },
  Vietnam:      { iata: "HAN", city: "Hanói",         country: "Vietnam",     travelTypes: ["Cultural","Aventura","Gastronomía"],                 budgetMin: 500 },
  HoiAn:        { iata: "DAD", city: "Hoi An",        country: "Vietnam",     travelTypes: ["Cultural","Romántico","Gastronomía","Playa"],        budgetMin: 480 },
  Nepal:        { iata: "KTM", city: "Katmandú",      country: "Nepal",       travelTypes: ["Aventura","Cultural","Montaña"],                    budgetMin: 600 },
  SriLanka:     { iata: "CMB", city: "Sri Lanka",     country: "Sri Lanka",   travelTypes: ["Tropical","Cultural","Aventura","Playa"],            budgetMin: 550 },
  // Africa & Middle East
  Morocco:      { iata: "RAK", city: "Marrakech",     country: "Morocco",     travelTypes: ["Cultural","Gastronomía","Aventura","Romántico"],     budgetMin: 300 },
  Zanzibar:     { iata: "ZNZ", city: "Zanzíbar",      country: "Tanzania",    travelTypes: ["Tropical","Playa","Aventura"],                       budgetMin: 600 },
  Dubai:        { iata: "DXB", city: "Dubái",         country: "UAE",         travelTypes: ["Lujo","Urbano","Gastronomía"],                       budgetMin: 700 },
  // Americas
  NewYork:      { iata: "JFK", city: "Nueva York",    country: "USA",         travelTypes: ["Urbano","Cultural","Gastronomía","Familiar"],        budgetMin: 700 },
  Mexico:       { iata: "CUN", city: "Cancún",        country: "Mexico",      travelTypes: ["Playa","Tropical","Familiar"],                       budgetMin: 600 },
  Colombia:     { iata: "BOG", city: "Cartagena",     country: "Colombia",    travelTypes: ["Cultural","Playa","Gastronomía","Aventura"],         budgetMin: 550 },
  CostaRica:    { iata: "SJO", city: "Costa Rica",    country: "Costa Rica",  travelTypes: ["Aventura","Tropical","Naturaleza","Familiar"],       budgetMin: 650 },
  // Canarias / Atlantic
  Tenerife:     { iata: "TFS", city: "Tenerife",      country: "Spain",       travelTypes: ["Playa","Familiar","Wellness","Naturaleza"],          budgetMin: 250 },
  Lanzarote:    { iata: "ACE", city: "Lanzarote",     country: "Spain",       travelTypes: ["Playa","Aventura","Naturaleza"],                    budgetMin: 230 },
  Madeira:      { iata: "FNC", city: "Madeira",       country: "Portugal",    travelTypes: ["Naturaleza","Wellness","Romántico","Aventura"],      budgetMin: 280 },
};

export function getDestinationsForTypes(travelTypes: string[], budget = 9999, count = 6): string[] {
  const all = Object.entries(DESTINATION_MAP);

  const matching = travelTypes.length
    ? all.filter(([, m]) => m.travelTypes.some((t) => travelTypes.includes(t)) && m.budgetMin <= budget)
    : all.filter(([, m]) => m.budgetMin <= budget);

  // Shuffle so results differ each search
  const shuffled = matching.sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count).map(([name]) => name);
}

export function getDestinationMeta(name: string) {
  return DESTINATION_MAP[name] ?? null;
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
  const dataGaps: string[] = [];

  const [flights, hotelsBooking, hotelsTrivago, experiences, events] =
    await Promise.allSettled([
      searchFlights(params.origin, dest.iata, checkin, checkin),
      searchHotels(dest.city, checkin, checkout),
      searchHotelsTrivago(dest.city, checkin, checkout),
      searchAttractions(dest.city),
      searchEvents(dest.city, checkin, checkout),
    ]);

  const resolvedFlights = flights.status === "fulfilled" ? flights.value : [];
  if (resolvedFlights.length === 0) dataGaps.push("flights");

  const bookingHotels: RawHotel[] = hotelsBooking.status === "fulfilled" ? hotelsBooking.value : [];
  const trivagoHotels: RawHotel[] = hotelsTrivago.status === "fulfilled" ? hotelsTrivago.value : [];
  const seenNames = new Set(bookingHotels.map((h) => h.name.toLowerCase()));
  const uniqueTrivagoHotels = trivagoHotels.filter((h) => !seenNames.has(h.name.toLowerCase()));
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

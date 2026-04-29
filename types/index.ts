// ─── Search Input ────────────────────────────────────────────────────────────

export interface TripSearchParams {
  origin: string;           // IATA code e.g. "CDG"
  budget: number;           // EUR, per person
  days: number;
  departureDate: string;    // ISO date
  flexible: boolean;
  travelTypes: string[];    // ["Aventura", "Cultural", …]
  needsAccommodation: boolean;
  needsTransport: boolean;
}

// ─── Raw provider payloads ────────────────────────────────────────────────────

export interface RawFlight {
  id: string;
  origin: string;
  destination: string;
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  airline: string;
  stops: number;
  priceEur: number;
  deepLink: string;
  source: "kiwi" | "simulated";
}

export interface RawHotel {
  id: string;
  name: string;
  city: string;
  country: string;
  starRating: number;
  reviewScore: number;
  pricePerNightEur: number;
  amenities: string[];
  imageUrl: string | null;
  deepLink: string;
  source: "booking" | "trivago" | "tripadvisor" | "simulated";
}

export interface RawExperience {
  id: string;
  title: string;
  description: string;
  durationHours: number;
  priceEur: number;
  category: string;
  imageUrl: string | null;
  deepLink: string;
  source: "fever" | "viator" | "simulated";
}

// ─── Aggregated provider bundle ───────────────────────────────────────────────

export interface ProviderBundle {
  flights: RawFlight[];
  hotels: RawHotel[];
  experiences: RawExperience[];
  fetchedAt: string;   // ISO timestamp
  dataGaps: string[];  // which providers returned nothing
}

// ─── AI-enhanced output ───────────────────────────────────────────────────────

export interface TripDay {
  day: number;
  title: string;
  items: TripDayItem[];
}

export interface TripDayItem {
  time: string;
  type: "included" | "suggested" | "transport" | "meal";
  title: string;
  description: string;
  priceEur: number | null;
  sourceId: string | null;   // links back to RawExperience/RawFlight id
}

export interface GeneratedTrip {
  destination: string;
  country: string;
  city: string;
  tagline: string;
  description: string;
  categories: string[];
  heroImageUnsplashQuery: string;

  totalPriceEur: number;
  priceBreakdown: {
    flights: number;
    accommodation: number;
    experiences: number;
  };
  priceIsEstimate: boolean;   // true if any value came from simulation

  selectedFlight: RawFlight | null;
  selectedHotel: RawHotel | null;
  recommendedExperiences: RawExperience[];

  itinerary: TripDay[];
  tips: { icon: string; title: string; body: string }[];

  aiReasoning: string;  // why this trip was chosen (shown as editorial copy)
  generatedAt: string;
}

// ─── API response wrappers ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
  code: "PROVIDER_UNAVAILABLE" | "AI_ERROR" | "VALIDATION_ERROR" | "UNKNOWN";
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Future auth / DB stubs (not yet implemented) ─────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  savedTrips: string[];   // trip ids
  preferences: Partial<TripSearchParams>;
}

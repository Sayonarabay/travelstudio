# Travel Studio — Next.js Production App

> "No te decimos a dónde ir. Te decimos qué puedes hacer con tu dinero y tu tiempo."

A budget-first travel discovery platform built with Next.js App Router, TypeScript, and real data providers.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | CSS Variables + Tailwind utilities |
| AI | Anthropic Claude (server-side only) |
| Flight data | Kiwi.com Tequila API |
| Hotels (primary) | Booking.com Demand API |
| Hotels (secondary) | Trivago API |
| Experiences | TripAdvisor Content API |
| Events | Fever Partner API |

---

## Project Structure

```
travel-studio/
├── .env.local                 ← API keys (never committed)
├── next.config.ts
├── types/
│   └── index.ts               ← All shared TypeScript types
├── lib/
│   ├── utils.ts               ← formatEur, formatDate, unsplashUrl…
│   └── services/
│       ├── index.ts           ← Barrel export
│       ├── kiwi.ts            ← Flight search (Kiwi Tequila API)
│       ├── booking.ts         ← Hotels primary (Booking.com)
│       ├── trivago.ts         ← Hotels secondary (Trivago)
│       ├── tripadvisor.ts     ← Experiences (TripAdvisor Content API)
│       ├── fever.ts           ← Events (Fever Partner API)
│       ├── aggregator.ts      ← Parallel fetch + dedup + gap tracking
│       └── anthropic.ts       ← AI layer (ranks real data, never invents)
├── app/
│   ├── layout.tsx             ← Root layout + Navbar
│   ├── globals.css            ← Design tokens + global CSS
│   ├── page.tsx               ← / Hero landing
│   ├── explore/
│   │   ├── layout.tsx         ← Suspense boundary
│   │   ├── page.tsx           ← /explore — Type selector + search form
│   │   └── results/
│   │       └── page.tsx       ← /explore/results — Destination grid
│   ├── trip/
│   │   ├── layout.tsx         ← Suspense boundary
│   │   └── [destination]/
│   │       └── page.tsx       ← /trip/[destination] — Full AI itinerary
│   ├── checkout/
│   │   ├── layout.tsx
│   │   └── page.tsx           ← /checkout — Booking form
│   ├── confirmation/
│   │   ├── layout.tsx
│   │   └── page.tsx           ← /confirmation
│   └── api/
│       ├── generate-trip/
│       │   └── route.ts       ← POST /api/generate-trip
│       └── search-destinations/
│           └── route.ts       ← GET /api/search-destinations
└── components/
    ├── layout/
    │   └── Navbar.tsx
    ├── ui/
    │   ├── index.tsx          ← Button, Badge, Spinner, EstimateFlag
    │   └── StepBar.tsx
    └── explore/
        └── DestinationCard.tsx
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.local` and fill in your keys:

```bash
cp .env.local .env.local.example   # keep the template
```

| Variable | Source |
|---|---|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com |
| `KIWI_API_KEY` | https://tequila.kiwi.com/portal |
| `BOOKING_API_KEY` / `BOOKING_API_SECRET` | https://developers.booking.com |
| `TRIVAGO_API_KEY` | https://developer.trivago.com |
| `TRIPADVISOR_API_KEY` | https://tripadvisor.com/developers |
| `FEVER_API_KEY` | partnerships@feverup.com |

**All keys are server-side only. None are exposed to the client.**

### 3. Run

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve production build
```

---

## API Endpoints

### `POST /api/generate-trip`

Full AI-powered trip generation. Requires all providers to return data before AI runs.

**Request body:**
```json
{
  "origin": "CDG",
  "budget": 800,
  "days": 7,
  "departureDate": "2025-06-15",
  "flexible": false,
  "travelTypes": ["Cultural", "Gastronomía"],
  "needsAccommodation": true,
  "needsTransport": true,
  "destination": "Lisbon"   // optional override
}
```

**Response:** `GeneratedTrip` object (see `types/index.ts`)

**Anti-hallucination guarantee:**
- AI receives only verified provider data
- `priceIsEstimate: true` whenever any source is `"simulated"`
- If all providers fail → `503` (never returns invented data)

### `GET /api/search-destinations`

Real data only. No AI involved.

```
GET /api/search-destinations?types=Cultural,Playa&budget=600
```

---

## Data Flow

```
User search params
       │
       ▼
GET /api/search-destinations
  └── aggregator.getDestinationsForTypes()
  └── Returns destination list with baseline prices

User selects destination
       │
       ▼
POST /api/generate-trip
  ├── aggregator.fetchProviderBundle()
  │     ├── kiwi.searchFlights()          ← parallel
  │     ├── booking.searchHotels()        ← parallel
  │     ├── trivago.searchHotelsTrivago() ← parallel
  │     ├── tripadvisor.searchAttractions() ← parallel
  │     └── fever.searchEvents()          ← parallel
  │
  └── anthropic.generateTrip(params, bundle)
        ← AI only formats/ranks real data
        ← Never invents prices, places, or availability
        ← priceIsEstimate = true if any source = "simulated"
```

---

## Simulation Fallback

Every provider has a clearly-labelled fallback for development / when API keys are absent:

- `source: "simulated"` on every simulated object
- `priceIsEstimate: true` propagated to final trip
- UI shows **"estimación"** badge (yellow) vs **"verificado"** (green/live)

This lets the app work end-to-end without paid API keys, while being completely honest with the user about data quality.

---

## Future: Auth + Database

Stubs are in place but not implemented:

- `UserProfile` type in `types/index.ts`
- `DATABASE_URL`, `NEXTAUTH_SECRET` in `.env.local`
- API routes are structured for future `auth()` middleware guards
- Services are modular — swap any provider by replacing its file in `lib/services/`

---

## Scalability Notes

- Each service in `lib/services/` is independent and replaceable
- `aggregator.ts` handles provider failures gracefully — one failing provider does not block others
- Responses are cached with `next: { revalidate }` at the fetch level (30min flights, 1h hotels)
- The AI prompt is strict: hallucinations are a `console.error` + `503`, never silently passed through


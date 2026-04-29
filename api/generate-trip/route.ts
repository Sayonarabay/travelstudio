/**
 * POST /api/generate-trip
 *
 * Flow:
 * 1. Validate request body
 * 2. Determine best destination(s) for the params
 * 3. Fetch real data from all providers in parallel (aggregator)
 * 4. Pass data bundle to Anthropic — AI formats + ranks, never invents
 * 5. Return GeneratedTrip
 *
 * API keys never leave the server.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchProviderBundle, getDestinationsForTypes } from "@/lib/services/aggregator";
import { generateTrip } from "@/lib/services/anthropic";
import type { ApiResponse, GeneratedTrip, TripSearchParams } from "@/types";

// ── Input validation ──────────────────────────────────────────────────────────
const schema = z.object({
  origin: z.string().length(3).toUpperCase(),
  budget: z.number().min(100).max(10000),
  days: z.number().min(2).max(30),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  flexible: z.boolean().default(false),
  travelTypes: z.array(z.string()).min(1),
  needsAccommodation: z.boolean().default(true),
  needsTransport: z.boolean().default(true),
  destination: z.string().optional(), // override: client can specify
});

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<GeneratedTrip>>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues.map((i) => i.message).join("; "), code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const params: TripSearchParams = parsed.data;

  // Pick destination: either explicit or best match for travel types
  const candidateDestinations = parsed.data.destination
    ? [parsed.data.destination]
    : getDestinationsForTypes(params.travelTypes);

  if (candidateDestinations.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No destinations found for requested travel types", code: "PROVIDER_UNAVAILABLE" },
      { status: 422 }
    );
  }

  // Pick first matching destination (future: run all in parallel and let AI rank)
  const destinationName = candidateDestinations[0];

  try {
    const bundle = await fetchProviderBundle(params, destinationName);

    // If all providers failed and we have nothing real, abort rather than hallucinate
    if (
      bundle.flights.length === 0 &&
      bundle.hotels.length === 0 &&
      bundle.experiences.length === 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "All data providers returned no results. Cannot generate trip without real data.",
          code: "PROVIDER_UNAVAILABLE",
        },
        { status: 503 }
      );
    }

    const trip = await generateTrip(params, bundle, destinationName);
    return NextResponse.json({ ok: true, data: trip });
  } catch (err) {
    console.error("[generate-trip]", err);
    return NextResponse.json(
      { ok: false, error: "Trip generation failed. Please try again.", code: "AI_ERROR" },
      { status: 500 }
    );
  }
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Spinner, Badge, EstimateFlag } from "@/components/ui/index";
import { formatEur, formatDuration, unsplashUrl } from "@/lib/utils";
import { RealtimePanel } from "@/components/trip/RealtimePanel";
import type { GeneratedTrip, ApiResponse } from "@/types";

export default function TripPage() {
  const { destination } = useParams<{ destination: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const [trip, setTrip] = useState<GeneratedTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const body = {
      origin: sp.get("origin") ?? "CDG",
      budget: Number(sp.get("budget") ?? 800),
      days: Number(sp.get("days") ?? 7),
      departureDate: sp.get("departureDate") ?? new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      flexible: sp.get("flexible") === "true",
      travelTypes: (sp.get("travelTypes") ?? "Cultural").split(","),
      needsAccommodation: sp.get("needsAccommodation") !== "false",
      needsTransport: sp.get("needsTransport") !== "false",
      destination: decodeURIComponent(destination),
    };

    fetch("/api/generate-trip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((json: ApiResponse<GeneratedTrip>) => {
        if (json.ok) setTrip(json.data);
        else setError(json.error);
      })
      .catch(() => setError("Error al generar el itinerario"))
      .finally(() => setLoading(false));
  }, [destination]);

  if (loading) return (
    <div style={{ minHeight: "calc(100vh - 52px)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <Spinner label="Consultando vuelos, hoteles y experiencias…" />
      <p style={{ fontSize: 13, color: "var(--t2)" }}>Esto puede tardar hasta 10 segundos la primera vez</p>
    </div>
  );

  if (error || !trip) return (
    <div style={{ minHeight: "calc(100vh - 52px)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <p style={{ color: "var(--t2)", fontSize: 15 }}>⚠️ {error ?? "No se pudo generar el itinerario"}</p>
      <button onClick={() => router.back()} style={{ color: "var(--teal)", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>← Volver a resultados</button>
    </div>
  );

  const heroImg = unsplashUrl(trip.heroImageUnsplashQuery, 1200, 500);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <button onClick={() => router.back()} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--t2)", background: "none", border: "none", cursor: "pointer", marginBottom: 22 }}>
        ← Volver a resultados
      </button>

      {/* Hero card */}
      <div style={{ background: "var(--white)", border: "1px solid var(--brd)", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
        <img src={heroImg} alt={trip.destination} style={{ width: "100%", height: 240, objectFit: "cover" }} />
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            {trip.categories.slice(0, 2).map((c, i) => (
              <Badge key={c} variant={i === 0 ? "teal" : "gray"}>{c}</Badge>
            ))}
            <EstimateFlag isEstimate={trip.priceIsEstimate} />
          </div>
          <h1 className="font-serif" style={{ fontSize: 26, fontWeight: 400, marginBottom: 4 }}>{trip.destination}</h1>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10, fontSize: 13, color: "var(--t2)" }}>
            <span>📍 {trip.city}, {trip.country}</span>
            {trip.selectedFlight && <span>⏱ {formatDuration(trip.selectedFlight.durationMinutes)}</span>}
            <span>📅 {trip.itinerary.length} días</span>
          </div>
          <div style={{ background: "var(--teal-lt)", borderLeft: "3px solid var(--teal)", borderRadius: "0 8px 8px 0", padding: "10px 14px", fontSize: 13, color: "var(--teal-dk)", marginBottom: 14 }}>
            {trip.aiReasoning}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ background: "none", border: "1.5px solid var(--brd)", borderRadius: 20, padding: "8px 18px", fontSize: 13, cursor: "pointer" }}>+ Guardar itinerario</button>
            <button onClick={() => router.push(`/checkout?destination=${encodeURIComponent(destination)}&${sp.toString()}`)} style={{ background: "var(--teal)", color: "#fff", border: "none", borderRadius: 20, padding: "8px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              ⚡ Reservar esta experiencia
            </button>
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 24 }}>
        {[
          { label: "Vuelo", value: trip.priceBreakdown.flights },
          { label: "Alojamiento", value: trip.priceBreakdown.accommodation },
          { label: "Experiencias", value: trip.priceBreakdown.experiences },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "var(--teal-lt)", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--teal-dk)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</div>
            <div className="font-serif" style={{ fontSize: 18, color: "var(--teal-dk)" }}>
              {value > 0 ? formatEur(value) : "data unavailable"}
            </div>
          </div>
        ))}
      </div>

      {/* Real-time data panel */}
      <RealtimePanel destination={trip.destination} />

      {/* Selected flight */}
      {trip.selectedFlight ? (
        <div style={{ background: "var(--teal-lt)", border: "1px solid rgba(46,207,191,0.3)", borderRadius: 12, padding: "16px 18px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <Badge variant={trip.selectedFlight.source === "simulated" ? "yellow" : "live"}>
                {trip.selectedFlight.source === "simulated" ? "precio estimado" : "Kiwi verificado"}
              </Badge>
              <Badge variant="gray">{trip.selectedFlight.stops === 0 ? "Directo" : `${trip.selectedFlight.stops} escala${trip.selectedFlight.stops > 1 ? "s" : ""}`}</Badge>
            </div>
            <a href={trip.selectedFlight.deepLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--teal-dk)", textDecoration: "underline" }}>Buscar este vuelo</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, fontSize: 12 }}>
            <div><div style={{ fontSize: 10, color: "var(--teal-dk)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 2 }}>Salida</div>{new Date(trip.selectedFlight.departureAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} — {trip.selectedFlight.origin}</div>
            <div><div style={{ fontSize: 10, color: "var(--teal-dk)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 2 }}>Llegada</div>{new Date(trip.selectedFlight.arrivalAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} — {trip.selectedFlight.destination}</div>
            <div><div style={{ fontSize: 10, color: "var(--teal-dk)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 2 }}>Duración</div>{formatDuration(trip.selectedFlight.durationMinutes)}</div>
            <div><div style={{ fontSize: 10, color: "var(--teal-dk)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 2 }}>Compañía</div>{trip.selectedFlight.airline}</div>
          </div>
          <div className="font-serif" style={{ fontSize: 20, color: "var(--teal-dk)", marginTop: 10 }}>
            {formatEur(trip.selectedFlight.priceEur)}
            <span style={{ fontSize: 11, fontFamily: "inherit", color: "var(--t3)", marginLeft: 6 }}>por persona</span>
          </div>
        </div>
      ) : (
        <div style={{ background: "#FEF9E7", border: "1px solid #F5C842", borderRadius: 12, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#8A6500" }}>
          ⚠️ Datos de vuelo no disponibles. Consulta directamente en Kiwi.com.
        </div>
      )}

      {/* Itinerary */}
      <h3 className="font-serif" style={{ fontSize: 20, fontWeight: 400, margin: "24px 0 16px" }}>Tu viaje paso a paso</h3>
      {trip.itinerary.map((day) => (
        <div key={day.day} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ background: "var(--t1)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 12 }}>Día {day.day}</span>
            <span style={{ fontSize: 13, color: "var(--t2)" }}>{day.title}</span>
          </div>
          <div style={{ position: "relative", paddingLeft: 26 }}>
            <div style={{ position: "absolute", left: 6, top: 0, bottom: 0, width: 1, background: "var(--brd)" }} />
            {day.items.map((item, idx) => {
              const isGreen = item.type === "included" || item.type === "transport";
              const isPurple = item.type === "suggested";
              return (
                <div key={idx} style={{ position: "relative", marginBottom: 10, background: isGreen ? "var(--teal-lt)" : isPurple ? "var(--purple-lt)" : "var(--white)", border: `1px solid ${isGreen ? "rgba(46,207,191,0.35)" : isPurple ? "rgba(155,143,232,0.3)" : "var(--brd)"}`, borderRadius: 12, padding: "11px 14px" }}>
                  <div style={{ position: "absolute", left: -22, top: 14, width: 9, height: 9, background: isGreen ? "var(--teal)" : isPurple ? "var(--purple)" : "var(--t3)", borderRadius: "50%", border: "2px solid var(--bg)" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--t3)" }}>{item.time}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 8, textTransform: "uppercase", background: isGreen ? "var(--teal-lt)" : "var(--purple-lt)", color: isGreen ? "var(--teal-dk)" : "var(--purple-dk)" }}>
                      {item.type === "included" ? "incluido" : item.type === "transport" ? "transporte" : "sugerencia"}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>{item.description}</div>
                  {item.priceEur !== null && (
                    <div style={{ fontSize: 12, color: "var(--teal-dk)", fontWeight: 500, marginTop: 5 }}>
                      {formatEur(item.priceEur)}
                      <button onClick={() => setSavedItems((p) => new Set([...p, `${day.day}-${idx}`]))} style={{ marginLeft: 10, fontSize: 11, color: savedItems.has(`${day.day}-${idx}`) ? "var(--teal)" : "var(--t3)", background: "none", border: "none", cursor: "pointer" }}>
                        {savedItems.has(`${day.day}-${idx}`) ? "✓ Añadido" : "+ Añadir"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Tips */}
      {trip.tips.length > 0 && (
        <>
          <h3 className="font-serif" style={{ fontSize: 20, fontWeight: 400, margin: "24px 0 14px" }}>Consejos para disfrutar al máximo</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
            {trip.tips.map((tip) => (
              <div key={tip.title} style={{ background: "var(--white)", border: "1px solid var(--brd)", borderRadius: 12, padding: 12 }}>
                <div style={{ width: 28, height: 28, background: "var(--teal-lt)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, fontSize: 14 }}>{tip.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{tip.title}</div>
                <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>{tip.body}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Experiences */}
      {trip.recommendedExperiences.length > 0 && (
        <>
          <h3 className="font-serif" style={{ fontSize: 20, fontWeight: 400, margin: "24px 0 14px" }}>Experiencias locales que te encantarán</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
            {trip.recommendedExperiences.map((exp) => (
              <div key={exp.id} style={{ background: "var(--white)", border: "1px solid var(--brd)", borderRadius: 12, overflow: "hidden" }}>
                {exp.imageUrl
                  ? <img src={exp.imageUrl} alt={exp.title} style={{ width: "100%", height: 100, objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: 100, background: "var(--teal-lt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🎯</div>}
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{exp.title}</div>
                  <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 6, lineHeight: 1.4 }}>{exp.description}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                    <span style={{ color: "var(--teal-dk)", fontWeight: 600 }}>{formatEur(exp.priceEur)}</span>
                    <span style={{ color: "var(--t3)" }}>⏱ {exp.durationHours}h</span>
                  </div>
                  <EstimateFlag isEstimate={exp.source === "simulated"} />
                  <button style={{ width: "100%", marginTop: 8, background: "none", border: "1.5px solid var(--brd)", borderRadius: 16, padding: "6px", fontSize: 12, cursor: "pointer" }}>
                    + Añadir a mi viaje
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Hotel */}
      {trip.selectedHotel ? (
        <>
          <h3 className="font-serif" style={{ fontSize: 20, fontWeight: 400, margin: "24px 0 14px" }}>Alojamiento sugerido</h3>
          <div style={{ background: "var(--white)", border: "1px solid var(--brd)", borderRadius: 12, padding: 16, marginBottom: 24, display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{trip.selectedHotel.name}</span>
                <Badge variant={trip.selectedHotel.source === "simulated" ? "yellow" : "live"}>
                  {trip.selectedHotel.source === "simulated" ? "estimado" : "verificado"}
                </Badge>
              </div>
              <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 8 }}>📍 {trip.selectedHotel.city}, {trip.selectedHotel.country} · {"★".repeat(trip.selectedHotel.starRating)} · ⭐ {trip.selectedHotel.reviewScore}/10</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {trip.selectedHotel.amenities.slice(0, 4).map((a) => (
                  <span key={a} style={{ fontSize: 10, background: "#F4F4F2", color: "#555", padding: "2px 6px", borderRadius: 6 }}>{a}</span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="font-serif" style={{ fontSize: 22, color: "var(--teal-dk)" }}>{formatEur(trip.selectedHotel.pricePerNightEur)}</div>
              <div style={{ fontSize: 11, color: "var(--t3)" }}>por noche</div>
              <a href={trip.selectedHotel.deepLink} target="_blank" rel="noopener noreferrer" style={{ display: "block", marginTop: 8, background: "var(--teal)", color: "#fff", padding: "7px 16px", borderRadius: 16, fontSize: 12, textDecoration: "none", fontWeight: 500 }}>Ver en {trip.selectedHotel.source}</a>
            </div>
          </div>
        </>
      ) : (
        <div style={{ background: "#FEF9E7", border: "1px solid #F5C842", borderRadius: 12, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#8A6500" }}>
          ⚠️ Datos de alojamiento no disponibles. Consulta en Booking.com.
        </div>
      )}

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg,var(--teal),var(--purple))", borderRadius: 16, padding: 32, textAlign: "center", color: "#fff", marginBottom: 32 }}>
        <h3 className="font-serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>¿Preparado para vivir esta aventura?</h3>
        <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 20 }}>Total estimado: {formatEur(trip.totalPriceEur)} por persona</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={() => router.push(`/checkout?destination=${encodeURIComponent(destination)}&${sp.toString()}`)} style={{ background: "#fff", color: "var(--teal-dk)", border: "none", borderRadius: 20, padding: "10px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            Finalizar reserva
          </button>
          <button onClick={() => router.back()} style={{ background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.6)", borderRadius: 20, padding: "10px 24px", fontSize: 14, cursor: "pointer" }}>
            Ver otros destinos
          </button>
        </div>
      </div>
    </div>
  );
}

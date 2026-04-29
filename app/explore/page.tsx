"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepBar } from "@/components/ui/StepBar";
import { Button } from "@/components/ui/index";

const TRAVEL_TYPES = [
  { id: "Aventura", emoji: "🏔", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&q=70" },
  { id: "Deportivo", emoji: "🏄", img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&q=70" },
  { id: "Gastronomía", emoji: "🍽", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=70" },
  { id: "Urbano", emoji: "🏙", img: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=300&q=70" },
  { id: "Familiar", emoji: "👨‍👩‍👧", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=70" },
  { id: "Tropical", emoji: "🌴", img: "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=300&q=70" },
  { id: "Wellness", emoji: "🧘", img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&q=70" },
  { id: "Cultural", emoji: "🏛", img: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=300&q=70" },
  { id: "Romántico", emoji: "🌅", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70" },
  { id: "Playa", emoji: "🏖", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=70" },
  { id: "Montaña", emoji: "⛰", img: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=300&q=70" },
  { id: "Lujo", emoji: "✨", img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300&q=70" },
];

const ORIGINS = [
  { iata: "CDG", label: "Paris CDG" },
  { iata: "BCN", label: "Barcelona BCN" },
  { iata: "MAD", label: "Madrid MAD" },
  { iata: "LHR", label: "London LHR" },
];

const STEPS = [{ label: "Tipo de viaje" }, { label: "Preferencias" }, { label: "Resultados" }];

export default function ExplorePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [budget, setBudget] = useState(800);
  const [days, setDays] = useState(7);
  const [origin, setOrigin] = useState("CDG");
  const [departureDate, setDepartureDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );
  const [flexible, setFlexible] = useState(false);
  const [needsAccommodation, setNeedsAccommodation] = useState(true);
  const [needsTransport, setNeedsTransport] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleType = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const surpriseMe = () => {
    const shuffled = [...TRAVEL_TYPES].sort(() => Math.random() - 0.5).slice(0, 3);
    setSelected(new Set(shuffled.map((t) => t.id)));
  };

  const handleSubmit = async () => {
    if (selected.size === 0) { setError("Selecciona al menos un tipo de viaje."); return; }
    setError(null);
    setLoading(true);

    const params = new URLSearchParams({
      origin,
      budget: String(budget),
      days: String(days),
      departureDate,
      flexible: String(flexible),
      travelTypes: [...selected].join(","),
      needsAccommodation: String(needsAccommodation),
      needsTransport: String(needsTransport),
    });

    router.push(`/explore/results?${params}`);
  };

  return (
    <div>
      <StepBar steps={STEPS} current={0} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px 24px" }}>
        <h2 className="font-serif" style={{ fontSize: 28, fontWeight: 400, marginBottom: 6 }}>
          ¿Qué tipo de viaje buscas?
        </h2>
        <p style={{ color: "var(--t2)", fontSize: 14, marginBottom: 28 }}>
          Cada momento pide una aventura diferente. Selecciona uno o varios.
        </p>

        {/* 4-col type grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
          {TRAVEL_TYPES.map((t) => {
            const isSelected = selected.has(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleType(t.id)}
                style={{
                  border: `2px solid ${isSelected ? "var(--teal)" : "transparent"}`,
                  borderRadius: 12, overflow: "hidden", cursor: "pointer", padding: 0,
                  background: "none", position: "relative",
                  boxShadow: isSelected ? "0 0 0 3px rgba(46,207,191,0.15)" : "none",
                  transition: "all 0.15s",
                }}
              >
                {isSelected && (
                  <span style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, background: "var(--teal)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, zIndex: 2 }}>✓</span>
                )}
                <img src={t.img} alt={t.id} style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
                <div style={{ background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 12, fontWeight: 500, padding: "6px 10px", textAlign: "left" }}>{t.id}</div>
              </button>
            );
          })}
        </div>

        <button onClick={surpriseMe} style={{ display: "block", margin: "0 auto 32px", background: "var(--white)", border: "1.5px solid var(--brd)", borderRadius: 20, padding: "8px 24px", fontSize: 13, cursor: "pointer" }}>
          ✦ Sorpréndeme
        </button>

        {/* Search params */}
        <div style={{ background: "var(--white)", border: "1px solid var(--brd)", borderRadius: 16, padding: 22 }}>
          <h4 style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>⚡ Afina tu búsqueda</h4>

          {/* Budget */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Presupuesto total</label>
              <span className="font-serif" style={{ fontSize: 28, color: "var(--teal)" }}>{budget.toLocaleString("es-ES")}€</span>
            </div>
            <input
              type="range" min={200} max={3000} step={50} value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--teal)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--t3)", marginTop: 4 }}>
              <span>200€</span><span>3.000€</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="Origen">
              <select value={origin} onChange={(e) => setOrigin(e.target.value)} style={inputStyle}>
                {ORIGINS.map((o) => <option key={o.iata} value={o.iata}>{o.label}</option>)}
              </select>
            </Field>
            <Field label={`Días disponibles: ${days}`}>
              <input type="range" min={2} max={21} value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ width: "100%", marginTop: 8, accentColor: "var(--teal)" }} />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Field label="Fecha de salida">
              <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Opciones">
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={flexible} onChange={(e) => setFlexible(e.target.checked)} style={{ accentColor: "var(--teal)" }} />
                  Fechas flexibles (±3 días)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={needsAccommodation} onChange={(e) => setNeedsAccommodation(e.target.checked)} style={{ accentColor: "var(--teal)" }} />
                  Incluir alojamiento
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={needsTransport} onChange={(e) => setNeedsTransport(e.target.checked)} style={{ accentColor: "var(--teal)" }} />
                  Incluir vuelo
                </label>
              </div>
            </Field>
          </div>

          {error && <p style={{ color: "red", fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: "100%", background: loading ? "var(--teal-lt)" : "var(--teal)", color: loading ? "var(--teal-dk)" : "#fff", border: "none", padding: 13, borderRadius: 28, fontSize: 15, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {loading ? <><span className="spinner" /> Buscando destinos…</> : "Descubre tu escapada →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1.5px solid var(--brd)", borderRadius: 8, padding: "9px 12px",
  fontSize: 13, fontFamily: "inherit", color: "var(--t1)", outline: "none",
  background: "var(--bg)", width: "100%",
};

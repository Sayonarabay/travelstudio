"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StepBar } from "@/components/ui/StepBar";
import { Spinner } from "@/components/ui/index";
import { DestinationCard } from "@/components/explore/DestinationCard";
import type { ApiResponse } from "@/types";

interface DestinationSummary {
  name: string; city: string; country: string;
  tags: string[]; estimatedPriceEur: number;
  priceIsEstimate: true; heroImageQuery: string;
}

const STEPS = [{ label: "Tipo de viaje" }, { label: "Preferencias" }, { label: "Resultados" }];

const ALL_TYPES = ["Urbano", "Tropical", "Aventura", "Cultural", "Playa", "Wellness", "Gastronomía"];

export default function ResultsPage() {
  const sp = useSearchParams();
  const [dests, setDests] = useState<DestinationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const budget = sp.get("budget") ?? "9999";
  const types = sp.get("travelTypes") ?? "";

  useEffect(() => {
    const params = new URLSearchParams({ types, budget });
    fetch(`/api/search-destinations?${params}`)
      .then((r) => r.json())
      .then((json: ApiResponse<DestinationSummary[]>) => {
        if (json.ok) setDests(json.data);
        else setError(json.error);
      })
      .catch(() => setError("Error al cargar destinos"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeFilter === "all"
    ? dests
    : dests.filter((d) => d.tags.includes(activeFilter));

  const meta = `${types || "Todos"} · Hasta ${Number(budget).toLocaleString("es-ES")}€ · Resultados verificados`;

  return (
    <div>
      <StepBar steps={STEPS} current={2} />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 4 }}>Experiencias seleccionadas para ti</h2>
            <div style={{ fontSize: 13, color: "var(--t2)" }}>{loading ? "Consultando proveedores…" : meta}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {loading && <Spinner label="Consultando APIs…" />}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {["all", ...ALL_TYPES].map((t) => (
            <button
              key={t}
              onClick={() => setActiveFilter(t)}
              style={{
                border: `1.5px solid ${activeFilter === t ? "var(--teal)" : "var(--brd)"}`,
                borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 500,
                cursor: "pointer",
                background: activeFilter === t ? "var(--teal-lt)" : "var(--white)",
                color: activeFilter === t ? "var(--teal-dk)" : "var(--t2)",
              }}
            >
              {t === "all" ? "Todos" : t}
            </button>
          ))}
        </div>

        {/* Grid */}
        {error ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--t2)", background: "var(--white)", borderRadius: 16, border: "1px solid var(--brd)" }}>
            <p style={{ fontSize: 15, marginBottom: 12 }}>⚠️ {error}</p>
            <a href="/explore" style={{ color: "var(--teal)" }}>← Modificar búsqueda</a>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16, marginBottom: 28 }}>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                : filtered.map((d) => (
                    <DestinationCard key={d.name} {...d} searchParams={sp.toString()} />
                  ))}
            </div>

            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 24px", background: "linear-gradient(135deg,var(--teal-lt),var(--purple-lt))", borderRadius: 16 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>✦</div>
                <h4 className="font-serif" style={{ fontSize: 20, marginBottom: 6, fontWeight: 400 }}>¿No encuentras lo que buscas?</h4>
                <p style={{ fontSize: 13, color: "var(--t2)", marginBottom: 16 }}>Amplía los filtros o aumenta el presupuesto.</p>
                <a href="/explore" style={{ background: "var(--teal)", color: "#fff", padding: "10px 24px", borderRadius: 20, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
                  Modificar búsqueda
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "var(--white)", border: "1px solid var(--brd)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ width: "100%", height: 160, background: "#F0F0EE", animation: "pulse 1.5s infinite" }} />
      <div style={{ padding: 14 }}>
        <div style={{ height: 10, background: "#F0F0EE", borderRadius: 6, marginBottom: 8, width: "60%" }} />
        <div style={{ height: 20, background: "#F0F0EE", borderRadius: 6, marginBottom: 8 }} />
        <div style={{ height: 14, background: "#F0F0EE", borderRadius: 6, width: "40%" }} />
      </div>
    </div>
  );
}

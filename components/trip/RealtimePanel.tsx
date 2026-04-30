"use client";

import { useState } from "react";
import type { RealtimeSearchResult } from "@/app/api/realtime-search/route";

interface RealtimePanelProps {
  destination: string;
}

const CATEGORY_CONFIG = {
  precio:   { icon: "💶", label: "Precio",   color: "var(--teal-lt)",   text: "var(--teal-dk)" },
  clima:    { icon: "🌤",  label: "Clima",    color: "#EEF6FF",          text: "#1A56A0" },
  eventos:  { icon: "🎭",  label: "Eventos",  color: "var(--purple-lt)", text: "var(--purple-dk)" },
  alertas:  { icon: "⚠️",  label: "Alerta",   color: "var(--yellow-lt)", text: "#8A6500" },
  general:  { icon: "ℹ️",  label: "Info",     color: "#F4F4F2",          text: "#444" },
};

export function RealtimePanel({ destination }: RealtimePanelProps) {
  const [data, setData] = useState<RealtimeSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const search = async (query?: string) => {
    setLoading(true);
    setError(null);
    setExpanded(true);

    try {
      const res = await fetch("/api/realtime-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, query: query || undefined }),
      });

      const json = await res.json();
      if (json.ok) {
        setData(json.data);
      } else {
        setError(json.error);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--white)", border: "1px solid var(--brd)", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
      {/* Header */}
      <div
        style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: expanded ? "var(--white)" : "var(--bg)" }}
        onClick={() => !data && !loading && search()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="live-dot" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--teal-dk)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Datos en tiempo real
            </span>
          </div>
          <span style={{ fontSize: 12, color: "var(--t2)" }}>· {destination}</span>
          {data?.usedWebSearch && (
            <span style={{ fontSize: 10, background: "var(--teal)", color: "#fff", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
              Web Search activo
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); if (!data && !loading) search(); else setExpanded((v) => !v); }}
          style={{ background: loading ? "var(--teal-lt)" : "var(--teal)", color: loading ? "var(--teal-dk)" : "#fff", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        >
          {loading ? (
            <><span className="spinner" style={{ width: 12, height: 12 }} />Buscando…</>
          ) : data ? (
            expanded ? "▲ Cerrar" : "▼ Ver"
          ) : (
            "🔍 Buscar ahora"
          )}
        </button>
      </div>

      {/* Content */}
      {expanded && (
        <div style={{ borderTop: "1px solid var(--brd)", padding: "16px 18px" }}>
          {error && (
            <div style={{ background: "var(--yellow-lt)", border: "1px solid rgba(245,200,66,0.5)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#7A5800", marginBottom: 12 }}>
              ⚠️ {error}
            </div>
          )}

          {data && (
            <>
              {/* Summary */}
              <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, marginBottom: 14, fontStyle: "italic" }}>
                {data.summary}
              </p>

              {/* Data points grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, marginBottom: 14 }}>
                {data.dataPoints.map((dp, i) => {
                  const cfg = CATEGORY_CONFIG[dp.category] ?? CATEGORY_CONFIG.general;
                  return (
                    <div key={i} style={{ background: cfg.color, borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                        <span style={{ fontSize: 13 }}>{cfg.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: cfg.text, textTransform: "uppercase", letterSpacing: "0.4px" }}>{dp.label}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--t1)", lineHeight: 1.4 }}>{dp.value}</div>
                      {dp.source && (
                        <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {dp.source.startsWith("http") ? (
                            <a href={dp.source} target="_blank" rel="noopener noreferrer" style={{ color: "var(--teal-dk)" }}>Fuente</a>
                          ) : dp.source}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 12 }}>
                Actualizado: {new Date(data.searchedAt).toLocaleTimeString("es-ES")}
                {data.usedWebSearch && " · Datos obtenidos con búsqueda web en tiempo real"}
              </div>
            </>
          )}

          {/* Custom query */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && customQuery.trim() && search(customQuery)}
              placeholder={`Pregunta algo sobre ${destination}…`}
              style={{ flex: 1, border: "1.5px solid var(--brd)", borderRadius: 20, padding: "8px 14px", fontSize: 13, fontFamily: "inherit", outline: "none", background: "var(--bg)" }}
            />
            <button
              onClick={() => customQuery.trim() && search(customQuery)}
              disabled={loading || !customQuery.trim()}
              style={{ background: "var(--teal)", color: "#fff", border: "none", borderRadius: 20, padding: "8px 16px", fontSize: 13, cursor: "pointer", opacity: customQuery.trim() ? 1 : 0.5 }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

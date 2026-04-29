"use client";

import Link from "next/link";
import { EstimateFlag, Badge } from "@/components/ui/index";
import { formatEur, unsplashUrl } from "@/lib/utils";

interface DestinationCardProps {
  name: string;
  city: string;
  country: string;
  tags: string[];
  estimatedPriceEur: number;
  priceIsEstimate: boolean;
  heroImageQuery: string;
  searchParams: string; // forward current search params to trip page
}

export function DestinationCard({
  name, city, country, tags, estimatedPriceEur, priceIsEstimate,
  heroImageQuery, searchParams,
}: DestinationCardProps) {
  const href = `/trip/${encodeURIComponent(name)}?${searchParams}`;

  return (
    <Link
      href={href}
      style={{
        display: "block",
        background: "var(--white)",
        border: "1px solid var(--brd)",
        borderRadius: 16,
        overflow: "hidden",
        textDecoration: "none",
        color: "var(--t1)",
        transition: "all 0.2s",
      }}
      className="dest-card"
    >
      <div style={{ position: "relative" }}>
        <img
          src={unsplashUrl(heroImageQuery, 600, 300)}
          alt={name}
          style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
          loading="lazy"
        />
        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 11, padding: "3px 8px", borderRadius: 10, backdropFilter: "blur(4px)" }}>
          ★ Recomendado
        </div>
      </div>

      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
          {tags.slice(0, 2).map((t, i) => (
            <Badge key={t} variant={i === 0 ? "teal" : "gray"}>{t}</Badge>
          ))}
        </div>

        <div className="font-serif" style={{ fontSize: 19, marginBottom: 3, fontWeight: 400 }}>{name}</div>
        <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 10 }}>📍 {city}, {country}</div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 2 }}>
              Desde <EstimateFlag isEstimate={priceIsEstimate} />
            </div>
            <div className="font-serif" style={{ fontSize: 22 }}>
              {formatEur(estimatedPriceEur)}
              <span style={{ fontSize: 11, color: "var(--t3)", fontFamily: "inherit" }}> /persona</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={(e) => e.preventDefault()}
            style={{ flex: 1, background: "none", border: "1.5px solid var(--brd)", borderRadius: 20, padding: 8, fontSize: 13, cursor: "pointer" }}
          >
            + Guardar
          </button>
          <div style={{ flex: 1, background: "var(--teal)", color: "#fff", borderRadius: 20, padding: 8, fontSize: 13, fontWeight: 500, textAlign: "center" }}>
            Ver itinerario →
          </div>
        </div>
      </div>
    </Link>
  );
}

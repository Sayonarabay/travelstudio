import { Suspense } from "react";

export default function TripLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "calc(100vh - 52px)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
          <span className="spinner" />
          <span style={{ fontSize: 13, color: "var(--t2)" }}>Generando tu itinerario…</span>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

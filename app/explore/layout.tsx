import { Suspense } from "react";

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "calc(100vh - 52px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="spinner" style={{ marginRight: 10 }} />
          <span style={{ fontSize: 14, color: "var(--t2)" }}>Cargando…</span>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

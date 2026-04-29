"use client";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ConfirmationPage() {
  const sp = useSearchParams();
  const destination = decodeURIComponent(sp.get("destination") ?? "tu destino");

  return (
    <div style={{ minHeight: "calc(100vh - 52px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 440, textAlign: "center" }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
        <div style={{ display: "inline-block", background: "var(--teal)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 16px", borderRadius: 20, marginBottom: 16, letterSpacing: "0.5px" }}>
          RESERVA CONFIRMADA
        </div>
        <h2 className="font-serif" style={{ fontSize: 30, fontWeight: 400, marginBottom: 10 }}>¡Listo para despegar!</h2>
        <p style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.65, marginBottom: 24 }}>
          Tu itinerario a <strong>{destination}</strong> ha sido enviado a tu email. Las confirmaciones llegarán en las próximas horas.
        </p>

        <div style={{ background: "var(--white)", border: "1px solid var(--brd)", borderRadius: 12, padding: 18, textAlign: "left", marginBottom: 24 }}>
          <h5 style={{ fontWeight: 600, fontSize: 13, color: "var(--teal-dk)", marginBottom: 10 }}>Próximos pasos</h5>
          {["Confirma tu email en las próximas 2h", "Descarga el itinerario en PDF", "Activa alertas de precio para extras"].map((s, i) => (
            <div key={i} style={{ fontSize: 13, color: "var(--t2)", padding: "4px 0", display: "flex", gap: 8 }}>
              <span style={{ color: "var(--teal)", fontWeight: 600 }}>{i + 1}.</span>{s}
            </div>
          ))}
        </div>

        <Link href="/explore" style={{ display: "inline-block", background: "var(--teal)", color: "#fff", padding: "13px 32px", borderRadius: 28, fontSize: 15, fontWeight: 500, textDecoration: "none" }}>
          Planificar otro viaje
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const destination = sp.get("destination") ?? "Destino";
  const budget = Number(sp.get("budget") ?? 800);
  const [submitted, setSubmitted] = useState(false);

  const handleConfirm = () => {
    // In production: POST to /api/reservations (future endpoint)
    router.push(`/confirmation?destination=${encodeURIComponent(destination)}`);
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px" }}>
      <button onClick={() => router.back()} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--t2)", background: "none", border: "none", cursor: "pointer", marginBottom: 22 }}>
        ← Volver al itinerario
      </button>

      <h2 className="font-serif" style={{ fontSize: 28, fontWeight: 400, marginBottom: 6 }}>Finalizar reserva</h2>
      <p style={{ color: "var(--t2)", marginBottom: 28 }}>Solo un paso más para confirmar tu aventura.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 24, alignItems: "start" }}>
        {/* Form */}
        <div>
          <FormBlock title="Información de contacto">
            <Field label="Nombre completo"><input type="text" placeholder="Juan Pérez" style={input} /></Field>
            <Field label="Email"><input type="email" placeholder="juan@example.com" style={input} /></Field>
            <Field label="Teléfono"><input type="tel" placeholder="+34 600 000 000" style={input} /></Field>
          </FormBlock>

          <FormBlock title="Información de pago">
            <div style={{ background: "var(--yellow-lt)", border: "1px solid rgba(245,200,66,0.5)", borderRadius: 8, padding: "9px 12px", fontSize: 11, color: "#7A5800", marginBottom: 12 }}>
              🔒 Pago seguro con Stripe. No guardamos tu información bancaria.
            </div>
            <Field label="Número de tarjeta"><input type="text" placeholder="•••• •••• •••• ••••" style={input} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Caducidad"><input type="text" placeholder="MM/AA" style={input} /></Field>
              <Field label="CVV"><input type="text" placeholder="•••" style={input} /></Field>
            </div>
          </FormBlock>

          <button
            onClick={handleConfirm}
            style={{ width: "100%", background: "var(--teal)", color: "#fff", border: "none", padding: 13, borderRadius: 28, fontSize: 15, fontWeight: 500, cursor: "pointer", marginTop: 4 }}
          >
            ⚡ Confirmar y pagar ~{budget.toLocaleString("es-ES")}€
          </button>

          <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 10, textAlign: "center" }}>
            Al confirmar aceptas los <a href="#" style={{ color: "var(--teal)" }}>términos de servicio</a>. Cancelación gratuita 48h antes.
          </p>
        </div>

        {/* Summary */}
        <div style={{ background: "var(--teal-lt)", border: "1px solid rgba(46,207,191,0.3)", borderRadius: 16, padding: 18, position: "sticky", top: 62 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--teal-dk)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>Resumen</div>
          <div className="font-serif" style={{ fontSize: 18, marginBottom: 14 }}>{decodeURIComponent(destination)}</div>
          <div style={{ borderTop: "1px solid rgba(46,207,191,0.3)", paddingTop: 12 }}>
            <SummaryLine label="Transportes" value="~incluido" />
            <SummaryLine label="Alojamientos" value="~incluido" />
            <SummaryLine label="Experiencias" value="~45€" />
            <div style={{ borderTop: "1px solid rgba(46,207,191,0.4)", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
              <span className="font-serif" style={{ fontSize: 16 }}>Total</span>
              <span className="font-serif" style={{ fontSize: 16, color: "var(--teal-dk)" }}>~{budget.toLocaleString("es-ES")}€</span>
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "var(--teal-dk)" }}>
            <div>✓ Cancelación gratuita 48h antes</div>
            <div>✓ Mejor precio garantizado</div>
            <div>✓ Soporte 24/7 durante tu viaje</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--white)", border: "1px solid var(--brd)", borderRadius: 16, padding: 20, marginBottom: 14 }}>
      <h4 style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>{title}</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
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

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, color: "var(--t2)" }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

const input: React.CSSProperties = {
  border: "1.5px solid var(--brd)", borderRadius: 8, padding: "9px 12px",
  fontSize: 13, fontFamily: "inherit", color: "var(--t1)", outline: "none",
  background: "var(--bg)", width: "100%",
};

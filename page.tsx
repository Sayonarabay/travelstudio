import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ background:"radial-gradient(ellipse 90% 50% at 50% -10%,#D6F5F2 0%,transparent 65%),var(--bg)", minHeight:"calc(100vh - 52px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <div style={{ maxWidth:560, margin:"0 auto", padding:"80px 24px 60px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"var(--white)", border:"1px solid var(--brd)", borderRadius:20, padding:"5px 14px", fontSize:12, color:"var(--t2)", marginBottom:28 }}>
          <span className="live-dot" />
          Más de 10.000 viajeros nos han descubierto
        </div>
        <h1 className="font-serif" style={{ fontSize:"clamp(38px,6vw,54px)", lineHeight:1.05, marginBottom:16, fontWeight:400 }}>
          Tu próximo viaje<br />en <span style={{ color:"var(--teal)" }}>3 clics</span>
        </h1>
        <p style={{ fontSize:16, color:"var(--t2)", marginBottom:36, lineHeight:1.65 }}>
          Dinos cómo te sientes y te mostramos el plan perfecto.<br />Reservas reales, precios transparentes.
        </p>
        <Link href="/explore" style={{ display:"inline-block", background:"var(--teal)", color:"#fff", padding:"13px 32px", borderRadius:28, fontSize:15, fontWeight:500, textDecoration:"none", boxShadow:"0 4px 20px rgba(46,207,191,0.35)" }}>
          Empezar ahora →
        </Link>
        <div style={{ display:"flex", gap:48, justifyContent:"center", marginTop:56, paddingTop:40, borderTop:"1px solid var(--brd)" }}>
          {[{n:"150+",l:"Destinos únicos"},{n:"10K+",l:"Viajes creados"},{n:"4.9★",l:"Valoración media"}].map(({n,l})=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div className="font-serif" style={{ fontSize:26 }}>{n}</div>
              <div style={{ fontSize:12, color:"var(--t3)", marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const path = usePathname();

  return (
    <nav
      style={{
        background: "var(--white)",
        borderBottom: "1px solid var(--brd)",
        padding: "0 32px",
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 200,
      }}
    >
      <Link href="/" style={{ fontWeight: 600, fontSize: 15, textDecoration: "none", color: "var(--t1)" }}>
        Travel<span style={{ color: "var(--teal)" }}>Studio</span>
      </Link>

      <div style={{ display: "flex", gap: 24 }}>
        {[
          { href: "/", label: "Home" },
          { href: "/explore", label: "Explorar" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontSize: 13,
              color: path === href ? "var(--teal)" : "var(--t2)",
              textDecoration: "none",
              fontWeight: path === href ? 500 : 400,
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      <Link
        href="/explore"
        style={{
          background: "var(--teal)",
          color: "#fff",
          border: "none",
          padding: "7px 18px",
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          textDecoration: "none",
        }}
      >
        Empezar
      </Link>
    </nav>
  );
}

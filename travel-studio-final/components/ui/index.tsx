import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

// ── Button ────────────────────────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "teal" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({ variant = "teal", size = "md", className, children, ...props }: ButtonProps) {
  const base = "cursor-pointer font-medium rounded-full transition-all duration-150 font-sans";
  const variants = {
    teal: "bg-[var(--teal)] text-white border-none hover:bg-[var(--teal-dk)]",
    ghost: "bg-transparent text-[var(--t2)] border border-[var(--brd)] hover:border-[var(--teal)] hover:text-[var(--teal)]",
    outline: "bg-white text-[var(--t1)] border border-[var(--brd)] hover:border-[var(--teal)]",
  };
  const sizes = { sm: "px-4 py-1.5 text-xs", md: "px-6 py-2.5 text-sm", lg: "px-8 py-3 text-base" };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────

interface BadgeProps {
  variant?: "teal" | "purple" | "yellow" | "gray" | "live";
  children: ReactNode;
}

export function Badge({ variant = "teal", children }: BadgeProps) {
  const variants = {
    teal: "bg-[var(--teal-lt)] text-[var(--teal-dk)]",
    purple: "bg-[var(--purple-lt)] text-[var(--purple-dk)]",
    yellow: "bg-[var(--yellow-lt)] text-[#8A6500]",
    gray: "bg-[#F1F1EF] text-[#555]",
    live: "bg-[var(--teal-lt)] text-[var(--teal-dk)] flex items-center gap-1",
  };

  return (
    <span
      style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.3px", display: "inline-flex", alignItems: "center", gap: 4 }}
      className={variants[variant]}
    >
      {variant === "live" && <span className="live-dot" />}
      {children}
    </span>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────

export function Spinner({ label }: { label?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--t2)" }}>
      <span className="spinner" />
      {label}
    </span>
  );
}

// ── EstimateFlag ──────────────────────────────────────────────────────────────

export function EstimateFlag({ isEstimate }: { isEstimate: boolean }) {
  return isEstimate ? (
    <Badge variant="yellow">estimación</Badge>
  ) : (
    <Badge variant="live">verificado</Badge>
  );
}

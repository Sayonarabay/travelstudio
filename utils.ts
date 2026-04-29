import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatEur(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/** Unsplash source URL (no API key needed for open-access images) */
export function unsplashUrl(query: string, width = 800, height = 500): string {
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}`;
}

export function iataToCity(iata: string): string {
  const map: Record<string, string> = {
    CDG: "Paris", BCN: "Barcelona", MAD: "Madrid", LHR: "London",
    NRT: "Tokyo", DPS: "Bali", RVN: "Rovaniemi", LIS: "Lisbon", AGP: "Málaga",
  };
  return map[iata] ?? iata;
}

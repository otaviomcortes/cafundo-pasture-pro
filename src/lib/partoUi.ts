import type { SexoBezerro } from "@/domain";

export const SEXO_LABEL: Record<SexoBezerro, string> = {
  macho: "Macho",
  femea: "Fêmea",
};

export const SEXO_BADGE: Record<SexoBezerro, string> = {
  macho: "bg-info/15 text-info border-info/30",
  femea: "bg-primary/10 text-primary border-primary/30",
};

export const RACAS_BEZERRO = [
  "Nelore",
  "Cruza Nelore x Angus",
  "Brahman",
  "Angus",
];

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function toDateInput(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

export function fromDateInput(value: string): string {
  // value is yyyy-mm-dd → store as ISO at noon UTC to avoid TZ off-by-one
  return new Date(`${value}T12:00:00.000Z`).toISOString();
}

import type { StatusLoteFrigorifico } from "@/domain";

export const STATUS_LOTE_LABEL: Record<StatusLoteFrigorifico, string> = {
  em_confinamento: "Em confinamento",
  finalizado: "Finalizado",
};

export const STATUS_LOTE_BADGE: Record<StatusLoteFrigorifico, string> = {
  em_confinamento: "bg-info/15 text-info border-info/30",
  finalizado: "bg-muted text-muted-foreground border-border",
};

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function toDateInput(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

export function fromDateInput(value: string): string {
  return new Date(`${value}T12:00:00.000Z`).toISOString();
}

export function formatReais(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

import type {
  StatusProtocoloIatf,
  DiagnosticoPrenhez,
} from "@/domain";

export const STATUS_PROTOCOLO_LABEL: Record<StatusProtocoloIatf, string> = {
  planejado: "Planejado",
  em_andamento: "Em andamento",
  aguardando_diagnostico: "Aguardando diagnóstico",
  finalizado: "Finalizado",
};

export const STATUS_PROTOCOLO_BADGE: Record<StatusProtocoloIatf, string> = {
  planejado: "bg-muted text-muted-foreground border-border",
  em_andamento: "bg-info/15 text-info border-info/30",
  aguardando_diagnostico: "bg-warning/25 text-warning-foreground border-warning/50",
  finalizado: "bg-success/15 text-success border-success/30",
};

export const DIAGNOSTICO_LABEL: Record<DiagnosticoPrenhez, string> = {
  prenha: "Prenha",
  vazia: "Vazia",
  nao_avaliada: "Não avaliada",
};

export const DIAGNOSTICO_BADGE: Record<DiagnosticoPrenhez, string> = {
  prenha: "bg-success/15 text-success border-success/30",
  vazia: "bg-warning/25 text-warning-foreground border-warning/50",
  nao_avaliada: "bg-muted text-muted-foreground border-border",
};

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function toInputDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

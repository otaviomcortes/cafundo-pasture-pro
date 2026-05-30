import type {
  MatrizStatus,
  SituacaoReprodutiva,
} from "@/domain";

export const STATUS_LABEL: Record<MatrizStatus, string> = {
  ativa: "Ativa",
  descartada: "Descartada",
  vendida: "Vendida",
  morta: "Morta",
};

export const SITUACAO_LABEL: Record<SituacaoReprodutiva, string> = {
  apta: "Apta",
  prenha: "Prenha",
  vazia: "Vazia",
  em_protocolo: "Em protocolo",
};

// Padronização de cores dos badges.
export const STATUS_BADGE: Record<MatrizStatus, string> = {
  // Ativa: verde discreto
  ativa: "bg-success/15 text-success border-success/30",
  // Descartada: vermelho
  descartada: "bg-destructive/10 text-destructive border-destructive/30",
  // Vendida: cinza
  vendida: "bg-muted text-muted-foreground border-border",
  // Morta: cinza escuro / preto
  morta: "bg-foreground/80 text-background border-foreground/80",
};

export const SITUACAO_BADGE: Record<SituacaoReprodutiva, string> = {
  // Apta: cinza/verde claro
  apta: "bg-success/10 text-success border-success/20",
  // Prenha: verde
  prenha: "bg-success/20 text-success border-success/40",
  // Vazia: amarelo/laranja
  vazia: "bg-warning/25 text-warning-foreground border-warning/50",
  // Em protocolo: azul
  em_protocolo: "bg-info/15 text-info border-info/30",
};

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function calcularIdade(dataNascimentoIso: string): string {
  const nasc = new Date(dataNascimentoIso);
  const hoje = new Date();
  let anos = hoje.getFullYear() - nasc.getFullYear();
  let meses = hoje.getMonth() - nasc.getMonth();
  if (hoje.getDate() < nasc.getDate()) meses -= 1;
  if (meses < 0) {
    anos -= 1;
    meses += 12;
  }
  if (anos <= 0) return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  if (meses === 0) return `${anos} ${anos === 1 ? "ano" : "anos"}`;
  return `${anos}a ${meses}m`;
}

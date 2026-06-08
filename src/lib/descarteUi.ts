import type { DestinoDescarte, MotivoDescarte } from "@/domain";

export const MOTIVO_DESCARTE_LABEL: Record<MotivoDescarte, string> = {
  vazia: "Vazia",
  aborto: "Aborto",
  baixo_desempenho_reprodutivo: "Baixo desempenho reprodutivo",
  baixo_escore_visual: "Baixo escore visual",
  dificuldade_manejo: "Dificuldade de manejo",
  idade: "Idade",
  problema_sanitario: "Problema sanitário",
  outro: "Outro",
};

export const DESTINO_DESCARTE_LABEL: Record<DestinoDescarte, string> = {
  frigorifico: "Frigorífico",
  leilao: "Leilão",
  venda_direta: "Venda direta",
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

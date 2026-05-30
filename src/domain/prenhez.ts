export type OrigemPrenhez = "iatf" | "monta_natural";
export type StatusPrenhez = "confirmada" | "perdida" | "finalizada";

export interface Prenhez {
  id: string;
  matrizId: string;
  origem: OrigemPrenhez;
  dataConfirmacao: string; // ISO date
  status: StatusPrenhez;
  observacoes?: string;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function gerarPrenhezes(qtd: number): Prenhez[] {
  const prenhezes: Prenhez[] = [];
  for (let i = 1; i <= qtd; i++) {
    prenhezes.push({
      id: `prenhez-${i}`,
      matrizId: `matriz-${i}`,
      origem: i % 3 === 0 ? "monta_natural" : "iatf",
      dataConfirmacao: isoDaysAgo(30 + (i % 180)),
      status: "confirmada",
      observacoes: undefined,
    });
  }
  return prenhezes;
}

// 120 prenhezes ativas
export const mockPrenhezes: Prenhez[] = gerarPrenhezes(120);

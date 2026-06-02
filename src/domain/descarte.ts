export type MotivoDescarte =
  | "idade"
  | "falha_reprodutiva"
  | "problema_sanitario"
  | "problema_locomotor"
  | "temperamento"
  | "outros";

export type DestinoDescarte = "frigorifico" | "leilao" | "venda_direta";

export interface Descarte {
  id: string;
  matrizId: string;
  dataDescarte: string; // ISO date
  motivo: MotivoDescarte;
  peso: number; // kg
  destino: DestinoDescarte;
  observacoes?: string;
}

const MOTIVOS: MotivoDescarte[] = [
  "idade",
  "falha_reprodutiva",
  "problema_sanitario",
  "problema_locomotor",
  "temperamento",
  "outros",
];

const DESTINOS: DestinoDescarte[] = ["frigorifico", "leilao", "venda_direta"];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function gerarDescartes(qtd: number): Descarte[] {
  const descartes: Descarte[] = [];
  // As matrizes descartadas nos mocks ocupam os índices 186..195 (ver matriz.ts).
  for (let i = 1; i <= qtd; i++) {
    descartes.push({
      id: `descarte-${i}`,
      matrizId: `matriz-${185 + i}`,
      dataDescarte: isoDaysAgo(i * 25),
      motivo: MOTIVOS[i % MOTIVOS.length],
      peso: 420 + ((i * 7) % 120),
      destino: DESTINOS[i % DESTINOS.length],
      observacoes: undefined,
    });
  }
  return descartes;
}

// 10 descartes no ano
export const mockDescartes: Descarte[] = gerarDescartes(10);

export type MotivoDescarte =
  | "vazia"
  | "aborto"
  | "baixo_desempenho_reprodutivo"
  | "baixo_escore_visual"
  | "dificuldade_manejo"
  | "idade"
  | "problema_sanitario"
  | "outro";

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

export const MOTIVOS_DESCARTE: MotivoDescarte[] = [
  "vazia",
  "aborto",
  "baixo_desempenho_reprodutivo",
  "baixo_escore_visual",
  "dificuldade_manejo",
  "idade",
  "problema_sanitario",
  "outro",
];

export const DESTINOS_DESCARTE: DestinoDescarte[] = [
  "frigorifico",
  "leilao",
  "venda_direta",
];

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
      motivo: MOTIVOS_DESCARTE[i % MOTIVOS_DESCARTE.length],
      peso: 420 + ((i * 7) % 120),
      destino: DESTINOS_DESCARTE[i % DESTINOS_DESCARTE.length],
      observacoes: undefined,
    });
  }
  return descartes;
}

// 10 descartes no ano
export const mockDescartes: Descarte[] = gerarDescartes(10);

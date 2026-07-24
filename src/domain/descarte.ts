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

export type TipoDescarte = "individual" | "lote";

export interface Descarte {
  id: string;
  matrizId: string;
  dataDescarte: string; // ISO date
  tipoDescarte: TipoDescarte;
  motivo?: MotivoDescarte; // opcional em descartes de lote
  peso?: number; // kg — opcional em descartes de lote (peso final vem do lote)
  destino?: DestinoDescarte; // lote implica frigorífico
  loteId?: string; // preenchido quando tipoDescarte = "lote"
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
      tipoDescarte: "individual",
      motivo: MOTIVOS_DESCARTE[i % MOTIVOS_DESCARTE.length],
      peso: 420 + ((i * 7) % 120),
      destino: DESTINOS_DESCARTE[i % DESTINOS_DESCARTE.length],
      observacoes: undefined,
    });
  }
  return descartes;
}

// 10 descartes individuais no ano
export const mockDescartes: Descarte[] = gerarDescartes(10);

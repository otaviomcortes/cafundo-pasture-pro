export type SexoBezerro = "macho" | "femea";

export interface Parto {
  id: string;
  matrizId: string;
  dataParto: string; // ISO date
  sexoBezerro: SexoBezerro;
  racaBezerro: string;
  observacoes?: string;
}

/**
 * Realidade da Fazenda Cafundó:
 *  - Bezerros predominantemente Nelore e Aberdeen.
 *  - Poucas exceções entram como "Outros" (raça livre).
 */
const RACAS_BEZERRO = [
  "Nelore",
  "Nelore",
  "Nelore",
  "Nelore",
  "Aberdeen",
  "Aberdeen",
  "Aberdeen",
  "Angus",
  "Brahman",
  "Senepol",
];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/**
 * Para manter consistência com as prenhezes ativas dos mocks, atribuímos
 * partos somente a matrizes ativas que NÃO estão prenhas (índices 116..185).
 * Assim evitamos o estado impossível "prenhez ativa + parto posterior".
 */
function gerarPartos(qtd: number): Parto[] {
  const partos: Parto[] = [];
  const inicio = 116;
  const fim = 185;
  const range = fim - inicio + 1; // 70 matrizes elegíveis
  for (let i = 1; i <= qtd; i++) {
    const matrizIndex = inicio + ((i * 3) % range);
    partos.push({
      id: `parto-${i}`,
      matrizId: `matriz-${matrizIndex}`,
      dataParto: isoDaysAgo(i * 2),
      sexoBezerro: i % 2 === 0 ? "femea" : "macho",
      racaBezerro: RACAS_BEZERRO[i % RACAS_BEZERRO.length],
      observacoes:
        i % 15 === 0 ? "Parto assistido pelo veterinário." : undefined,
    });
  }
  return partos;
}

// 190 partos no ano
export const mockPartos: Parto[] = gerarPartos(190);

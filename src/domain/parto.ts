export type SexoBezerro = "macho" | "femea";

export interface Parto {
  id: string;
  matrizId: string;
  dataParto: string; // ISO date
  sexoBezerro: SexoBezerro;
  racaBezerro: string;
  observacoes?: string;
}

const RACAS_BEZERRO = ["Nelore", "Cruza Nelore x Angus", "Brahman", "Angus"];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function gerarPartos(qtd: number): Parto[] {
  const partos: Parto[] = [];
  for (let i = 1; i <= qtd; i++) {
    partos.push({
      id: `parto-${i}`,
      matrizId: `matriz-${((i * 3) % 200) + 1}`,
      dataParto: isoDaysAgo(i * 2),
      sexoBezerro: i % 2 === 0 ? "femea" : "macho",
      racaBezerro: RACAS_BEZERRO[i % RACAS_BEZERRO.length],
      observacoes:
        i % 15 === 0
          ? "Parto assistido pelo veterinário."
          : undefined,
    });
  }
  return partos;
}

// 190 partos no ano
export const mockPartos: Parto[] = gerarPartos(190);

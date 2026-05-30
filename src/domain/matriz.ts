export type MatrizStatus = "ativa" | "descartada" | "vendida" | "morta";

export type SituacaoReprodutiva =
  | "apta"
  | "prenha"
  | "vazia"
  | "em_protocolo";

export interface Matriz {
  id: string;
  numeroBrinco: string;
  raca: string;
  dataNascimento: string; // ISO date
  status: MatrizStatus;
  situacaoReprodutiva: SituacaoReprodutiva;
  quantidadePartos: number;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

const RACAS = ["Nelore", "Brahman", "Angus", "Cruza Nelore x Angus", "Tabapuã"];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function gerarMatrizes(qtd: number): Matriz[] {
  const matrizes: Matriz[] = [];
  for (let i = 1; i <= qtd; i++) {
    const brinco = String(100 + i);
    const raca = RACAS[i % RACAS.length];
    const idadeDias = 365 * (3 + (i % 8)); // 3 a 10 anos

    // Distribuição: 200 ativas, 10 descartadas, 5 vendidas, 2 mortas (referência)
    let status: MatrizStatus = "ativa";
    if (i > 200 && i <= 210) status = "descartada";
    else if (i > 210 && i <= 215) status = "vendida";
    else if (i > 215) status = "morta";

    // Para ativas: 120 prenhas, 60 vazias, 20 em protocolo
    let situacao: SituacaoReprodutiva = "apta";
    if (status === "ativa") {
      if (i <= 120) situacao = "prenha";
      else if (i <= 180) situacao = "vazia";
      else situacao = "em_protocolo";
    } else {
      situacao = "vazia";
    }

    matrizes.push({
      id: `matriz-${i}`,
      numeroBrinco: brinco,
      raca,
      dataNascimento: isoDaysAgo(idadeDias),
      status,
      situacaoReprodutiva: situacao,
      quantidadePartos: Math.max(0, (i % 7)),
      observacoes: i % 25 === 0 ? "Boa mãe, histórico produtivo consistente." : undefined,
      criadoEm: isoDaysAgo(idadeDias),
      atualizadoEm: isoDaysAgo(i % 60),
    });
  }
  return matrizes;
}

export const mockMatrizes: Matriz[] = gerarMatrizes(217);

export type MatrizStatus = "ativa" | "descartada" | "vendida" | "morta";

export type SituacaoReprodutiva =
  | "apta"
  | "prenha"
  | "vazia"
  | "em_protocolo";

export type ProprietarioMatriz = "Jean" | "Eduardo" | "Gustavo" | "Otavio";

export const PROPRIETARIOS_MATRIZ: ProprietarioMatriz[] = [
  "Jean",
  "Eduardo",
  "Gustavo",
  "Otavio",
];

export const PROPRIETARIO_LABEL: Record<ProprietarioMatriz, string> = {
  Jean: "Jean",
  Eduardo: "Eduardo",
  Gustavo: "Gustavo",
  Otavio: "Otávio",
};

export interface Matriz {
  id: string;
  numeroBrinco: string;
  raca: string;
  proprietario: ProprietarioMatriz;
  dataNascimento: string; // ISO date
  status: MatrizStatus;
  situacaoReprodutiva: SituacaoReprodutiva;
  quantidadePartos: number;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

// A Fazenda Cafundó trabalha 100% com matrizes Nelore.
const RACA_MATRIZ = "Nelore";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function gerarMatrizes(qtd: number): Matriz[] {
  const matrizes: Matriz[] = [];
  for (let i = 1; i <= qtd; i++) {
    const brinco = String(100 + i);
    const raca = RACA_MATRIZ;
    const idadeDias = 365 * (3 + (i % 8)); // 3 a 10 anos

    // Distribuição total = 200: 185 ativas, 10 descartadas, 3 vendidas, 2 mortas.
    let status: MatrizStatus = "ativa";
    if (i > 185 && i <= 195) status = "descartada";
    else if (i > 195 && i <= 198) status = "vendida";
    else if (i > 198) status = "morta";

    // Para ativas (1..185): 115 prenhas, 55 vazias, 15 em protocolo.
    let situacao: SituacaoReprodutiva = "apta";
    if (status === "ativa") {
      if (i <= 115) situacao = "prenha";
      else if (i <= 170) situacao = "vazia";
      else situacao = "em_protocolo";
    } else {
      situacao = "vazia";
    }

    matrizes.push({
      id: `matriz-${i}`,
      numeroBrinco: brinco,
      raca,
      proprietario: PROPRIETARIOS_MATRIZ[i % PROPRIETARIOS_MATRIZ.length],
      dataNascimento: isoDaysAgo(idadeDias),
      status,
      situacaoReprodutiva: situacao,
      quantidadePartos: Math.max(0, i % 7),
      observacoes:
        i % 25 === 0 ? "Boa mãe, histórico produtivo consistente." : undefined,
      criadoEm: isoDaysAgo(idadeDias),
      atualizadoEm: isoDaysAgo(i % 60),
    });
  }
  return matrizes;
}

export const mockMatrizes: Matriz[] = gerarMatrizes(200);

export type MatrizInput = Omit<Matriz, "id" | "criadoEm" | "atualizadoEm">;

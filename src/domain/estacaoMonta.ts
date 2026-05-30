export type StatusEstacaoMonta = "planejada" | "em_andamento" | "encerrada";

export interface EstacaoMonta {
  id: string;
  nome: string;
  dataInicio: string; // ISO date
  dataFim: string; // ISO date
  status: StatusEstacaoMonta;
  observacoes?: string;
}

export const mockEstacoesMonta: EstacaoMonta[] = [
  {
    id: "estacao-2025",
    nome: "Estação de Monta 2025/2026",
    dataInicio: "2025-10-01T00:00:00.000Z",
    dataFim: "2026-02-28T00:00:00.000Z",
    status: "encerrada",
    observacoes: "Estação anterior, base para safra atual de partos.",
  },
  {
    id: "estacao-2026",
    nome: "Estação de Monta 2026/2027",
    dataInicio: "2026-10-01T00:00:00.000Z",
    dataFim: "2027-02-28T00:00:00.000Z",
    status: "planejada",
    observacoes: "Planejamento em andamento — meta de 200 matrizes.",
  },
  {
    id: "estacao-meio-2026",
    nome: "Estação de Monta Meio de Ano 2026",
    dataInicio: "2026-04-15T00:00:00.000Z",
    dataFim: "2026-07-15T00:00:00.000Z",
    status: "em_andamento",
    observacoes: "Estação curta para repasse das vazias.",
  },
];

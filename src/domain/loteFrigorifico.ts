export type StatusLoteFrigorifico = "em_confinamento" | "finalizado";

export interface LoteFrigorifico {
  id: string;
  nome: string;
  dataInicioConfinamento: string; // ISO
  dataEnvio?: string; // ISO — preenchida ao finalizar
  frigorifico?: string;
  pesoTotalInformado?: number; // kg (informado pelo frigorífico)
  valorRecebido?: number; // R$
  /** Média de arrobas de carcaça por matriz informada pelo frigorífico (@/matriz). */
  arrobasPorMatrizInformada?: number;
  observacoes?: string;
  status: StatusLoteFrigorifico;
  criadoEm: string;
  atualizadoEm: string;
}

export interface LoteMatriz {
  id: string;
  loteId: string;
  matrizId: string;
  pesoInicial?: number; // kg — entrada no confinamento
  pesoFinal?: number; // kg — envio ao frigorífico
}

export type LoteFrigorificoInput = Omit<
  LoteFrigorifico,
  "id" | "criadoEm" | "atualizadoEm" | "status" | "dataEnvio"
>;

export type LoteMatrizInput = Omit<LoteMatriz, "id">;

export const STATUS_LOTE_LABEL: Record<StatusLoteFrigorifico, string> = {
  em_confinamento: "Em confinamento",
  finalizado: "Finalizado",
};

// Nenhum lote mockado inicialmente. O usuário cria conforme necessidade.
export const mockLotesFrigorifico: LoteFrigorifico[] = [];
export const mockLoteMatrizes: LoteMatriz[] = [];

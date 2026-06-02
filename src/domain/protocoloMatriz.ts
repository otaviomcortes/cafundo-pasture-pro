import { mockMatrizes } from "./matriz";
import { mockProtocolosIatf } from "./protocoloIatf";

export type DiagnosticoPrenhez = "prenha" | "vazia" | "nao_avaliada";

export interface ProtocoloMatriz {
  id: string;
  protocoloId: string;
  matrizId: string;
  etapa1Concluida: boolean;
  etapa1Data?: string;
  etapa2Concluida: boolean;
  etapa2Data?: string;
  etapa3Concluida: boolean;
  etapa3Data?: string;
  diagnosticoPrenhez: DiagnosticoPrenhez;
  dataDiagnostico?: string;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export type ProtocoloMatrizInput = Omit<
  ProtocoloMatriz,
  "id" | "criadoEm" | "atualizadoEm"
>;

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// Matrizes elegíveis: ativas. Para protocolos "planejado", excluir prenhas.
function gerarParticipacoes(): ProtocoloMatriz[] {
  const participacoes: ProtocoloMatriz[] = [];
  let seq = 1;

  // Regra de consistência: matriz em protocolo não pode estar prenha nem
  // descartada/vendida/morta. Só consideramos ativas e não prenhas.
  const elegivelGlobal = mockMatrizes.filter(
    (m) => m.status === "ativa" && m.situacaoReprodutiva !== "prenha",
  );

  for (const protocolo of mockProtocolosIatf) {
    const alvo =
      protocolo.id === "protocolo-1"
        ? 64
        : protocolo.id === "protocolo-2"
          ? 48
          : protocolo.id === "protocolo-3"
            ? 22
            : 56;

    const elegiveis = elegivelGlobal;

    const selecionadas = elegiveis.slice(
      (seq * 7) % Math.max(1, elegiveis.length - alvo),
      ((seq * 7) % Math.max(1, elegiveis.length - alvo)) + alvo,
    );

    for (const matriz of selecionadas) {
      const status = protocolo.status;
      const etapa1 =
        status !== "planejado";
      const etapa2 =
        status === "em_andamento" ||
        status === "aguardando_diagnostico" ||
        status === "finalizado";
      const etapa3 =
        status === "aguardando_diagnostico" || status === "finalizado";
      const diagnosticado = status === "finalizado";

      participacoes.push({
        id: `protmat-${seq}`,
        protocoloId: protocolo.id,
        matrizId: matriz.id,
        etapa1Concluida: etapa1,
        etapa1Data: etapa1 ? protocolo.dataEtapa1 : undefined,
        etapa2Concluida: etapa2,
        etapa2Data: etapa2 ? protocolo.dataEtapa2 : undefined,
        etapa3Concluida: etapa3,
        etapa3Data: etapa3 ? protocolo.dataEtapa3 : undefined,
        diagnosticoPrenhez: diagnosticado
          ? seq % 3 === 0
            ? "vazia"
            : "prenha"
          : "nao_avaliada",
        dataDiagnostico: diagnosticado
          ? protocolo.dataPrevistaDiagnostico
          : undefined,
        observacoes: undefined,
        criadoEm: isoDaysAgo(60),
        atualizadoEm: isoDaysAgo(5),
      });
      seq++;
    }
  }

  return participacoes;
}

export const mockProtocolosMatrizes: ProtocoloMatriz[] = gerarParticipacoes();

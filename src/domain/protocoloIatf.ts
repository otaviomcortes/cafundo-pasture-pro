export type StatusProtocoloIatf =
  | "planejado"
  | "em_andamento"
  | "aguardando_diagnostico"
  | "finalizado";

export interface ProtocoloIatf {
  id: string;
  nome: string;
  dataEtapa1: string; // D0 - Implante
  dataEtapa2: string; // D8 - Retirada
  dataEtapa3: string; // D10/D11 - IA
  possuiRepasseTouro: boolean;
  dataInicioRepasse?: string;
  dataFimRepasse?: string;
  dataPrevistaDiagnostico: string;
  status: StatusProtocoloIatf;
  observacoes?: string;
}

export const mockProtocolosIatf: ProtocoloIatf[] = [
  {
    id: "protocolo-1",
    nome: "IATF Lote Sede",
    dataEtapa1: "2026-05-15T00:00:00.000Z",
    dataEtapa2: "2026-05-23T00:00:00.000Z",
    dataEtapa3: "2026-05-25T00:00:00.000Z",
    possuiRepasseTouro: true,
    dataInicioRepasse: "2026-06-10T00:00:00.000Z",
    dataFimRepasse: "2026-07-10T00:00:00.000Z",
    dataPrevistaDiagnostico: "2026-07-25T00:00:00.000Z",
    status: "em_andamento",
    observacoes: "Lote principal — 64 matrizes.",
  },
  {
    id: "protocolo-2",
    nome: "IATF Lote Currais",
    dataEtapa1: "2026-05-18T00:00:00.000Z",
    dataEtapa2: "2026-05-26T00:00:00.000Z",
    dataEtapa3: "2026-05-28T00:00:00.000Z",
    possuiRepasseTouro: false,
    dataPrevistaDiagnostico: "2026-07-28T00:00:00.000Z",
    status: "em_andamento",
    observacoes: "48 matrizes — sem repasse, foco em fixar IATF.",
  },
  {
    id: "protocolo-3",
    nome: "Ressincronização Lote Sede",
    dataEtapa1: "2026-05-10T00:00:00.000Z",
    dataEtapa2: "2026-05-18T00:00:00.000Z",
    dataEtapa3: "2026-05-21T00:00:00.000Z",
    possuiRepasseTouro: true,
    dataInicioRepasse: "2026-06-05T00:00:00.000Z",
    dataFimRepasse: "2026-07-05T00:00:00.000Z",
    dataPrevistaDiagnostico: "2026-07-20T00:00:00.000Z",
    status: "aguardando_diagnostico",
    observacoes: "Ressinc das vazias após primeira IA.",
  },
  {
    id: "protocolo-4",
    nome: "IATF Lote Várzea",
    dataEtapa1: "2026-10-05T00:00:00.000Z",
    dataEtapa2: "2026-10-13T00:00:00.000Z",
    dataEtapa3: "2026-10-15T00:00:00.000Z",
    possuiRepasseTouro: true,
    dataInicioRepasse: "2026-11-01T00:00:00.000Z",
    dataFimRepasse: "2026-12-01T00:00:00.000Z",
    dataPrevistaDiagnostico: "2026-12-15T00:00:00.000Z",
    status: "planejado",
    observacoes: "Planejado para safra 2026/2027.",
  },
];

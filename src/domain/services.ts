import { mockMatrizes, type Matriz } from "./matriz";
import { mockPartos, type Parto } from "./parto";
import { mockPrenhezes, type Prenhez } from "./prenhez";
import { mockDescartes, type Descarte } from "./descarte";
import { mockEstacoesMonta, type EstacaoMonta } from "./estacaoMonta";
import { mockProtocolosIatf, type ProtocoloIatf } from "./protocoloIatf";

/**
 * Serviços mockados.
 * Toda função é assíncrona para facilitar a futura troca por chamadas reais
 * (PostgreSQL / API) sem mudança de assinatura nos componentes consumidores.
 */

function delay<T>(value: T, ms = 50): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ---------- Matrizes ----------
export const matrizService = {
  listar: () => delay<Matriz[]>(mockMatrizes),
  buscarPorId: (id: string) =>
    delay<Matriz | undefined>(mockMatrizes.find((m) => m.id === id)),
  listarPorStatus: (status: Matriz["status"]) =>
    delay<Matriz[]>(mockMatrizes.filter((m) => m.status === status)),
  listarPorSituacao: (situacao: Matriz["situacaoReprodutiva"]) =>
    delay<Matriz[]>(
      mockMatrizes.filter(
        (m) => m.status === "ativa" && m.situacaoReprodutiva === situacao,
      ),
    ),
};

// ---------- Partos ----------
export const partoService = {
  listar: () => delay<Parto[]>(mockPartos),
  buscarPorId: (id: string) =>
    delay<Parto | undefined>(mockPartos.find((p) => p.id === id)),
  listarPorMatriz: (matrizId: string) =>
    delay<Parto[]>(mockPartos.filter((p) => p.matrizId === matrizId)),
  listarUltimos: (qtd: number) =>
    delay<Parto[]>(
      [...mockPartos]
        .sort(
          (a, b) =>
            new Date(b.dataParto).getTime() - new Date(a.dataParto).getTime(),
        )
        .slice(0, qtd),
    ),
};

// ---------- Prenhezes ----------
export const prenhezService = {
  listar: () => delay<Prenhez[]>(mockPrenhezes),
  buscarPorId: (id: string) =>
    delay<Prenhez | undefined>(mockPrenhezes.find((p) => p.id === id)),
  listarPorMatriz: (matrizId: string) =>
    delay<Prenhez[]>(mockPrenhezes.filter((p) => p.matrizId === matrizId)),
  listarAtivas: () =>
    delay<Prenhez[]>(mockPrenhezes.filter((p) => p.status === "confirmada")),
};

// ---------- Descartes ----------
export const descarteService = {
  listar: () => delay<Descarte[]>(mockDescartes),
  buscarPorId: (id: string) =>
    delay<Descarte | undefined>(mockDescartes.find((d) => d.id === id)),
  listarPorMatriz: (matrizId: string) =>
    delay<Descarte[]>(mockDescartes.filter((d) => d.matrizId === matrizId)),
};

// ---------- Estações de Monta ----------
export const estacaoMontaService = {
  listar: () => delay<EstacaoMonta[]>(mockEstacoesMonta),
  buscarPorId: (id: string) =>
    delay<EstacaoMonta | undefined>(
      mockEstacoesMonta.find((e) => e.id === id),
    ),
  listarAtivas: () =>
    delay<EstacaoMonta[]>(
      mockEstacoesMonta.filter(
        (e) => e.status === "em_andamento" || e.status === "planejada",
      ),
    ),
};

// ---------- Protocolos IATF ----------
export const protocoloIatfService = {
  listar: () => delay<ProtocoloIatf[]>(mockProtocolosIatf),
  buscarPorId: (id: string) =>
    delay<ProtocoloIatf | undefined>(
      mockProtocolosIatf.find((p) => p.id === id),
    ),
  listarPorEstacao: (estacaoMontaId: string) =>
    delay<ProtocoloIatf[]>(
      mockProtocolosIatf.filter((p) => p.estacaoMontaId === estacaoMontaId),
    ),
  listarAtivos: () =>
    delay<ProtocoloIatf[]>(
      mockProtocolosIatf.filter(
        (p) =>
          p.status === "em_andamento" ||
          p.status === "aguardando_diagnostico",
      ),
    ),
};

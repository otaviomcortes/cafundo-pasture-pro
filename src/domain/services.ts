import { mockMatrizes, type Matriz, type MatrizInput } from "./matriz";
import { mockPartos, type Parto } from "./parto";
import { mockPrenhezes, type Prenhez, type PrenhezInput } from "./prenhez";
import { mockDescartes, type Descarte } from "./descarte";

import { mockProtocolosIatf, type ProtocoloIatf } from "./protocoloIatf";
import {
  mockProtocolosMatrizes,
  type ProtocoloMatriz,
  type ProtocoloMatrizInput,
} from "./protocoloMatriz";

/**
 * Serviços mockados.
 * Toda função é assíncrona para facilitar a futura troca por chamadas reais
 * (PostgreSQL / API) sem mudança de assinatura nos componentes consumidores.
 */

// Reconcilia `quantidadePartos` com a contagem real de partos no mock,
// evitando divergências entre o resumo da matriz e o histórico.
for (const m of mockMatrizes) {
  m.quantidadePartos = mockPartos.filter((p) => p.matrizId === m.id).length;
}


function delay<T>(value: T, ms = 50): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nowIso(): string {
  return new Date().toISOString();
}

function nextId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
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
  criar: (input: MatrizInput) => {
    const novo: Matriz = {
      ...input,
      id: nextId("matriz"),
      criadoEm: nowIso(),
      atualizadoEm: nowIso(),
    };
    mockMatrizes.push(novo);
    return delay<Matriz>(novo);
  },
  atualizar: (id: string, patch: Partial<MatrizInput>) => {
    const m = mockMatrizes.find((x) => x.id === id);
    if (m) Object.assign(m, patch, { atualizadoEm: nowIso() });
    return delay<Matriz | undefined>(m);
  },
  inativar: (id: string, novoStatus: Exclude<Matriz["status"], "ativa">) => {
    const m = mockMatrizes.find((x) => x.id === id);
    if (m) {
      m.status = novoStatus;
      m.atualizadoEm = nowIso();
    }
    return delay<{ id: string; status: Matriz["status"] }>({ id, status: novoStatus });
  },
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
  criar: (input: Omit<Parto, "id">) => {
    const novo: Parto = { ...input, id: nextId("parto") };
    mockPartos.push(novo);
    return delay<Parto>(novo);
  },
  atualizar: (id: string, patch: Partial<Omit<Parto, "id">>) => {
    const p = mockPartos.find((x) => x.id === id);
    if (p) Object.assign(p, patch);
    return delay<Parto | undefined>(p);
  },
  remover: (id: string) => {
    const idx = mockPartos.findIndex((x) => x.id === id);
    if (idx >= 0) mockPartos.splice(idx, 1);
    return delay<{ id: string; removido: true }>({ id, removido: true });
  },
};

// ---------- Prenhezes ----------
export const prenhezService = {
  listar: () => delay<Prenhez[]>(mockPrenhezes),
  buscarPorId: (id: string) =>
    delay<Prenhez | undefined>(mockPrenhezes.find((p) => p.id === id)),
  listarPorMatriz: (matrizId: string) =>
    delay<Prenhez[]>(mockPrenhezes.filter((p) => p.matrizId === matrizId)),
  listarAtivas: () =>
    delay<Prenhez[]>(mockPrenhezes.filter((p) => p.status === "ativa")),
  criar: (input: PrenhezInput) => {
    const novo: Prenhez = { ...input, id: nextId("prenhez") };
    mockPrenhezes.push(novo);
    return delay<Prenhez>(novo);
  },
  atualizar: (id: string, patch: Partial<PrenhezInput>) => {
    const p = mockPrenhezes.find((x) => x.id === id);
    if (p) Object.assign(p, patch);
    return delay<Prenhez | undefined>(p);
  },
  encerrar: (id: string) => {
    const p = mockPrenhezes.find((x) => x.id === id);
    if (p) p.status = "encerrada";
    return delay<{ id: string; status: Prenhez["status"] }>({ id, status: "encerrada" });
  },
};

// ---------- Descartes ----------
export const descarteService = {
  listar: () => delay<Descarte[]>(mockDescartes),
  buscarPorId: (id: string) =>
    delay<Descarte | undefined>(mockDescartes.find((d) => d.id === id)),
  listarPorMatriz: (matrizId: string) =>
    delay<Descarte[]>(mockDescartes.filter((d) => d.matrizId === matrizId)),
  criar: (input: Omit<Descarte, "id">) => {
    const novo: Descarte = { ...input, id: nextId("descarte") };
    mockDescartes.push(novo);
    return delay<Descarte>(novo);
  },
  atualizar: (id: string, patch: Partial<Omit<Descarte, "id">>) => {
    const d = mockDescartes.find((x) => x.id === id);
    if (d) Object.assign(d, patch);
    return delay<Descarte | undefined>(d);
  },
  remover: (id: string) => {
    const idx = mockDescartes.findIndex((x) => x.id === id);
    if (idx >= 0) mockDescartes.splice(idx, 1);
    return delay<{ id: string; removido: true }>({ id, removido: true });
  },
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
  criar: (input: Omit<EstacaoMonta, "id">) =>
    delay<EstacaoMonta>({ ...input, id: nextId("estacao") }),
  atualizar: (id: string, patch: Partial<Omit<EstacaoMonta, "id">>) =>
    delay<EstacaoMonta | undefined>(
      (() => {
        const e = mockEstacoesMonta.find((x) => x.id === id);
        return e ? { ...e, ...patch } : undefined;
      })(),
    ),
  encerrar: (id: string) =>
    delay<{ id: string; status: EstacaoMonta["status"] }>({
      id,
      status: "encerrada",
    }),
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
  criar: (input: Omit<ProtocoloIatf, "id">) => {
    const novo: ProtocoloIatf = { ...input, id: nextId("protocolo") };
    mockProtocolosIatf.push(novo);
    return delay<ProtocoloIatf>(novo);
  },
  atualizar: (id: string, patch: Partial<Omit<ProtocoloIatf, "id">>) => {
    const p = mockProtocolosIatf.find((x) => x.id === id);
    if (p) Object.assign(p, patch);
    return delay<ProtocoloIatf | undefined>(p);
  },
  finalizar: (id: string) => {
    const p = mockProtocolosIatf.find((x) => x.id === id);
    if (p) p.status = "finalizado";
    return delay<{ id: string; status: ProtocoloIatf["status"] }>({
      id,
      status: "finalizado",
    });
  },
  remover: (id: string) => {
    const idx = mockProtocolosIatf.findIndex((x) => x.id === id);
    if (idx >= 0) mockProtocolosIatf.splice(idx, 1);
    return delay<{ id: string; removido: true }>({ id, removido: true });
  },
};

// ---------- Protocolo x Matriz (participações) ----------
export const protocoloMatrizService = {
  listar: () => delay<ProtocoloMatriz[]>(mockProtocolosMatrizes),
  buscarPorId: (id: string) =>
    delay<ProtocoloMatriz | undefined>(
      mockProtocolosMatrizes.find((p) => p.id === id),
    ),
  listarPorProtocolo: (protocoloId: string) =>
    delay<ProtocoloMatriz[]>(
      mockProtocolosMatrizes.filter((p) => p.protocoloId === protocoloId),
    ),
  listarPorMatriz: (matrizId: string) =>
    delay<ProtocoloMatriz[]>(
      mockProtocolosMatrizes.filter((p) => p.matrizId === matrizId),
    ),
  criar: (input: ProtocoloMatrizInput) => {
    const novo: ProtocoloMatriz = {
      ...input,
      id: nextId("protmat"),
      criadoEm: nowIso(),
      atualizadoEm: nowIso(),
    };
    mockProtocolosMatrizes.push(novo);
    return delay<ProtocoloMatriz>(novo);
  },
  atualizar: (id: string, patch: Partial<ProtocoloMatrizInput>) => {
    const p = mockProtocolosMatrizes.find((x) => x.id === id);
    if (p) Object.assign(p, patch, { atualizadoEm: nowIso() });
    return delay<ProtocoloMatriz | undefined>(p);
  },
  remover: (id: string) => {
    const idx = mockProtocolosMatrizes.findIndex((x) => x.id === id);
    if (idx >= 0) mockProtocolosMatrizes.splice(idx, 1);
    return delay<{ id: string; removido: true }>({ id, removido: true });
  },
};


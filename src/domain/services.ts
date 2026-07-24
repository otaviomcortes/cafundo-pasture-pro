import { mockMatrizes, type Matriz, type MatrizInput } from "./matriz";
import { mockPartos, type Parto } from "./parto";
import { mockPrenhezes, type Prenhez, type PrenhezInput } from "./prenhez";
import { mockDescartes, type Descarte } from "./descarte";
import {
  mockLotesFrigorifico,
  mockLoteMatrizes,
  type LoteFrigorifico,
  type LoteFrigorificoInput,
  type LoteMatriz,
  type LoteMatrizInput,
} from "./loteFrigorifico";

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

// ---------- Protocolos IATF ----------
export const protocoloIatfService = {
  listar: () => delay<ProtocoloIatf[]>(mockProtocolosIatf),
  buscarPorId: (id: string) =>
    delay<ProtocoloIatf | undefined>(
      mockProtocolosIatf.find((p) => p.id === id),
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


// ---------- Lotes para Frigorífico ----------
export const loteFrigorificoService = {
  listar: () => delay<LoteFrigorifico[]>(mockLotesFrigorifico),
  buscarPorId: (id: string) =>
    delay<LoteFrigorifico | undefined>(
      mockLotesFrigorifico.find((l) => l.id === id),
    ),
  criar: (input: LoteFrigorificoInput) => {
    const novo: LoteFrigorifico = {
      ...input,
      id: nextId("lote"),
      status: "em_confinamento",
      criadoEm: nowIso(),
      atualizadoEm: nowIso(),
    };
    mockLotesFrigorifico.push(novo);
    return delay<LoteFrigorifico>(novo);
  },
  atualizar: (id: string, patch: Partial<LoteFrigorifico>) => {
    const l = mockLotesFrigorifico.find((x) => x.id === id);
    if (l) Object.assign(l, patch, { atualizadoEm: nowIso() });
    return delay<LoteFrigorifico | undefined>(l);
  },
  finalizar: (
    id: string,
    dados: { dataEnvio: string; frigorifico?: string; pesoTotalInformado?: number; valorRecebido?: number },
  ) => {
    const l = mockLotesFrigorifico.find((x) => x.id === id);
    if (l) {
      l.status = "finalizado";
      l.dataEnvio = dados.dataEnvio;
      l.frigorifico = dados.frigorifico;
      l.pesoTotalInformado = dados.pesoTotalInformado;
      l.valorRecebido = dados.valorRecebido;
      l.atualizadoEm = nowIso();
      // Marca todas as matrizes do lote como descartadas.
      const membros = mockLoteMatrizes.filter((lm) => lm.loteId === id);
      for (const lm of membros) {
        const m = mockMatrizes.find((mm) => mm.id === lm.matrizId);
        if (m) {
          m.status = "descartada";
          m.situacaoReprodutiva = "descartada";
          m.atualizadoEm = nowIso();
        }
        // Cria registro de Descarte tipo=lote (para o histórico).
        const jaExiste = mockDescartes.some(
          (d) => d.matrizId === lm.matrizId && d.loteId === id,
        );
        if (!jaExiste) {
          mockDescartes.push({
            id: nextId("descarte"),
            matrizId: lm.matrizId,
            dataDescarte: dados.dataEnvio,
            tipoDescarte: "lote",
            destino: "frigorifico",
            peso: lm.pesoFinal,
            loteId: id,
          });
        }
      }
    }
    return delay<LoteFrigorifico | undefined>(l);
  },
  remover: (id: string) => {
    const idx = mockLotesFrigorifico.findIndex((x) => x.id === id);
    if (idx >= 0) mockLotesFrigorifico.splice(idx, 1);
    // Remove também as participações e descartes tipo lote vinculados.
    for (let i = mockLoteMatrizes.length - 1; i >= 0; i--) {
      if (mockLoteMatrizes[i].loteId === id) mockLoteMatrizes.splice(i, 1);
    }
    for (let i = mockDescartes.length - 1; i >= 0; i--) {
      if (mockDescartes[i].loteId === id) mockDescartes.splice(i, 1);
    }
    return delay<{ id: string; removido: true }>({ id, removido: true });
  },
};

export const loteMatrizService = {
  listar: () => delay<LoteMatriz[]>(mockLoteMatrizes),
  listarPorLote: (loteId: string) =>
    delay<LoteMatriz[]>(mockLoteMatrizes.filter((l) => l.loteId === loteId)),
  buscarPorMatriz: (matrizId: string) =>
    delay<LoteMatriz | undefined>(
      mockLoteMatrizes.find((l) => l.matrizId === matrizId),
    ),
  adicionar: (input: LoteMatrizInput) => {
    // Impede duplicidade da mesma matriz em qualquer lote.
    const ja = mockLoteMatrizes.find((l) => l.matrizId === input.matrizId);
    if (ja) return delay<LoteMatriz>(ja);
    const novo: LoteMatriz = { ...input, id: nextId("lotemat") };
    mockLoteMatrizes.push(novo);
    return delay<LoteMatriz>(novo);
  },
  atualizar: (id: string, patch: Partial<LoteMatrizInput>) => {
    const l = mockLoteMatrizes.find((x) => x.id === id);
    if (l) Object.assign(l, patch);
    return delay<LoteMatriz | undefined>(l);
  },
  remover: (id: string) => {
    const idx = mockLoteMatrizes.findIndex((x) => x.id === id);
    if (idx >= 0) mockLoteMatrizes.splice(idx, 1);
    return delay<{ id: string; removido: true }>({ id, removido: true });
  },
};

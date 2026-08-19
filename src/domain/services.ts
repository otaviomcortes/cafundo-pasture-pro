import { supabase } from "@/integrations/supabase/client";

import type { Matriz, MatrizInput } from "./matriz";
import type { Parto } from "./parto";
import type { Prenhez, PrenhezInput } from "./prenhez";
import type { Descarte } from "./descarte";
import type {
  LoteFrigorifico,
  LoteFrigorificoInput,
  LoteMatriz,
  LoteMatrizInput,
} from "./loteFrigorifico";
import type { ProtocoloIatf } from "./protocoloIatf";
import type { ProtocoloMatriz, ProtocoloMatrizInput } from "./protocoloMatriz";

/**
 * Serviços de persistência do Cafundó (PostgreSQL).
 *
 * As assinaturas são exatamente as mesmas dos antigos serviços mockados,
 * de forma que nenhuma tela precisou ser reescrita. Os mocks continuam nos
 * arquivos de domínio apenas como material de referência/desenvolvimento —
 * nada é carregado automaticamente no banco.
 */

// ---------- Helpers ----------

/** ISO completo -> `YYYY-MM-DD` (colunas DATE). */
function toDate(iso?: string | null): string | null {
  if (!iso) return null;
  return iso.slice(0, 10);
}

/** `YYYY-MM-DD` -> ISO completo (formato usado pela UI). */
function fromDate(d?: string | null): string | undefined {
  if (!d) return undefined;
  return `${d}T00:00:00.000Z`;
}

function orUndefined<T>(v: T | null | undefined): T | undefined {
  return v === null ? undefined : v;
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

type Row = Record<string, unknown>;

// ---------- Mapeadores ----------

function mapMatriz(r: Row, qtdPartos = 0): Matriz {
  return {
    id: r.id as string,
    numeroBrinco: r.numero_brinco as string,
    raca: r.raca as string,
    proprietario: r.proprietario as Matriz["proprietario"],
    dataNascimento: fromDate(r.data_nascimento as string | null) ?? "",
    status: r.status as Matriz["status"],
    situacaoReprodutiva: r.situacao_reprodutiva as Matriz["situacaoReprodutiva"],
    quantidadePartos: qtdPartos,
    observacoes: orUndefined(r.observacoes as string | null),
    criadoEm: r.criado_em as string,
    atualizadoEm: r.atualizado_em as string,
  };
}

function matrizToRow(patch: Partial<MatrizInput>): Row {
  const row: Row = {};
  if (patch.numeroBrinco !== undefined) row.numero_brinco = patch.numeroBrinco;
  if (patch.raca !== undefined) row.raca = patch.raca;
  if (patch.proprietario !== undefined) row.proprietario = patch.proprietario;
  if (patch.dataNascimento !== undefined)
    row.data_nascimento = toDate(patch.dataNascimento);
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.situacaoReprodutiva !== undefined)
    row.situacao_reprodutiva = patch.situacaoReprodutiva;
  if (patch.observacoes !== undefined) row.observacoes = patch.observacoes ?? null;
  // `quantidadePartos` é derivado da tabela de partos — nunca persistido.
  return row;
}

function mapParto(r: Row): Parto {
  return {
    id: r.id as string,
    matrizId: r.matriz_id as string,
    dataParto: fromDate(r.data_parto as string) ?? "",
    sexoBezerro: r.sexo_bezerro as Parto["sexoBezerro"],
    racaBezerro: r.raca_bezerro as string,
    observacoes: orUndefined(r.observacoes as string | null),
  };
}

function mapPrenhez(r: Row): Prenhez {
  return {
    id: r.id as string,
    matrizId: r.matriz_id as string,
    origem: r.origem as Prenhez["origem"],
    dataConfirmacao: fromDate(r.data_confirmacao as string) ?? "",
    status: r.status as Prenhez["status"],
    observacoes: orUndefined(r.observacoes as string | null),
  };
}

function mapDescarte(r: Row): Descarte {
  return {
    id: r.id as string,
    matrizId: r.matriz_id as string,
    dataDescarte: fromDate(r.data_descarte as string) ?? "",
    tipoDescarte: r.tipo_descarte as Descarte["tipoDescarte"],
    motivo: orUndefined(r.motivo as Descarte["motivo"] | null),
    peso: orUndefined(r.peso as number | null),
    destino: orUndefined(r.destino as Descarte["destino"] | null),
    loteId: orUndefined(r.lote_id as string | null),
    observacoes: orUndefined(r.observacoes as string | null),
  };
}

function mapProtocolo(r: Row): ProtocoloIatf {
  return {
    id: r.id as string,
    nome: r.nome as string,
    dataEtapa1: fromDate(r.data_etapa1 as string) ?? "",
    dataEtapa2: fromDate(r.data_etapa2 as string) ?? "",
    dataEtapa3: fromDate(r.data_etapa3 as string) ?? "",
    possuiRepasseTouro: Boolean(r.possui_repasse_touro),
    dataInicioRepasse: fromDate(r.data_inicio_repasse as string | null),
    dataFimRepasse: fromDate(r.data_fim_repasse as string | null),
    dataPrevistaDiagnostico: fromDate(r.data_prevista_diagnostico as string) ?? "",
    status: r.status as ProtocoloIatf["status"],
    observacoes: orUndefined(r.observacoes as string | null),
  };
}

function protocoloToRow(patch: Partial<Omit<ProtocoloIatf, "id">>): Row {
  const row: Row = {};
  if (patch.nome !== undefined) row.nome = patch.nome;
  if (patch.dataEtapa1 !== undefined) row.data_etapa1 = toDate(patch.dataEtapa1);
  if (patch.dataEtapa2 !== undefined) row.data_etapa2 = toDate(patch.dataEtapa2);
  if (patch.dataEtapa3 !== undefined) row.data_etapa3 = toDate(patch.dataEtapa3);
  if (patch.possuiRepasseTouro !== undefined)
    row.possui_repasse_touro = patch.possuiRepasseTouro;
  if (patch.dataInicioRepasse !== undefined)
    row.data_inicio_repasse = toDate(patch.dataInicioRepasse);
  if (patch.dataFimRepasse !== undefined)
    row.data_fim_repasse = toDate(patch.dataFimRepasse);
  if (patch.dataPrevistaDiagnostico !== undefined)
    row.data_prevista_diagnostico = toDate(patch.dataPrevistaDiagnostico);
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.observacoes !== undefined) row.observacoes = patch.observacoes ?? null;
  return row;
}

function mapProtocoloMatriz(r: Row): ProtocoloMatriz {
  return {
    id: r.id as string,
    protocoloId: r.protocolo_id as string,
    matrizId: r.matriz_id as string,
    etapa1Concluida: Boolean(r.etapa1_concluida),
    etapa1Data: fromDate(r.etapa1_data as string | null),
    etapa2Concluida: Boolean(r.etapa2_concluida),
    etapa2Data: fromDate(r.etapa2_data as string | null),
    etapa3Concluida: Boolean(r.etapa3_concluida),
    etapa3Data: fromDate(r.etapa3_data as string | null),
    diagnosticoPrenhez:
      r.diagnostico_prenhez as ProtocoloMatriz["diagnosticoPrenhez"],
    dataDiagnostico: fromDate(r.data_diagnostico as string | null),
    observacoes: orUndefined(r.observacoes as string | null),
    criadoEm: r.criado_em as string,
    atualizadoEm: r.atualizado_em as string,
  };
}

function protocoloMatrizToRow(patch: Partial<ProtocoloMatrizInput>): Row {
  const row: Row = {};
  if (patch.protocoloId !== undefined) row.protocolo_id = patch.protocoloId;
  if (patch.matrizId !== undefined) row.matriz_id = patch.matrizId;
  if (patch.etapa1Concluida !== undefined)
    row.etapa1_concluida = patch.etapa1Concluida;
  if (patch.etapa1Data !== undefined) row.etapa1_data = toDate(patch.etapa1Data);
  if (patch.etapa2Concluida !== undefined)
    row.etapa2_concluida = patch.etapa2Concluida;
  if (patch.etapa2Data !== undefined) row.etapa2_data = toDate(patch.etapa2Data);
  if (patch.etapa3Concluida !== undefined)
    row.etapa3_concluida = patch.etapa3Concluida;
  if (patch.etapa3Data !== undefined) row.etapa3_data = toDate(patch.etapa3Data);
  if (patch.diagnosticoPrenhez !== undefined)
    row.diagnostico_prenhez = patch.diagnosticoPrenhez;
  if (patch.dataDiagnostico !== undefined)
    row.data_diagnostico = toDate(patch.dataDiagnostico);
  if (patch.observacoes !== undefined) row.observacoes = patch.observacoes ?? null;
  return row;
}

function mapLote(r: Row): LoteFrigorifico {
  return {
    id: r.id as string,
    nome: r.nome as string,
    dataInicioConfinamento: fromDate(r.data_inicio_confinamento as string) ?? "",
    dataEnvio: fromDate(r.data_envio as string | null),
    frigorifico: orUndefined(r.frigorifico as string | null),
    pesoTotalInformado: orUndefined(r.peso_total_informado as number | null),
    valorRecebido: orUndefined(r.valor_recebido as number | null),
    arrobasPorMatrizInformada: orUndefined(
      r.media_arrobas_frigorifico as number | null,
    ),
    observacoes: orUndefined(r.observacoes as string | null),
    status: r.status as LoteFrigorifico["status"],
    criadoEm: r.criado_em as string,
    atualizadoEm: r.atualizado_em as string,
  };
}

function loteToRow(patch: Partial<LoteFrigorifico>): Row {
  const row: Row = {};
  if (patch.nome !== undefined) row.nome = patch.nome;
  if (patch.dataInicioConfinamento !== undefined)
    row.data_inicio_confinamento = toDate(patch.dataInicioConfinamento);
  if (patch.dataEnvio !== undefined) row.data_envio = toDate(patch.dataEnvio);
  if (patch.frigorifico !== undefined) row.frigorifico = patch.frigorifico ?? null;
  if (patch.pesoTotalInformado !== undefined)
    row.peso_total_informado = patch.pesoTotalInformado ?? null;
  if (patch.valorRecebido !== undefined)
    row.valor_recebido = patch.valorRecebido ?? null;
  if (patch.arrobasPorMatrizInformada !== undefined)
    row.media_arrobas_frigorifico = patch.arrobasPorMatrizInformada ?? null;
  if (patch.observacoes !== undefined) row.observacoes = patch.observacoes ?? null;
  if (patch.status !== undefined) row.status = patch.status;
  return row;
}

function mapLoteMatriz(r: Row): LoteMatriz {
  return {
    id: r.id as string,
    loteId: r.lote_id as string,
    matrizId: r.matriz_id as string,
    pesoInicial: orUndefined(r.peso_inicial as number | null),
    pesoFinal: orUndefined(r.peso_final as number | null),
  };
}

// Tabelas acessadas com nomes dinâmicos: usa um client sem tipagem estrita
// para manter os mapeadores acima como única fonte de conversão.
const db = supabase as unknown as {
  from: (table: string) => any;
  rpc: (fn: string, args: Record<string, unknown>) => any;
};

/** Contagem de partos por matriz (a quantidade nunca é persistida). */
async function contarPartosPorMatriz(): Promise<Map<string, number>> {
  const rows = check(await db.from("partos").select("matriz_id")) as Row[];
  const mapa = new Map<string, number>();
  for (const r of rows ?? []) {
    const k = r.matriz_id as string;
    mapa.set(k, (mapa.get(k) ?? 0) + 1);
  }
  return mapa;
}

// ---------- Matrizes ----------
export const matrizService = {
  listar: async (): Promise<Matriz[]> => {
    const [rows, contagem] = await Promise.all([
      db.from("matrizes").select("*").order("numero_brinco"),
      contarPartosPorMatriz(),
    ]);
    return ((check(rows) as Row[]) ?? []).map((r) =>
      mapMatriz(r, contagem.get(r.id as string) ?? 0),
    );
  },
  buscarPorId: async (id: string): Promise<Matriz | undefined> => {
    const row = check(
      await db.from("matrizes").select("*").eq("id", id).maybeSingle(),
    ) as Row | null;
    if (!row) return undefined;
    const partos = check(
      await db.from("partos").select("id").eq("matriz_id", id),
    ) as Row[];
    return mapMatriz(row, partos?.length ?? 0);
  },
  listarPorStatus: async (status: Matriz["status"]): Promise<Matriz[]> => {
    const todas = await matrizService.listar();
    return todas.filter((m) => m.status === status);
  },
  listarPorSituacao: async (
    situacao: Matriz["situacaoReprodutiva"],
  ): Promise<Matriz[]> => {
    const todas = await matrizService.listar();
    return todas.filter(
      (m) => m.status === "ativa" && m.situacaoReprodutiva === situacao,
    );
  },
  criar: async (input: MatrizInput): Promise<Matriz> => {
    const row = check(
      await db.from("matrizes").insert(matrizToRow(input)).select().single(),
    ) as Row;
    return mapMatriz(row, 0);
  },
  atualizar: async (
    id: string,
    patch: Partial<MatrizInput>,
  ): Promise<Matriz | undefined> => {
    const row = matrizToRow(patch);
    if (Object.keys(row).length === 0) return matrizService.buscarPorId(id);
    const updated = check(
      await db.from("matrizes").update(row).eq("id", id).select().maybeSingle(),
    ) as Row | null;
    return updated ? mapMatriz(updated, 0) : undefined;
  },
  inativar: async (
    id: string,
    novoStatus: Exclude<Matriz["status"], "ativa">,
  ): Promise<{ id: string; status: Matriz["status"] }> => {
    check(await db.from("matrizes").update({ status: novoStatus }).eq("id", id));
    return { id, status: novoStatus };
  },
};

// ---------- Partos ----------
export const partoService = {
  listar: async (): Promise<Parto[]> => {
    const rows = check(
      await db.from("partos").select("*").order("data_parto", { ascending: false }),
    ) as Row[];
    return (rows ?? []).map(mapParto);
  },
  buscarPorId: async (id: string): Promise<Parto | undefined> => {
    const row = check(
      await db.from("partos").select("*").eq("id", id).maybeSingle(),
    ) as Row | null;
    return row ? mapParto(row) : undefined;
  },
  listarPorMatriz: async (matrizId: string): Promise<Parto[]> => {
    const rows = check(
      await db
        .from("partos")
        .select("*")
        .eq("matriz_id", matrizId)
        .order("data_parto", { ascending: false }),
    ) as Row[];
    return (rows ?? []).map(mapParto);
  },
  listarUltimos: async (qtd: number): Promise<Parto[]> => {
    const rows = check(
      await db
        .from("partos")
        .select("*")
        .order("data_parto", { ascending: false })
        .limit(qtd),
    ) as Row[];
    return (rows ?? []).map(mapParto);
  },
  /**
   * Operação transacional: cria o parto, encerra a prenhez ativa e deixa a
   * matriz apta — tudo dentro de uma única função no banco.
   */
  criar: async (input: Omit<Parto, "id">): Promise<Parto> => {
    const row = check(
      await db.rpc("registrar_parto", {
        p_matriz_id: input.matrizId,
        p_data_parto: toDate(input.dataParto),
        p_sexo_bezerro: input.sexoBezerro,
        p_raca_bezerro: input.racaBezerro,
        p_observacoes: input.observacoes ?? null,
      }),
    ) as Row;
    return mapParto(row);
  },
  atualizar: async (
    id: string,
    patch: Partial<Omit<Parto, "id">>,
  ): Promise<Parto | undefined> => {
    const row: Row = {};
    if (patch.matrizId !== undefined) row.matriz_id = patch.matrizId;
    if (patch.dataParto !== undefined) row.data_parto = toDate(patch.dataParto);
    if (patch.sexoBezerro !== undefined) row.sexo_bezerro = patch.sexoBezerro;
    if (patch.racaBezerro !== undefined) row.raca_bezerro = patch.racaBezerro;
    if (patch.observacoes !== undefined) row.observacoes = patch.observacoes ?? null;
    const updated = check(
      await db.from("partos").update(row).eq("id", id).select().maybeSingle(),
    ) as Row | null;
    return updated ? mapParto(updated) : undefined;
  },
  remover: async (id: string) => {
    check(await db.from("partos").delete().eq("id", id));
    return { id, removido: true as const };
  },
};

// ---------- Prenhezes ----------
export const prenhezService = {
  listar: async (): Promise<Prenhez[]> => {
    const rows = check(await db.from("prenhezes").select("*")) as Row[];
    return (rows ?? []).map(mapPrenhez);
  },
  buscarPorId: async (id: string): Promise<Prenhez | undefined> => {
    const row = check(
      await db.from("prenhezes").select("*").eq("id", id).maybeSingle(),
    ) as Row | null;
    return row ? mapPrenhez(row) : undefined;
  },
  listarPorMatriz: async (matrizId: string): Promise<Prenhez[]> => {
    const rows = check(
      await db.from("prenhezes").select("*").eq("matriz_id", matrizId),
    ) as Row[];
    return (rows ?? []).map(mapPrenhez);
  },
  listarAtivas: async (): Promise<Prenhez[]> => {
    const rows = check(
      await db.from("prenhezes").select("*").eq("status", "ativa"),
    ) as Row[];
    return (rows ?? []).map(mapPrenhez);
  },
  criar: async (input: PrenhezInput): Promise<Prenhez> => {
    // Uma matriz só pode ter uma prenhez ativa: reaproveita a existente.
    if (input.status === "ativa") {
      const existente = check(
        await db
          .from("prenhezes")
          .select("*")
          .eq("matriz_id", input.matrizId)
          .eq("status", "ativa")
          .maybeSingle(),
      ) as Row | null;
      if (existente) return mapPrenhez(existente);
    }
    const row = check(
      await db
        .from("prenhezes")
        .insert({
          matriz_id: input.matrizId,
          origem: input.origem,
          data_confirmacao: toDate(input.dataConfirmacao),
          status: input.status,
          observacoes: input.observacoes ?? null,
        })
        .select()
        .single(),
    ) as Row;
    return mapPrenhez(row);
  },
  atualizar: async (
    id: string,
    patch: Partial<PrenhezInput>,
  ): Promise<Prenhez | undefined> => {
    const row: Row = {};
    if (patch.matrizId !== undefined) row.matriz_id = patch.matrizId;
    if (patch.origem !== undefined) row.origem = patch.origem;
    if (patch.dataConfirmacao !== undefined)
      row.data_confirmacao = toDate(patch.dataConfirmacao);
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.observacoes !== undefined) row.observacoes = patch.observacoes ?? null;
    const updated = check(
      await db.from("prenhezes").update(row).eq("id", id).select().maybeSingle(),
    ) as Row | null;
    return updated ? mapPrenhez(updated) : undefined;
  },
  encerrar: async (id: string) => {
    check(await db.from("prenhezes").update({ status: "encerrada" }).eq("id", id));
    return { id, status: "encerrada" as const };
  },
};

// ---------- Descartes ----------
export const descarteService = {
  listar: async (): Promise<Descarte[]> => {
    const rows = check(
      await db.from("descartes").select("*").order("data_descarte", {
        ascending: false,
      }),
    ) as Row[];
    return (rows ?? []).map(mapDescarte);
  },
  buscarPorId: async (id: string): Promise<Descarte | undefined> => {
    const row = check(
      await db.from("descartes").select("*").eq("id", id).maybeSingle(),
    ) as Row | null;
    return row ? mapDescarte(row) : undefined;
  },
  listarPorMatriz: async (matrizId: string): Promise<Descarte[]> => {
    const rows = check(
      await db.from("descartes").select("*").eq("matriz_id", matrizId),
    ) as Row[];
    return (rows ?? []).map(mapDescarte);
  },
  criar: async (input: Omit<Descarte, "id">): Promise<Descarte> => {
    const row = check(
      await db
        .from("descartes")
        .insert({
          matriz_id: input.matrizId,
          data_descarte: toDate(input.dataDescarte),
          tipo_descarte: input.tipoDescarte,
          motivo: input.motivo ?? null,
          peso: input.peso ?? null,
          destino: input.destino ?? null,
          lote_id: input.loteId ?? null,
          observacoes: input.observacoes ?? null,
        })
        .select()
        .single(),
    ) as Row;
    return mapDescarte(row);
  },
  atualizar: async (
    id: string,
    patch: Partial<Omit<Descarte, "id">>,
  ): Promise<Descarte | undefined> => {
    const row: Row = {};
    if (patch.matrizId !== undefined) row.matriz_id = patch.matrizId;
    if (patch.dataDescarte !== undefined)
      row.data_descarte = toDate(patch.dataDescarte);
    if (patch.tipoDescarte !== undefined) row.tipo_descarte = patch.tipoDescarte;
    if (patch.motivo !== undefined) row.motivo = patch.motivo ?? null;
    if (patch.peso !== undefined) row.peso = patch.peso ?? null;
    if (patch.destino !== undefined) row.destino = patch.destino ?? null;
    if (patch.loteId !== undefined) row.lote_id = patch.loteId ?? null;
    if (patch.observacoes !== undefined) row.observacoes = patch.observacoes ?? null;
    const updated = check(
      await db.from("descartes").update(row).eq("id", id).select().maybeSingle(),
    ) as Row | null;
    return updated ? mapDescarte(updated) : undefined;
  },
  remover: async (id: string) => {
    check(await db.from("descartes").delete().eq("id", id));
    return { id, removido: true as const };
  },
};

// ---------- Protocolos IATF ----------
export const protocoloIatfService = {
  listar: async (): Promise<ProtocoloIatf[]> => {
    const rows = check(
      await db
        .from("protocolos_iatf")
        .select("*")
        .order("data_etapa1", { ascending: false }),
    ) as Row[];
    return (rows ?? []).map(mapProtocolo);
  },
  buscarPorId: async (id: string): Promise<ProtocoloIatf | undefined> => {
    const row = check(
      await db.from("protocolos_iatf").select("*").eq("id", id).maybeSingle(),
    ) as Row | null;
    return row ? mapProtocolo(row) : undefined;
  },
  listarAtivos: async (): Promise<ProtocoloIatf[]> => {
    const rows = check(
      await db
        .from("protocolos_iatf")
        .select("*")
        .in("status", ["em_andamento", "aguardando_diagnostico"]),
    ) as Row[];
    return (rows ?? []).map(mapProtocolo);
  },
  criar: async (input: Omit<ProtocoloIatf, "id">): Promise<ProtocoloIatf> => {
    const row = check(
      await db
        .from("protocolos_iatf")
        .insert(protocoloToRow(input))
        .select()
        .single(),
    ) as Row;
    return mapProtocolo(row);
  },
  atualizar: async (
    id: string,
    patch: Partial<Omit<ProtocoloIatf, "id">>,
  ): Promise<ProtocoloIatf | undefined> => {
    const updated = check(
      await db
        .from("protocolos_iatf")
        .update(protocoloToRow(patch))
        .eq("id", id)
        .select()
        .maybeSingle(),
    ) as Row | null;
    return updated ? mapProtocolo(updated) : undefined;
  },
  finalizar: async (id: string) => {
    check(
      await db.from("protocolos_iatf").update({ status: "finalizado" }).eq("id", id),
    );
    return { id, status: "finalizado" as const };
  },
  remover: async (id: string) => {
    check(await db.from("protocolos_iatf").delete().eq("id", id));
    return { id, removido: true as const };
  },
};

// ---------- Protocolo x Matriz (participações) ----------
export const protocoloMatrizService = {
  listar: async (): Promise<ProtocoloMatriz[]> => {
    const rows = check(await db.from("protocolo_matrizes").select("*")) as Row[];
    return (rows ?? []).map(mapProtocoloMatriz);
  },
  buscarPorId: async (id: string): Promise<ProtocoloMatriz | undefined> => {
    const row = check(
      await db.from("protocolo_matrizes").select("*").eq("id", id).maybeSingle(),
    ) as Row | null;
    return row ? mapProtocoloMatriz(row) : undefined;
  },
  listarPorProtocolo: async (protocoloId: string): Promise<ProtocoloMatriz[]> => {
    const rows = check(
      await db
        .from("protocolo_matrizes")
        .select("*")
        .eq("protocolo_id", protocoloId),
    ) as Row[];
    return (rows ?? []).map(mapProtocoloMatriz);
  },
  listarPorMatriz: async (matrizId: string): Promise<ProtocoloMatriz[]> => {
    const rows = check(
      await db.from("protocolo_matrizes").select("*").eq("matriz_id", matrizId),
    ) as Row[];
    return (rows ?? []).map(mapProtocoloMatriz);
  },
  criar: async (input: ProtocoloMatrizInput): Promise<ProtocoloMatriz> => {
    const row = check(
      await db
        .from("protocolo_matrizes")
        .insert(protocoloMatrizToRow(input))
        .select()
        .single(),
    ) as Row;
    return mapProtocoloMatriz(row);
  },
  atualizar: async (
    id: string,
    patch: Partial<ProtocoloMatrizInput>,
  ): Promise<ProtocoloMatriz | undefined> => {
    const updated = check(
      await db
        .from("protocolo_matrizes")
        .update(protocoloMatrizToRow(patch))
        .eq("id", id)
        .select()
        .maybeSingle(),
    ) as Row | null;
    return updated ? mapProtocoloMatriz(updated) : undefined;
  },
  remover: async (id: string) => {
    check(await db.from("protocolo_matrizes").delete().eq("id", id));
    return { id, removido: true as const };
  },
};

// ---------- Lotes para Frigorífico ----------
export const loteFrigorificoService = {
  listar: async (): Promise<LoteFrigorifico[]> => {
    const rows = check(
      await db
        .from("lotes_frigorifico")
        .select("*")
        .order("criado_em", { ascending: false }),
    ) as Row[];
    return (rows ?? []).map(mapLote);
  },
  buscarPorId: async (id: string): Promise<LoteFrigorifico | undefined> => {
    const row = check(
      await db.from("lotes_frigorifico").select("*").eq("id", id).maybeSingle(),
    ) as Row | null;
    return row ? mapLote(row) : undefined;
  },
  criar: async (input: LoteFrigorificoInput): Promise<LoteFrigorifico> => {
    const row = check(
      await db
        .from("lotes_frigorifico")
        .insert({ ...loteToRow(input), status: "em_confinamento" })
        .select()
        .single(),
    ) as Row;
    return mapLote(row);
  },
  atualizar: async (
    id: string,
    patch: Partial<LoteFrigorifico>,
  ): Promise<LoteFrigorifico | undefined> => {
    const updated = check(
      await db
        .from("lotes_frigorifico")
        .update(loteToRow(patch))
        .eq("id", id)
        .select()
        .maybeSingle(),
    ) as Row | null;
    return updated ? mapLote(updated) : undefined;
  },
  /**
   * Operação transacional: finaliza o lote, registra os descartes de lote e
   * marca todas as matrizes participantes como descartadas.
   */
  finalizar: async (
    id: string,
    dados: {
      dataEnvio: string;
      frigorifico?: string;
      pesoTotalInformado?: number;
      valorRecebido?: number;
      arrobasPorMatrizInformada?: number;
    },
  ): Promise<LoteFrigorifico | undefined> => {
    const row = check(
      await db.rpc("finalizar_lote", {
        p_lote_id: id,
        p_data_envio: toDate(dados.dataEnvio),
        p_frigorifico: dados.frigorifico ?? null,
        p_valor_recebido: dados.valorRecebido ?? null,
        p_media_arrobas_frigorifico: dados.arrobasPorMatrizInformada ?? null,
        p_peso_total_informado: dados.pesoTotalInformado ?? null,
      }),
    ) as Row | null;
    return row ? mapLote(row) : undefined;
  },
  remover: async (id: string) => {
    // Descartes vinculados ao lote são removidos primeiro (histórico do lote).
    check(await db.from("descartes").delete().eq("lote_id", id));
    check(await db.from("lotes_frigorifico").delete().eq("id", id));
    return { id, removido: true as const };
  },
};

export const loteMatrizService = {
  listar: async (): Promise<LoteMatriz[]> => {
    const rows = check(
      await db.from("lote_frigorifico_matrizes").select("*"),
    ) as Row[];
    return (rows ?? []).map(mapLoteMatriz);
  },
  listarPorLote: async (loteId: string): Promise<LoteMatriz[]> => {
    const rows = check(
      await db.from("lote_frigorifico_matrizes").select("*").eq("lote_id", loteId),
    ) as Row[];
    return (rows ?? []).map(mapLoteMatriz);
  },
  buscarPorMatriz: async (matrizId: string): Promise<LoteMatriz | undefined> => {
    const rows = check(
      await db
        .from("lote_frigorifico_matrizes")
        .select("*")
        .eq("matriz_id", matrizId)
        .limit(1),
    ) as Row[];
    return rows && rows.length > 0 ? mapLoteMatriz(rows[0]) : undefined;
  },
  adicionar: async (input: LoteMatrizInput): Promise<LoteMatriz> => {
    const existentes = check(
      await db
        .from("lote_frigorifico_matrizes")
        .select("*")
        .eq("matriz_id", input.matrizId)
        .limit(1),
    ) as Row[];
    if (existentes && existentes.length > 0) return mapLoteMatriz(existentes[0]);
    const row = check(
      await db
        .from("lote_frigorifico_matrizes")
        .insert({
          lote_id: input.loteId,
          matriz_id: input.matrizId,
          peso_inicial: input.pesoInicial ?? null,
          peso_final: input.pesoFinal ?? null,
        })
        .select()
        .single(),
    ) as Row;
    return mapLoteMatriz(row);
  },
  atualizar: async (
    id: string,
    patch: Partial<LoteMatrizInput>,
  ): Promise<LoteMatriz | undefined> => {
    const row: Row = {};
    if (patch.loteId !== undefined) row.lote_id = patch.loteId;
    if (patch.matrizId !== undefined) row.matriz_id = patch.matrizId;
    if (patch.pesoInicial !== undefined) row.peso_inicial = patch.pesoInicial ?? null;
    if (patch.pesoFinal !== undefined) row.peso_final = patch.pesoFinal ?? null;
    const updated = check(
      await db
        .from("lote_frigorifico_matrizes")
        .update(row)
        .eq("id", id)
        .select()
        .maybeSingle(),
    ) as Row | null;
    return updated ? mapLoteMatriz(updated) : undefined;
  },
  remover: async (id: string) => {
    check(await db.from("lote_frigorifico_matrizes").delete().eq("id", id));
    return { id, removido: true as const };
  },
};

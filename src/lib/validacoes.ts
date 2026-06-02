import type { Matriz, Parto } from "@/domain";

/**
 * Regras de consistência do domínio Cafundó.
 * Centralizadas aqui para facilitar a futura migração ao PostgreSQL
 * (espelhar como CHECKs / triggers / validações de serviço).
 */

export interface ResultadoValidacao {
  ok: boolean;
  motivo?: string;
}

const OK: ResultadoValidacao = { ok: true };

/** Conta partos efetivamente registrados para uma matriz. */
export function contarPartos(matrizId: string, partos: Parto[]): number {
  return partos.filter((p) => p.matrizId === matrizId).length;
}

/** Indexa contagem de partos por matrizId. */
export function indexarPartosPorMatriz(partos: Parto[]): Map<string, number> {
  const idx = new Map<string, number>();
  for (const p of partos) {
    idx.set(p.matrizId, (idx.get(p.matrizId) ?? 0) + 1);
  }
  return idx;
}

/** Matriz precisa estar ativa para receber novo parto. */
export function podeRegistrarParto(matriz: Matriz): ResultadoValidacao {
  if (matriz.status !== "ativa") {
    return { ok: false, motivo: "Matriz não está ativa." };
  }
  return OK;
}

/** Matriz em protocolo IATF: deve ser ativa e não estar prenha. */
export function podeParticiparProtocolo(matriz: Matriz): ResultadoValidacao {
  if (matriz.status !== "ativa") {
    return { ok: false, motivo: "Matriz não está ativa." };
  }
  if (matriz.situacaoReprodutiva === "prenha") {
    return { ok: false, motivo: "Matriz prenha não pode entrar em protocolo." };
  }
  return OK;
}

/** Matriz só pode ter prenhez ativa se estiver ativa. */
export function podeTerPrenhezAtiva(matriz: Matriz): ResultadoValidacao {
  if (matriz.status !== "ativa") {
    return { ok: false, motivo: "Matriz inativa não pode ter prenhez ativa." };
  }
  return OK;
}

/** Matriz descartada não pode receber novos registros operacionais. */
export function podeReceberDescarte(matriz: Matriz): ResultadoValidacao {
  if (matriz.status !== "ativa") {
    return { ok: false, motivo: "Matriz já está inativa." };
  }
  return OK;
}

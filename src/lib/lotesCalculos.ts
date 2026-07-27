import type { LoteMatriz } from "@/domain";

/** Rendimento de carcaça fixo utilizado nas estimativas (50%). */
export const RENDIMENTO_CARCACA = 0.5;
/** Peso equivalente a uma arroba, em quilogramas. */
export const PESO_ARROBA_KG = 15;

export interface IndicadoresPeso {
  /** Quantidade de matrizes com o peso preenchido. */
  quantidade: number;
  /** Soma dos pesos individuais em kg. */
  pesoVivoTotal: number;
  /** Peso vivo médio por matriz em kg. */
  pesoVivoMedio: number;
  /** Peso estimado de carcaça em kg (peso vivo × rendimento). */
  pesoCarcaca: number;
  /** Total de arrobas estimadas de carcaça. */
  arrobasTotais: number;
  /** Média estimada de arrobas de carcaça por matriz. */
  arrobasPorMatriz: number;
}

function calcularIndicadores(pesos: number[]): IndicadoresPeso {
  const quantidade = pesos.length;
  const pesoVivoTotal = pesos.reduce((s, p) => s + p, 0);
  if (quantidade === 0) {
    return {
      quantidade: 0,
      pesoVivoTotal: 0,
      pesoVivoMedio: 0,
      pesoCarcaca: 0,
      arrobasTotais: 0,
      arrobasPorMatriz: 0,
    };
  }
  const pesoCarcaca = pesoVivoTotal * RENDIMENTO_CARCACA;
  const arrobasTotais = pesoCarcaca / PESO_ARROBA_KG;
  return {
    quantidade,
    pesoVivoTotal,
    pesoVivoMedio: pesoVivoTotal / quantidade,
    pesoCarcaca,
    arrobasTotais,
    arrobasPorMatriz: arrobasTotais / quantidade,
  };
}

export function indicadoresIniciais(membros: LoteMatriz[]): IndicadoresPeso {
  const pesos = membros
    .map((m) => m.pesoInicial)
    .filter((p): p is number => typeof p === "number" && p > 0);
  return calcularIndicadores(pesos);
}

export function indicadoresFinais(membros: LoteMatriz[]): IndicadoresPeso {
  const pesos = membros
    .map((m) => m.pesoFinal)
    .filter((p): p is number => typeof p === "number" && p > 0);
  return calcularIndicadores(pesos);
}

/** Formata kg com uma casa decimal (padrão pt-BR). */
export function formatKg(value: number | undefined | null): string {
  if (value === undefined || value === null || !Number.isFinite(value) || value === 0) {
    return value === 0 ? "0,0 kg" : "—";
  }
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} kg`;
}

/** Formata arrobas com duas casas decimais (padrão pt-BR). */
export function formatArrobas(value: number | undefined | null): string {
  if (value === undefined || value === null || !Number.isFinite(value)) return "—";
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} @`;
}

export function formatArrobasPorMatriz(value: number | undefined | null): string {
  const base = formatArrobas(value);
  return base === "—" ? "—" : `${base}/matriz`;
}

export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null || !Number.isFinite(value)) return "—";
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

export interface ComparativoFrigorifico {
  mediaSistema: number;
  mediaFrigorifico: number;
  diferencaArrobas: number;
  diferencaKgCarcaca: number;
  diferencaPercentual: number;
}

export function calcularComparativo(
  mediaSistema: number,
  mediaFrigorifico: number,
): ComparativoFrigorifico | null {
  if (!Number.isFinite(mediaSistema) || mediaSistema <= 0) return null;
  if (!Number.isFinite(mediaFrigorifico) || mediaFrigorifico <= 0) return null;
  const diferencaArrobas = mediaSistema - mediaFrigorifico;
  return {
    mediaSistema,
    mediaFrigorifico,
    diferencaArrobas,
    diferencaKgCarcaca: diferencaArrobas * PESO_ARROBA_KG,
    diferencaPercentual: (diferencaArrobas / mediaSistema) * 100,
  };
}

export const NOTA_ESTIMATIVA =
  "Estimativa calculada com rendimento de carcaça de 50% e arroba de 15 kg.";

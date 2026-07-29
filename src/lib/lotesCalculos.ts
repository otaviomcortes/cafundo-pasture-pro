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
  mediaFazenda: number;
  mediaFrigorifico: number;
  /** frigorífico − fazenda */
  diferencaArrobas: number;
  diferencaPercentual: number;
  sentido: "acima" | "abaixo" | "equivalente";
}

export function calcularComparativo(
  mediaFazenda: number,
  mediaFrigorifico: number,
): ComparativoFrigorifico | null {
  if (!Number.isFinite(mediaFazenda) || mediaFazenda <= 0) return null;
  if (!Number.isFinite(mediaFrigorifico) || mediaFrigorifico <= 0) return null;
  const diferencaArrobas = mediaFrigorifico - mediaFazenda;
  const diferencaPercentual = (diferencaArrobas / mediaFazenda) * 100;
  const arredondada = Number(diferencaArrobas.toFixed(2));
  const sentido =
    arredondada > 0 ? "acima" : arredondada < 0 ? "abaixo" : "equivalente";
  return {
    mediaFazenda,
    mediaFrigorifico,
    diferencaArrobas,
    diferencaPercentual,
    sentido,
  };
}

/** Formata arrobas por matriz com sinal explícito (+/-). */
export function formatArrobasComSinal(value: number): string {
  const sinal = Number(value.toFixed(2)) > 0 ? "+" : "";
  return `${sinal}${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} @/matriz`;
}

export function formatPercentComSinal(value: number): string {
  const sinal = Number(value.toFixed(2)) > 0 ? "+" : "";
  return `${sinal}${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

export function descricaoComparativo(c: ComparativoFrigorifico): string {
  if (c.sentido === "equivalente") return "Resultado equivalente à estimativa da fazenda";
  const pct = Math.abs(c.diferencaPercentual).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${pct}% ${c.sentido} da estimativa da fazenda`;
}

export const NOTA_ESTIMATIVA =
  "Estimativa calculada com rendimento de carcaça de 50% e arroba de 15 kg.";


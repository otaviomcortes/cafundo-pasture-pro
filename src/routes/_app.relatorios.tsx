import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  matrizService,
  partoService,
  protocoloIatfService,
  protocoloMatrizService,
  descarteService,
} from "@/domain/services";
import {
  PROPRIETARIOS_MATRIZ,
  PROPRIETARIO_LABEL,
  type ProprietarioMatriz,
} from "@/domain/matriz";
import { STATUS_LABEL, SITUACAO_LABEL } from "@/lib/matrizUi";
import { SEXO_LABEL } from "@/lib/partoUi";
import { MOTIVO_DESCARTE_LABEL } from "@/lib/descarteUi";
import { STATUS_PROTOCOLO_LABEL } from "@/lib/protocoloIatfUi";

export const Route = createFileRoute("/_app/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Cafundó" }] }),
  component: RelatoriosPage,
});

type Filtros = {
  inicio: string;
  fim: string;
  proprietario: "todos" | ProprietarioMatriz;
};

function inRange(iso: string, inicio: string, fim: string) {
  const t = new Date(iso).getTime();
  if (inicio) {
    const ti = new Date(`${inicio}T00:00:00`).getTime();
    if (t < ti) return false;
  }
  if (fim) {
    const tf = new Date(`${fim}T23:59:59`).getTime();
    if (t > tf) return false;
  }
  return true;
}

function StatItem({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
      <div className="border-b border-border bg-secondary/40 px-5 py-4">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="px-5 py-3">{children}</div>
    </Card>
  );
}

function RelatoriosPage() {
  const [filtros, setFiltros] = useState<Filtros>({
    inicio: "",
    fim: "",
    proprietario: "todos",
  });

  const { data: matrizes = [] } = useQuery({
    queryKey: ["matrizes"],
    queryFn: () => matrizService.listar(),
  });
  const { data: partos = [] } = useQuery({
    queryKey: ["partos"],
    queryFn: () => partoService.listar(),
  });
  const { data: protocolos = [] } = useQuery({
    queryKey: ["protocolos-iatf"],
    queryFn: () => protocoloIatfService.listar(),
  });
  const { data: participacoes = [] } = useQuery({
    queryKey: ["protocolos-matrizes"],
    queryFn: () => protocoloMatrizService.listar(),
  });
  const { data: descartes = [] } = useQuery({
    queryKey: ["descartes"],
    queryFn: () => descarteService.listar(),
  });

  const matrizesById = useMemo(
    () => new Map(matrizes.map((m) => [m.id, m])),
    [matrizes],
  );

  const matrizesFiltradas = useMemo(() => {
    if (filtros.proprietario === "todos") return matrizes;
    return matrizes.filter((m) => m.proprietario === filtros.proprietario);
  }, [matrizes, filtros.proprietario]);

  const partosFiltrados = useMemo(() => {
    return partos.filter((p) => {
      if (!inRange(p.dataParto, filtros.inicio, filtros.fim)) return false;
      if (filtros.proprietario !== "todos") {
        const m = matrizesById.get(p.matrizId);
        if (!m || m.proprietario !== filtros.proprietario) return false;
      }
      return true;
    });
  }, [partos, matrizesById, filtros]);

  const descartesFiltrados = useMemo(() => {
    return descartes.filter((d) => {
      if (!inRange(d.dataDescarte, filtros.inicio, filtros.fim)) return false;
      if (filtros.proprietario !== "todos") {
        const m = matrizesById.get(d.matrizId);
        if (!m || m.proprietario !== filtros.proprietario) return false;
      }
      return true;
    });
  }, [descartes, matrizesById, filtros]);

  // --- Relatório de Matrizes ---
  const porProprietario = PROPRIETARIOS_MATRIZ.map((p) => ({
    proprietario: p,
    total: matrizesFiltradas.filter((m) => m.proprietario === p).length,
  }));

  const statusKeys: Array<keyof typeof STATUS_LABEL> = [
    "ativa",
    "descartada",
    "vendida",
    "morta",
  ];
  const porStatus = statusKeys.map((s) => ({
    status: s,
    total: matrizesFiltradas.filter((m) => m.status === s).length,
  }));

  const situacaoKeys: Array<keyof typeof SITUACAO_LABEL> = [
    "apta",
    "prenha",
    "vazia",
    "em_protocolo",
  ];
  const porSituacao = situacaoKeys.map((s) => ({
    situacao: s,
    total: matrizesFiltradas.filter(
      (m) => m.status === "ativa" && m.situacaoReprodutiva === s,
    ).length,
  }));

  // --- Relatório de Partos ---
  const machos = partosFiltrados.filter((p) => p.sexoBezerro === "macho").length;
  const femeas = partosFiltrados.filter((p) => p.sexoBezerro === "femea").length;
  const partosPorRaca = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of partosFiltrados) {
      map.set(p.racaBezerro, (map.get(p.racaBezerro) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [partosFiltrados]);

  // --- Relatório de Protocolos IATF ---
  const emAndamento = protocolos.filter((p) => p.status === "em_andamento").length;
  const concluidos = protocolos.filter((p) => p.status === "finalizado").length;
  const matrizesEmProtocoloTotal = participacoes.length;
  const diagPrenhas = participacoes.filter((p) => p.diagnosticoPrenhez === "prenha").length;
  const diagVazias = participacoes.filter((p) => p.diagnosticoPrenhez === "vazia").length;
  const diagNaoAvaliadas = participacoes.filter((p) => p.diagnosticoPrenhez === "nao_avaliada").length;

  // --- Relatório de Descartes ---
  const totalDescartes = descartesFiltrados.length;
  const pesoMedio =
    totalDescartes === 0
      ? 0
      : Math.round(descartesFiltrados.reduce((s, d) => s + d.peso, 0) / totalDescartes);
  const descartesPorMotivo = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of descartesFiltrados) {
      const label = MOTIVO_DESCARTE_LABEL[d.motivo];
      map.set(label, (map.get(label) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [descartesFiltrados]);
  const descartesPorProprietario = PROPRIETARIOS_MATRIZ.map((p) => ({
    proprietario: p,
    total: descartesFiltrados.filter((d) => {
      const m = matrizesById.get(d.matrizId);
      return m?.proprietario === p;
    }).length,
  }));

  const limparFiltros = () =>
    setFiltros({ inicio: "", fim: "", proprietario: "todos" });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Análise consolidada</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Relatórios</h1>
      </div>

      {/* Filtros */}
      <Card className="p-5 shadow-[var(--shadow-card)]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="inicio">Período inicial</Label>
            <Input
              id="inicio"
              type="date"
              value={filtros.inicio}
              onChange={(e) => setFiltros((f) => ({ ...f, inicio: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fim">Período final</Label>
            <Input
              id="fim"
              type="date"
              value={filtros.fim}
              onChange={(e) => setFiltros((f) => ({ ...f, fim: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Proprietário</Label>
            <Select
              value={filtros.proprietario}
              onValueChange={(v) =>
                setFiltros((f) => ({ ...f, proprietario: v as Filtros["proprietario"] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {PROPRIETARIOS_MATRIZ.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PROPRIETARIO_LABEL[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={limparFiltros} className="w-full">
              Limpar filtros
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Matrizes" subtitle="Distribuição do rebanho">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Por proprietário</p>
              {porProprietario.map((x) => (
                <StatItem key={x.proprietario} label={PROPRIETARIO_LABEL[x.proprietario]} value={x.total} />
              ))}
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Por status</p>
              {porStatus.map((x) => (
                <StatItem key={x.status} label={STATUS_LABEL[x.status]} value={x.total} />
              ))}
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Situação reprodutiva</p>
              {porSituacao.map((x) => (
                <StatItem key={x.situacao} label={SITUACAO_LABEL[x.situacao]} value={x.total} />
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Partos" subtitle="Considerando filtros aplicados">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <StatItem label="Total no período" value={partosFiltrados.length} />
              <StatItem label={SEXO_LABEL.macho + "s"} value={machos} />
              <StatItem label={SEXO_LABEL.femea + "s"} value={femeas} />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Por raça do bezerro</p>
              {partosPorRaca.length === 0 && (
                <p className="py-2 text-sm text-muted-foreground">Sem registros.</p>
              )}
              {partosPorRaca.map(([raca, total]) => (
                <StatItem key={raca} label={raca} value={total} />
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Protocolos IATF" subtitle="Visão geral dos protocolos">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <StatItem label="Em andamento" value={emAndamento} />
              <StatItem label="Concluídos" value={concluidos} />
              <StatItem label="Matrizes em protocolo" value={matrizesEmProtocoloTotal} />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Diagnósticos</p>
              <StatItem label="Prenhas" value={diagPrenhas} />
              <StatItem label="Vazias" value={diagVazias} />
              <StatItem label="Não avaliadas" value={diagNaoAvaliadas} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["planejado", "em_andamento", "aguardando_diagnostico", "finalizado"] as const).map((s) => (
              <Badge key={s} variant="outline">
                {STATUS_PROTOCOLO_LABEL[s]}: {protocolos.filter((p) => p.status === s).length}
              </Badge>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Descartes" subtitle="Considerando filtros aplicados">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <StatItem label="Total no período" value={totalDescartes} />
              <StatItem label="Peso médio (kg)" value={pesoMedio} />
              <p className="mt-3 mb-1 text-xs font-medium uppercase text-muted-foreground">Por proprietário</p>
              {descartesPorProprietario.map((x) => (
                <StatItem key={x.proprietario} label={PROPRIETARIO_LABEL[x.proprietario]} value={x.total} />
              ))}
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Por motivo</p>
              {descartesPorMotivo.length === 0 && (
                <p className="py-2 text-sm text-muted-foreground">Sem registros.</p>
              )}
              {descartesPorMotivo.map(([motivo, total]) => (
                <StatItem key={motivo} label={motivo} value={total} />
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

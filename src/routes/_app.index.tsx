import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Beef,
  HeartPulse,
  HeartCrack,
  Syringe,
  Baby,
  PackageMinus,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import {
  matrizService,
  partoService,
  protocoloIatfService,
  protocoloMatrizService,
  descarteService,
} from "@/domain/services";
import { SEXO_LABEL } from "@/lib/partoUi";
import { STATUS_PROTOCOLO_LABEL, STATUS_PROTOCOLO_BADGE } from "@/lib/protocoloIatfUi";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [{ title: "Dashboard — Cafundó" }],
  }),
  component: Dashboard,
});

const toneClasses: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  accent: "bg-accent/15 text-accent",
  destructive: "bg-destructive/10 text-destructive",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function Dashboard() {
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

  const ativas = matrizes.filter((m) => m.status === "ativa");
  const prenhas = ativas.filter((m) => m.situacaoReprodutiva === "prenha").length;
  const vazias = ativas.filter((m) => m.situacaoReprodutiva === "vazia").length;
  const emProtocolo = ativas.filter((m) => m.situacaoReprodutiva === "em_protocolo").length;

  const anoAtual = new Date().getFullYear();
  const partosAno = partos.filter((p) => new Date(p.dataParto).getFullYear() === anoAtual).length;
  const descartesAno = descartes.filter((d) => new Date(d.dataDescarte).getFullYear() === anoAtual).length;

  const totalAtivas = ativas.length;
  const pct = (n: number) =>
    totalAtivas === 0 ? "0%" : `${Math.round((n / totalAtivas) * 100)}% do rebanho`;

  const statCards = [
    { key: "matrizesAtivas", title: "Matrizes Ativas", icon: Beef, value: totalAtivas, trend: `${matrizes.length} no total`, tone: "primary" },
    { key: "matrizesPrenhas", title: "Matrizes Prenhas", icon: HeartPulse, value: prenhas, trend: pct(prenhas), tone: "success" },
    { key: "matrizesVazias", title: "Matrizes Vazias", icon: HeartCrack, value: vazias, trend: pct(vazias), tone: "warning" },
    { key: "matrizesEmProtocolo", title: "Em Protocolo IATF", icon: Syringe, value: emProtocolo, trend: pct(emProtocolo), tone: "accent" },
    { key: "partos", title: "Partos no Ano", icon: Baby, value: partosAno, trend: `${partos.length} registrados`, tone: "primary" },
    { key: "descartes", title: "Descartes no Ano", icon: PackageMinus, value: descartesAno, trend: `${descartes.length} registrados`, tone: "destructive" },
  ];

  const ultimosPartos = [...partos]
    .sort((a, b) => new Date(b.dataParto).getTime() - new Date(a.dataParto).getTime())
    .slice(0, 5);

  const protocolosEmAndamento = protocolos.filter((p) => p.status === "em_andamento");

  const matrizesById = new Map(matrizes.map((m) => [m.id, m]));
  const countMatrizesProtocolo = (protocoloId: string) =>
    participacoes.filter((pm) => pm.protocoloId === protocoloId).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Visão geral da fazenda</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link to="/matrizes">
              Ir para matrizes <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((c) => (
          <Card key={c.key} className="p-5 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-elevated)]">
            <div className="flex items-start justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${toneClasses[c.tone]}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{c.title}</p>
              <p className="font-display text-3xl font-bold tracking-tight">
                {c.value.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-muted-foreground">{c.trend}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-4">
            <div>
              <h3 className="font-display text-lg font-semibold">Últimos Partos</h3>
              <p className="text-xs text-muted-foreground">5 registros mais recentes</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-accent">
              <Link to="/partos">
                Ver todos <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matriz</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead>Raça do Bezerro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ultimosPartos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum parto registrado.
                  </TableCell>
                </TableRow>
              )}
              {ultimosPartos.map((p) => {
                const m = matrizesById.get(p.matrizId);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{m ? `#${m.numeroBrinco}` : "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(p.dataParto)}</TableCell>
                    <TableCell>{SEXO_LABEL[p.sexoBezerro]}</TableCell>
                    <TableCell>{p.racaBezerro}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-4">
            <div>
              <h3 className="font-display text-lg font-semibold">Protocolos Ativos</h3>
              <p className="text-xs text-muted-foreground">IATF em andamento</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-accent">
              <Link to="/protocolos-iatf">
                Ver todos <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Etapa 1 (D0)</TableHead>
                <TableHead className="text-center">Matrizes</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {protocolosEmAndamento.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum protocolo em andamento.
                  </TableCell>
                </TableRow>
              )}
              {protocolosEmAndamento.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(p.dataEtapa1)}</TableCell>
                  <TableCell className="text-center font-medium">{countMatrizesProtocolo(p.id)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_PROTOCOLO_BADGE[p.status]}>
                      {STATUS_PROTOCOLO_LABEL[p.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

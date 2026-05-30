import { createFileRoute } from "@tanstack/react-router";
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
import { dashboardStats, ultimosPartos, protocolosAtivos } from "@/lib/mockData";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [{ title: "Dashboard — Cafundó" }],
  }),
  component: Dashboard,
});

const statCards = [
  { key: "matrizesAtivas", title: "Matrizes Ativas", icon: Beef, value: dashboardStats.matrizesAtivas, trend: "+12 no mês", tone: "primary" },
  { key: "matrizesPrenhas", title: "Matrizes Prenhas", icon: HeartPulse, value: dashboardStats.matrizesPrenhas, trend: "61% do rebanho", tone: "success" },
  { key: "matrizesVazias", title: "Matrizes Vazias", icon: HeartCrack, value: dashboardStats.matrizesVazias, trend: "26% do rebanho", tone: "warning" },
  { key: "matrizesEmProtocolo", title: "Em Protocolo IATF", icon: Syringe, value: dashboardStats.matrizesEmProtocolo, trend: "4 lotes ativos", tone: "accent" },
  { key: "partos", title: "Partos no Ano", icon: Baby, value: dashboardStats.partosNoAno, trend: "+18% vs 2025", tone: "primary" },
  { key: "descartes", title: "Descartes no Ano", icon: PackageMinus, value: dashboardStats.descartesNoAno, trend: "-8% vs 2025", tone: "destructive" },
] as const;

const toneClasses: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  accent: "bg-accent/15 text-accent",
  destructive: "bg-destructive/10 text-destructive",
};

function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Visão geral da fazenda</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Exportar</Button>
          <Button size="sm">
            Nova matriz <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stat cards */}
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

      {/* Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-4">
            <div>
              <h3 className="font-display text-lg font-semibold">Últimos Partos</h3>
              <p className="text-xs text-muted-foreground">Registros mais recentes</p>
            </div>
            <Button variant="ghost" size="sm" className="text-accent">
              Ver todos <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matriz</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ultimosPartos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.brinco}</TableCell>
                  <TableCell className="text-muted-foreground">{p.data}</TableCell>
                  <TableCell>{p.sexoBezerro}</TableCell>
                  <TableCell>{p.peso}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="secondary"
                      className={p.status === "Saudável" ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground"}
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-4">
            <div>
              <h3 className="font-display text-lg font-semibold">Protocolos Ativos</h3>
              <p className="text-xs text-muted-foreground">IATF em andamento</p>
            </div>
            <Button variant="ghost" size="sm" className="text-accent">
              Ver todos <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lote</TableHead>
                <TableHead>Início</TableHead>
                <TableHead className="text-center">Matrizes</TableHead>
                <TableHead>Etapa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {protocolosAtivos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.nome}</div>
                    <div className="text-xs text-muted-foreground">{p.responsavel}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.inicio}</TableCell>
                  <TableCell className="text-center font-medium">{p.matrizes}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-accent/40 text-accent">
                      {p.etapa}
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

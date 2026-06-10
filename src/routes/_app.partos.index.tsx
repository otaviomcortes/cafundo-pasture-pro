import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Eye, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  partoService,
  matrizService,
  type SexoBezerro,
} from "@/domain";
import { SEXO_BADGE, SEXO_LABEL, formatDate } from "@/lib/partoUi";

export const Route = createFileRoute("/_app/partos/")({
  head: () => ({ meta: [{ title: "Partos — Cafundó" }] }),
  component: PartosPage,
});

type SexoFiltro = SexoBezerro | "todos";
type PeriodoFiltro = "todos" | "30" | "90" | "365";

function PartosPage() {
  const navigate = useNavigate();

  const { data: partos = [], isLoading } = useQuery({
    queryKey: ["partos"],
    queryFn: () => partoService.listar(),
  });
  const { data: matrizes = [] } = useQuery({
    queryKey: ["matrizes"],
    queryFn: () => matrizService.listar(),
  });

  const matrizPorId = useMemo(() => {
    const m = new Map<string, string>();
    matrizes.forEach((x) => m.set(x.id, x.numeroBrinco));
    return m;
  }, [matrizes]);

  const [busca, setBusca] = useState("");
  const [sexoFiltro, setSexoFiltro] = useState<SexoFiltro>("todos");
  const [periodoFiltro, setPeriodoFiltro] = useState<PeriodoFiltro>("todos");

  const resumo = useMemo(() => {
    const agora = Date.now();
    const umAnoMs = 365 * 24 * 60 * 60 * 1000;
    const trintaDiasMs = 30 * 24 * 60 * 60 * 1000;
    const noAno = partos.filter(
      (p) => agora - new Date(p.dataParto).getTime() <= umAnoMs,
    );
    return {
      ano: noAno.length,
      machos: noAno.filter((p) => p.sexoBezerro === "macho").length,
      femeas: noAno.filter((p) => p.sexoBezerro === "femea").length,
      ultimos30: partos.filter(
        (p) => agora - new Date(p.dataParto).getTime() <= trintaDiasMs,
      ).length,
    };
  }, [partos]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const agora = Date.now();
    const periodoMs =
      periodoFiltro === "todos"
        ? null
        : Number(periodoFiltro) * 24 * 60 * 60 * 1000;
    return partos
      .filter((p) => {
        if (sexoFiltro !== "todos" && p.sexoBezerro !== sexoFiltro) return false;
        if (periodoMs && agora - new Date(p.dataParto).getTime() > periodoMs)
          return false;
        if (termo) {
          const brinco = matrizPorId.get(p.matrizId) ?? "";
          if (!brinco.toLowerCase().includes(termo)) return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.dataParto).getTime() - new Date(a.dataParto).getTime(),
      );
  }, [partos, sexoFiltro, periodoFiltro, busca, matrizPorId]);

  const cards = [
    {
      title: "Partos no ano",
      value: resumo.ano,
      icon: Baby,
      tone: "primary",
    },
    { title: "Machos", value: resumo.machos, icon: Mars, tone: "info" },
    { title: "Fêmeas", value: resumo.femeas, icon: Venus, tone: "success" },
    {
      title: "Últimos 30 dias",
      value: resumo.ultimos30,
      icon: CalendarClock,
      tone: "warning",
    },
  ] as const;

  const toneClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    info: "bg-info/15 text-info",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Reprodução</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Partos
          </h1>
        </div>
        <Button onClick={() => navigate({ to: "/partos/novo" })}>
          <Plus className="mr-1 h-4 w-4" /> Novo Parto
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card
            key={c.title}
            className="p-4 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-elevated)]"
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses[c.tone]}`}
            >
              <c.icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              {c.title}
            </p>
            <p className="font-display text-2xl font-bold tracking-tight">
              {c.value.toLocaleString("pt-BR")}
            </p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-secondary/40 px-5 py-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por brinco da matriz..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={sexoFiltro}
            onValueChange={(v) => setSexoFiltro(v as SexoFiltro)}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Sexo do bezerro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os sexos</SelectItem>
              <SelectItem value="macho">Machos</SelectItem>
              <SelectItem value="femea">Fêmeas</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={periodoFiltro}
            onValueChange={(v) => setPeriodoFiltro(v as PeriodoFiltro)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todo o período</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto text-xs text-muted-foreground">
            {filtrados.length} de {partos.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Brinco da matriz</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead>Raça</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Carregando partos...
                  </TableCell>
                </TableRow>
              ) : filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Nenhum parto encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.slice(0, 100).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.dataParto)}</TableCell>
                    <TableCell className="font-medium">
                      {matrizPorId.get(p.matrizId) ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={SEXO_BADGE[p.sexoBezerro]}>
                        {SEXO_LABEL[p.sexoBezerro]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.racaBezerro}</TableCell>
                    <TableCell className="max-w-[260px] truncate text-muted-foreground" title={p.observacoes ?? ""}>
                      {p.observacoes ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            navigate({ to: "/partos/$id", params: { id: p.id } })
                          }
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Visualizar</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            navigate({
                              to: "/partos/$id/editar",
                              params: { id: p.id },
                            })
                          }
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filtrados.length > 100 && (
            <div className="border-t border-border bg-secondary/30 px-5 py-3 text-center text-xs text-muted-foreground">
              Exibindo os primeiros 100 partos. Use os filtros para refinar.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

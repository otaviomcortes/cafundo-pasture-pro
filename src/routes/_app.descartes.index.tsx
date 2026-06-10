import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Eye, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  descarteService,
  matrizService,
  MOTIVOS_DESCARTE,
  PROPRIETARIOS_MATRIZ,
  PROPRIETARIO_LABEL,
  type MotivoDescarte,
  type ProprietarioMatriz,
} from "@/domain";
import {
  MOTIVO_DESCARTE_LABEL,
  DESTINO_DESCARTE_LABEL,
  formatDate,
} from "@/lib/descarteUi";

export const Route = createFileRoute("/_app/descartes/")({
  head: () => ({ meta: [{ title: "Descartes — Cafundó" }] }),
  component: DescartesPage,
});

type MotivoFiltro = MotivoDescarte | "todos";
type ProprietarioFiltro = ProprietarioMatriz | "todos";
type PeriodoFiltro = "todos" | "30" | "90" | "365";

function DescartesPage() {
  const navigate = useNavigate();

  const { data: descartes = [], isLoading } = useQuery({
    queryKey: ["descartes"],
    queryFn: () => descarteService.listar(),
  });
  const { data: matrizes = [] } = useQuery({
    queryKey: ["matrizes"],
    queryFn: () => matrizService.listar(),
  });

  const matrizPorId = useMemo(() => {
    const m = new Map<string, (typeof matrizes)[number]>();
    matrizes.forEach((x) => m.set(x.id, x));
    return m;
  }, [matrizes]);

  const [busca, setBusca] = useState("");
  const [motivoFiltro, setMotivoFiltro] = useState<MotivoFiltro>("todos");
  const [proprietarioFiltro, setProprietarioFiltro] =
    useState<ProprietarioFiltro>("todos");
  const [periodoFiltro, setPeriodoFiltro] = useState<PeriodoFiltro>("todos");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const agora = Date.now();
    const periodoMs =
      periodoFiltro === "todos"
        ? null
        : Number(periodoFiltro) * 24 * 60 * 60 * 1000;
    return descartes
      .filter((d) => {
        const matriz = matrizPorId.get(d.matrizId);
        if (motivoFiltro !== "todos" && d.motivo !== motivoFiltro) return false;
        if (
          proprietarioFiltro !== "todos" &&
          matriz?.proprietario !== proprietarioFiltro
        )
          return false;
        if (periodoMs && agora - new Date(d.dataDescarte).getTime() > periodoMs)
          return false;
        if (termo) {
          const brinco = matriz?.numeroBrinco ?? "";
          if (!brinco.toLowerCase().includes(termo)) return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.dataDescarte).getTime() -
          new Date(a.dataDescarte).getTime(),
      );
  }, [descartes, motivoFiltro, proprietarioFiltro, periodoFiltro, busca, matrizPorId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Saída do rebanho</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Descartes
          </h1>
        </div>
        <Button onClick={() => navigate({ to: "/descartes/novo" })}>
          <Plus className="mr-1 h-4 w-4" /> Novo Descarte
        </Button>
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
            value={proprietarioFiltro}
            onValueChange={(v) =>
              setProprietarioFiltro(v as ProprietarioFiltro)
            }
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Proprietário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos proprietários</SelectItem>
              {PROPRIETARIOS_MATRIZ.map((p) => (
                <SelectItem key={p} value={p}>
                  {PROPRIETARIO_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={motivoFiltro}
            onValueChange={(v) => setMotivoFiltro(v as MotivoFiltro)}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Motivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os motivos</SelectItem>
              {MOTIVOS_DESCARTE.map((m) => (
                <SelectItem key={m} value={m}>
                  {MOTIVO_DESCARTE_LABEL[m]}
                </SelectItem>
              ))}
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
            {filtrados.length} de {descartes.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Brinco</TableHead>
                <TableHead>Proprietário</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-right">Peso (kg)</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Carregando descartes...
                  </TableCell>
                </TableRow>
              ) : filtrados.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Nenhum descarte encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((d) => {
                  const matriz = matrizPorId.get(d.matrizId);
                  return (
                    <TableRow key={d.id}>
                      <TableCell>{formatDate(d.dataDescarte)}</TableCell>
                      <TableCell className="font-medium">
                        {matriz?.numeroBrinco ?? "—"}
                      </TableCell>
                      <TableCell>
                        {matriz
                          ? PROPRIETARIO_LABEL[matriz.proprietario]
                          : "—"}
                      </TableCell>
                      <TableCell>{MOTIVO_DESCARTE_LABEL[d.motivo]}</TableCell>
                      <TableCell className="text-right">
                        {d.peso.toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell>{DESTINO_DESCARTE_LABEL[d.destino]}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              navigate({
                                to: "/descartes/$id",
                                params: { id: d.id },
                              })
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
                                to: "/descartes/$id/editar",
                                params: { id: d.id },
                              })
                            }
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

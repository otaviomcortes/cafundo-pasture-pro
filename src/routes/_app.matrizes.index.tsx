import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Beef,
  HeartPulse,
  HeartCrack,
  Syringe,
  PackageMinus,
  Plus,
  Search,
  Eye,
  Pencil,
} from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  matrizService,
  partoService,
  PROPRIETARIOS_MATRIZ,
  PROPRIETARIO_LABEL,
  type Matriz,
  type MatrizInput,
  type MatrizStatus,
  type ProprietarioMatriz,
  type SituacaoReprodutiva,
} from "@/domain";
import { indexarPartosPorMatriz } from "@/lib/validacoes";
import {
  STATUS_LABEL,
  SITUACAO_LABEL,
  STATUS_BADGE,
  SITUACAO_BADGE,
  calcularIdade,
} from "@/lib/matrizUi";
import {
  MatrizForm,
  emptyMatrizForm,
  matrizToForm,
} from "@/components/matrizes/MatrizForm";

export const Route = createFileRoute("/_app/matrizes/")({
  head: () => ({
    meta: [{ title: "Matrizes — Cafundó" }],
  }),
  component: MatrizesPage,
});

type StatusFiltro = MatrizStatus | "todos";
type SituacaoFiltro = SituacaoReprodutiva | "todas";
type ProprietarioFiltro = ProprietarioMatriz | "todos";

function MatrizesPage() {
  const navigate = useNavigate();
  const { data: matrizes = [], isLoading } = useQuery({
    queryKey: ["matrizes"],
    queryFn: () => matrizService.listar(),
  });
  const { data: partos = [] } = useQuery({
    queryKey: ["partos"],
    queryFn: () => partoService.listar(),
  });
  const partosPorMatriz = useMemo(() => indexarPartosPorMatriz(partos), [partos]);


  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("todos");
  const [situacaoFiltro, setSituacaoFiltro] = useState<SituacaoFiltro>("todas");
  const [proprietarioFiltro, setProprietarioFiltro] =
    useState<ProprietarioFiltro>("todos");

  const qc = useQueryClient();
  const [novaOpen, setNovaOpen] = useState(false);
  const [editando, setEditando] = useState<Matriz | null>(null);

  const criarMut = useMutation({
    mutationFn: (input: MatrizInput) => matrizService.criar(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matrizes"] });
      toast.success("Matriz cadastrada com sucesso.");
      setNovaOpen(false);
    },
    onError: () => toast.error("Não foi possível cadastrar a matriz."),
  });

  const atualizarMut = useMutation({
    mutationFn: ({ id, input }: { id: string; input: MatrizInput }) =>
      matrizService.atualizar(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matrizes"] });
      toast.success("Matriz atualizada com sucesso.");
      setEditando(null);
    },
    onError: () => toast.error("Não foi possível atualizar a matriz."),
  });

  const resumo = useMemo(() => {
    const total = matrizes.length;
    const ativas = matrizes.filter((m) => m.status === "ativa");
    return {
      total,
      ativas: ativas.length,
      prenhas: ativas.filter((m) => m.situacaoReprodutiva === "prenha").length,
      vazias: ativas.filter((m) => m.situacaoReprodutiva === "vazia").length,
      emProtocolo: ativas.filter(
        (m) => m.situacaoReprodutiva === "em_protocolo",
      ).length,
      descartadas: matrizes.filter((m) => m.status === "descartada").length,
    };
  }, [matrizes]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return matrizes.filter((m) => {
      if (termo && !m.numeroBrinco.toLowerCase().includes(termo)) return false;
      if (statusFiltro !== "todos" && m.status !== statusFiltro) return false;
      if (
        situacaoFiltro !== "todas" &&
        m.situacaoReprodutiva !== situacaoFiltro
      )
        return false;
      if (
        proprietarioFiltro !== "todos" &&
        m.proprietario !== proprietarioFiltro
      )
        return false;
      return true;
    });
  }, [matrizes, busca, statusFiltro, situacaoFiltro, proprietarioFiltro]);


  const cards = [
    { title: "Total", value: resumo.total, icon: Beef, tone: "primary" },
    { title: "Ativas", value: resumo.ativas, icon: Beef, tone: "success" },
    {
      title: "Prenhas",
      value: resumo.prenhas,
      icon: HeartPulse,
      tone: "success",
    },
    {
      title: "Vazias",
      value: resumo.vazias,
      icon: HeartCrack,
      tone: "warning",
    },
    {
      title: "Em protocolo",
      value: resumo.emProtocolo,
      icon: Syringe,
      tone: "info",
    },
    {
      title: "Descartadas",
      value: resumo.descartadas,
      icon: PackageMinus,
      tone: "destructive",
    },
  ] as const;

  const toneClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    info: "bg-info/15 text-info",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Rebanho reprodutivo</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Matrizes
          </h1>
        </div>
        <Button onClick={() => setNovaOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Nova Matriz
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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

      {/* Filtros + tabela */}
      <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-secondary/40 px-5 py-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por brinco..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFiltro}
            onValueChange={(v) => setStatusFiltro(v as StatusFiltro)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {(Object.keys(STATUS_LABEL) as MatrizStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={situacaoFiltro}
            onValueChange={(v) => setSituacaoFiltro(v as SituacaoFiltro)}
          >
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Situação reprodutiva" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as situações</SelectItem>
              {(Object.keys(SITUACAO_LABEL) as SituacaoReprodutiva[]).map(
                (s) => (
                  <SelectItem key={s} value={s}>
                    {SITUACAO_LABEL[s]}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <Select
            value={proprietarioFiltro}
            onValueChange={(v) => setProprietarioFiltro(v as ProprietarioFiltro)}
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
          <div className="ml-auto text-xs text-muted-foreground">
            {filtradas.length} de {matrizes.length}
          </div>
        </div>


        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brinco</TableHead>
                <TableHead>Proprietário</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Situação Reprodutiva</TableHead>
                <TableHead className="text-center">Partos</TableHead>
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
                    Carregando matrizes...
                  </TableCell>
                </TableRow>
              ) : filtradas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Nenhuma matriz encontrada com os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                filtradas.slice(0, 100).map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      {m.numeroBrinco}
                    </TableCell>
                    <TableCell>{PROPRIETARIO_LABEL[m.proprietario]}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {calcularIdade(m.dataNascimento)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={STATUS_BADGE[m.status]}
                      >
                        {STATUS_LABEL[m.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={SITUACAO_BADGE[m.situacaoReprodutiva]}
                      >
                        {SITUACAO_LABEL[m.situacaoReprodutiva]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {partosPorMatriz.get(m.id) ?? 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            navigate({
                              to: "/matrizes/$id",
                              params: { id: m.id },
                            })
                          }
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Visualizar</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditando(m)}
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
          {filtradas.length > 100 && (
            <div className="border-t border-border bg-secondary/30 px-5 py-3 text-center text-xs text-muted-foreground">
              Exibindo as primeiras 100 matrizes. Use os filtros para refinar.
            </div>
          )}
        </div>
      </Card>

      {/* Nova Matriz */}
      <Dialog open={novaOpen} onOpenChange={(o) => !criarMut.isPending && setNovaOpen(o)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova matriz</DialogTitle>
            <DialogDescription>
              Cadastre uma nova matriz no rebanho.
            </DialogDescription>
          </DialogHeader>
          <MatrizForm
            initial={emptyMatrizForm()}
            matrizes={matrizes}
            submitting={criarMut.isPending}
            submitLabel="Salvar matriz"
            onSubmit={(input) => criarMut.mutate(input)}
            onCancel={() => setNovaOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Editar Matriz */}
      <Dialog
        open={!!editando}
        onOpenChange={(o) => !atualizarMut.isPending && !o && setEditando(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar matriz</DialogTitle>
            <DialogDescription>
              {editando && `Brinco ${editando.numeroBrinco}`}
            </DialogDescription>
          </DialogHeader>
          {editando && (
            <MatrizForm
              initial={matrizToForm(editando)}
              matrizes={matrizes}
              editingId={editando.id}
              submitting={atualizarMut.isPending}
              submitLabel="Salvar alterações"
              onSubmit={(input) =>
                atualizarMut.mutate({ id: editando.id, input })
              }
              onCancel={() => setEditando(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, PackageCheck, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  loteFrigorificoService,
  loteMatrizService,
  matrizService,
  descarteService,
  PROPRIETARIO_LABEL,
} from "@/domain";
import {
  STATUS_LOTE_LABEL,
  STATUS_LOTE_BADGE,
  formatDate,
  fromDateInput,
  toDateInput,
  formatReais,
} from "@/lib/loteFrigorificoUi";
import {
  indicadoresIniciais,
  indicadoresFinais,
  calcularComparativo,
  formatKg,
  formatArrobasPorMatriz,
  formatArrobas,
  formatPercent,
  NOTA_ESTIMATIVA,
} from "@/lib/lotesCalculos";

export const Route = createFileRoute("/_app/descartes/lotes/$loteId")({
  head: () => ({ meta: [{ title: "Lote para Frigorífico — Cafundó" }] }),
  component: LoteDetalhePage,
});

function LoteDetalhePage() {
  const { loteId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const loteQ = useQuery({
    queryKey: ["lote", loteId],
    queryFn: () => loteFrigorificoService.buscarPorId(loteId),
  });
  const membrosQ = useQuery({
    queryKey: ["loteMatrizes", loteId],
    queryFn: () => loteMatrizService.listarPorLote(loteId),
  });
  const matrizesQ = useQuery({
    queryKey: ["matrizes"],
    queryFn: () => matrizService.listar(),
  });
  const descartesQ = useQuery({
    queryKey: ["descartes"],
    queryFn: () => descarteService.listar(),
  });
  const todosLoteMatQ = useQuery({
    queryKey: ["loteMatrizes"],
    queryFn: () => loteMatrizService.listar(),
  });

  const lote = loteQ.data;
  const membros = membrosQ.data ?? [];
  const matrizes = matrizesQ.data ?? [];
  const descartes = descartesQ.data ?? [];
  const todosLoteMat = todosLoteMatQ.data ?? [];

  const matrizPorId = useMemo(() => {
    const m = new Map<string, (typeof matrizes)[number]>();
    matrizes.forEach((x) => m.set(x.id, x));
    return m;
  }, [matrizes]);

  const [addOpen, setAddOpen] = useState(false);
  const [confirmDeleteMat, setConfirmDeleteMat] = useState<string | null>(null);
  const [confirmDeleteLote, setConfirmDeleteLote] = useState(false);
  const [finalizarOpen, setFinalizarOpen] = useState(false);

  const salvarDadosMut = useMutation({
    mutationFn: async (patch: {
      nome?: string;
      dataInicioConfinamento?: string;
      observacoes?: string;
    }) => loteFrigorificoService.atualizar(loteId, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lote", loteId] });
      qc.invalidateQueries({ queryKey: ["lotes"] });
    },
    onError: () => toast.error("Não foi possível salvar os dados do lote."),
  });

  const adicionarMut = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const matrizId of ids) {
        await loteMatrizService.adicionar({ loteId, matrizId });
      }
      return ids.length;
    },
    onSuccess: (qtd) => {
      qc.invalidateQueries({ queryKey: ["loteMatrizes"] });
      qc.invalidateQueries({ queryKey: ["loteMatrizes", loteId] });
      toast.success(
        qtd === 1 ? "1 matriz adicionada ao lote." : `${qtd} matrizes adicionadas ao lote.`,
      );
    },
    onError: () => toast.error("Não foi possível adicionar as matrizes."),
  });

  const atualizarPesoMut = useMutation({
    mutationFn: async ({
      id,
      campo,
      valor,
    }: {
      id: string;
      campo: "pesoInicial" | "pesoFinal";
      valor: number | undefined;
    }) => loteMatrizService.atualizar(id, { [campo]: valor }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loteMatrizes", loteId] });
    },
    onError: () => toast.error("Não foi possível salvar o peso."),
  });

  const removerMatMut = useMutation({
    mutationFn: async (id: string) => loteMatrizService.remover(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loteMatrizes"] });
      qc.invalidateQueries({ queryKey: ["loteMatrizes", loteId] });
      toast.success("Matriz removida do lote.");
    },
    onError: () => toast.error("Não foi possível remover a matriz."),
  });

  const finalizarMut = useMutation({
    mutationFn: async (dados: {
      dataEnvio: string;
      frigorifico?: string;
      valorRecebido?: number;
      arrobasPorMatrizInformada?: number;
    }) => loteFrigorificoService.finalizar(loteId, dados),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lote", loteId] });
      qc.invalidateQueries({ queryKey: ["lotes"] });
      qc.invalidateQueries({ queryKey: ["matrizes"] });
      qc.invalidateQueries({ queryKey: ["descartes"] });
      toast.success("Lote finalizado e matrizes marcadas como descartadas.");
      setFinalizarOpen(false);
    },
    onError: () => toast.error("Não foi possível finalizar o lote."),
  });

  const removerLoteMut = useMutation({
    mutationFn: async () => loteFrigorificoService.remover(loteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lotes"] });
      qc.invalidateQueries({ queryKey: ["descartes"] });
      qc.invalidateQueries({ queryKey: ["matrizes"] });
      toast.success("Lote excluído.");
      navigate({ to: "/descartes" });
    },
    onError: () => toast.error("Não foi possível excluir o lote."),
  });

  if (loteQ.isLoading) {
    return (
      <div className="py-16 text-center text-muted-foreground">Carregando lote...</div>
    );
  }

  if (!lote) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Lote não encontrado</h1>
        <Button asChild>
          <Link to="/descartes">Voltar para Descartes</Link>
        </Button>
      </div>
    );
  }

  const finalizado = lote.status === "finalizado";

  const matrizesEmAlgumLote = new Set(todosLoteMat.map((lm) => lm.matrizId));
  const matrizesComDescarte = new Set(descartes.map((d) => d.matrizId));
  const disponiveis = matrizes.filter(
    (m) =>
      m.status === "ativa" &&
      !matrizesEmAlgumLote.has(m.id) &&
      !matrizesComDescarte.has(m.id),
  );

  const indInicial = indicadoresIniciais(membros);
  const indFinal = indicadoresFinais(membros);
  // Base de cálculo: peso final quando existir, senão peso inicial.
  const usaFinal = indFinal.quantidade > 0;
  const ind = usaFinal ? indFinal : indInicial;

  const comparativo = calcularComparativo(
    indFinal.arrobasPorMatriz,
    lote.arrobasPorMatrizInformada ?? 0,
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 w-fit text-muted-foreground"
          >
            <Link to="/descartes">
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para Descartes
            </Link>
          </Button>
          <h1 className="truncate font-display text-2xl font-bold tracking-tight">
            {lote.nome}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="outline" className={STATUS_LOTE_BADGE[lote.status]}>
            {STATUS_LOTE_LABEL[lote.status]}
          </Badge>
          {!finalizado && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDeleteLote(true)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Excluir lote</span>
            </Button>
          )}
        </div>
      </div>

      {/* 1. Dados do lote */}
      <Card className="space-y-5 p-5 shadow-[var(--shadow-card)]">
        {finalizado ? (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm md:grid-cols-4">
            <Info label="Nome do lote" value={lote.nome} />
            <Info
              label="Início do confinamento"
              value={formatDate(lote.dataInicioConfinamento)}
            />
            <Info label="Data de envio" value={formatDate(lote.dataEnvio)} />
            <Info label="Frigorífico" value={lote.frigorifico ?? "—"} />
            <Info label="Valor recebido" value={formatReais(lote.valorRecebido)} />
            <div className="col-span-2 md:col-span-4">
              <dt className="text-xs text-muted-foreground">Observações</dt>
              <dd className="font-medium">{lote.observacoes || "—"}</dd>
            </div>
          </dl>
        ) : (
          <div className="grid gap-4 md:grid-cols-[1fr_200px]">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do lote</Label>
              <CampoTexto
                id="nome"
                value={lote.nome}
                onSave={(v) => v.trim() && salvarDadosMut.mutate({ nome: v.trim() })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Início do confinamento</Label>
              <Input
                id="dataInicio"
                type="date"
                value={toDateInput(lote.dataInicioConfinamento)}
                max={toDateInput(new Date().toISOString())}
                onChange={(e) =>
                  e.target.value &&
                  salvarDadosMut.mutate({
                    dataInicioConfinamento: fromDateInput(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="obs">Observações</Label>
              <CampoTextarea
                id="obs"
                value={lote.observacoes ?? ""}
                onSave={(v) => salvarDadosMut.mutate({ observacoes: v.trim() || undefined })}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 md:grid-cols-4">
          <Metric label="Matrizes no lote" value={String(membros.length)} />
          <Metric
            label="Peso vivo total"
            value={ind.quantidade ? formatKg(ind.pesoVivoTotal) : "—"}
          />
          <Metric
            label="Peso vivo médio"
            value={ind.quantidade ? formatKg(ind.pesoVivoMedio) : "—"}
          />
          <Metric
            label="Média estimada @/matriz"
            value={ind.quantidade ? formatArrobasPorMatriz(ind.arrobasPorMatriz) : "—"}
          />
          {finalizado && (
            <>
              <Metric
                label="@/matriz informada"
                value={formatArrobasPorMatriz(lote.arrobasPorMatrizInformada)}
              />
              <Metric
                label="Diferença em arrobas"
                value={comparativo ? formatArrobas(comparativo.diferencaArrobas) : "—"}
              />
              <Metric
                label="Diferença percentual"
                value={comparativo ? formatPercent(comparativo.diferencaPercentual) : "—"}
              />
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {NOTA_ESTIMATIVA}
          {ind.quantidade > 0 && ind.quantidade < membros.length
            ? ` Calculado com ${ind.quantidade} de ${membros.length} matrizes pesadas.`
            : ""}
          {usaFinal ? " Base: pesos finais." : " Base: pesos iniciais."}
        </p>
      </Card>

      {/* 2. Matrizes do lote */}
      <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-secondary/40 px-5 py-3">
          <h2 className="font-display text-base font-semibold">
            Matrizes do lote
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {membros.length}
            </span>
          </h2>
          {!finalizado && (
            <Button size="sm" className="ml-auto" onClick={() => setAddOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Adicionar matrizes
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brinco</TableHead>
                <TableHead>Proprietário</TableHead>
                <TableHead className="w-36">Peso inicial (kg)</TableHead>
                <TableHead className="w-36">Peso final (kg)</TableHead>
                <TableHead className="w-32">Ganho</TableHead>
                {!finalizado && <TableHead className="w-16 text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {membros.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={finalizado ? 5 : 6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Nenhuma matriz no lote. Clique em “Adicionar matrizes”.
                  </TableCell>
                </TableRow>
              ) : (
                membros.map((lm) => {
                  const m = matrizPorId.get(lm.matrizId);
                  const ganho =
                    typeof lm.pesoInicial === "number" &&
                    lm.pesoInicial > 0 &&
                    typeof lm.pesoFinal === "number" &&
                    lm.pesoFinal > 0
                      ? lm.pesoFinal - lm.pesoInicial
                      : undefined;
                  return (
                    <TableRow key={lm.id}>
                      <TableCell className="font-medium">
                        {m ? (
                          <Link
                            to="/matrizes/$id"
                            params={{ id: m.id }}
                            className="text-primary hover:underline"
                          >
                            {m.numeroBrinco}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {m ? PROPRIETARIO_LABEL[m.proprietario] : "—"}
                      </TableCell>
                      <TableCell>
                        <PesoInput
                          value={lm.pesoInicial}
                          disabled={finalizado}
                          onSave={(v) =>
                            atualizarPesoMut.mutate({
                              id: lm.id,
                              campo: "pesoInicial",
                              valor: v,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <PesoInput
                          value={lm.pesoFinal}
                          disabled={finalizado}
                          onSave={(v) =>
                            atualizarPesoMut.mutate({
                              id: lm.id,
                              campo: "pesoFinal",
                              valor: v,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell
                        className={
                          ganho === undefined
                            ? "text-muted-foreground"
                            : ganho >= 0
                              ? "text-success"
                              : "text-destructive"
                        }
                      >
                        {ganho === undefined
                          ? "—"
                          : `${ganho > 0 ? "+" : ""}${formatKg(ganho)}`}
                      </TableCell>
                      {!finalizado && (
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmDeleteMat(lm.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remover</span>
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* 3. Finalização */}
      {!finalizado && (
        <div className="flex justify-end">
          <Button onClick={() => setFinalizarOpen(true)} disabled={membros.length === 0}>
            <PackageCheck className="mr-1 h-4 w-4" /> Finalizar lote
          </Button>
        </div>
      )}

      <AdicionarMatrizesDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        disponiveis={disponiveis}
        salvando={adicionarMut.isPending}
        onConfirm={(ids) => {
          setAddOpen(false);
          if (ids.length) adicionarMut.mutate(ids);
        }}
      />

      <FinalizarAlert
        open={finalizarOpen}
        onOpenChange={setFinalizarOpen}
        submitting={finalizarMut.isPending}
        onConfirm={(dados) => finalizarMut.mutate(dados)}
      />

      <AlertDialog
        open={!!confirmDeleteMat}
        onOpenChange={(o) => !o && setConfirmDeleteMat(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover matriz do lote?</AlertDialogTitle>
            <AlertDialogDescription>
              A matriz voltará a ficar disponível para outras operações.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDeleteMat) removerMatMut.mutate(confirmDeleteMat);
                setConfirmDeleteMat(null);
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDeleteLote} onOpenChange={setConfirmDeleteLote}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lote?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove o lote e todas as suas matrizes vinculadas. Não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDeleteLote(false);
                removerLoteMut.mutate();
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/40 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-lg font-semibold">{value}</p>
    </div>
  );
}

function CampoTexto({
  id,
  value,
  onSave,
}: {
  id: string;
  value: string;
  onSave: (v: string) => void;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <Input
      id={id}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => local !== value && onSave(local)}
    />
  );
}

function CampoTextarea({
  id,
  value,
  onSave,
}: {
  id: string;
  value: string;
  onSave: (v: string) => void;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <Textarea
      id={id}
      rows={2}
      value={local}
      placeholder="Notas sobre o lote..."
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => local !== value && onSave(local)}
    />
  );
}

function PesoInput({
  value,
  disabled,
  onSave,
}: {
  value: number | undefined;
  disabled?: boolean;
  onSave: (v: number | undefined) => void;
}) {
  const [local, setLocal] = useState<string>(value !== undefined ? String(value) : "");
  useEffect(() => {
    setLocal(value !== undefined ? String(value) : "");
  }, [value]);
  return (
    <Input
      type="number"
      min="0"
      step="1"
      inputMode="numeric"
      value={local}
      disabled={disabled}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        const n = local === "" ? undefined : Number(local);
        if (n !== undefined && (Number.isNaN(n) || n < 0)) return;
        if (n === value) return;
        onSave(n);
      }}
      className="h-9"
      placeholder="—"
    />
  );
}

function AdicionarMatrizesDialog({
  open,
  onOpenChange,
  disponiveis,
  salvando,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  disponiveis: Array<{
    id: string;
    numeroBrinco: string;
    proprietario: keyof typeof PROPRIETARIO_LABEL;
  }>;
  salvando: boolean;
  onConfirm: (ids: string[]) => void;
}) {
  const [busca, setBusca] = useState("");
  const [sel, setSel] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setBusca("");
      setSel([]);
    }
  }, [open]);

  const filtradas = disponiveis.filter((m) =>
    m.numeroBrinco.toLowerCase().includes(busca.trim().toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar matrizes ao lote</DialogTitle>
          <DialogDescription>
            Selecione as matrizes ativas que irão para o confinamento.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por brinco..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="max-h-72 overflow-y-auto rounded-md border border-border">
          {filtradas.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma matriz elegível encontrada.
            </p>
          ) : (
            filtradas.map((m) => {
              const marcada = sel.includes(m.id);
              return (
                <label
                  key={m.id}
                  className="flex cursor-pointer items-center gap-3 border-b border-border px-3 py-2 last:border-0 hover:bg-secondary/50"
                >
                  <Checkbox
                    checked={marcada}
                    onCheckedChange={(c) =>
                      setSel((prev) =>
                        c ? [...prev, m.id] : prev.filter((x) => x !== m.id),
                      )
                    }
                  />
                  <span className="font-medium">Brinco {m.numeroBrinco}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {PROPRIETARIO_LABEL[m.proprietario]}
                  </span>
                </label>
              );
            })
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(sel)} disabled={sel.length === 0 || salvando}>
            Adicionar {sel.length > 0 ? `(${sel.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FinalizarAlert({
  open,
  onOpenChange,
  submitting,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  submitting: boolean;
  onConfirm: (dados: {
    dataEnvio: string;
    frigorifico?: string;
    valorRecebido?: number;
    arrobasPorMatrizInformada?: number;
  }) => void;
}) {
  const [dataEnvio, setDataEnvio] = useState(toDateInput(new Date().toISOString()));
  const [frigorifico, setFrigorifico] = useState("");
  const [valor, setValor] = useState("");
  const [arrobasInf, setArrobasInf] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Finalizar lote e enviar ao frigorífico</AlertDialogTitle>
          <AlertDialogDescription>
            Ao confirmar, todas as matrizes do lote serão marcadas como descartadas e o
            lote não poderá mais ser editado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dataEnvio">
              Data de envio <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dataEnvio"
              type="date"
              value={dataEnvio}
              max={toDateInput(new Date().toISOString())}
              onChange={(e) => setDataEnvio(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frig">Frigorífico</Label>
            <Input
              id="frig"
              value={frigorifico}
              onChange={(e) => setFrigorifico(e.target.value)}
              placeholder="Nome do frigorífico"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valor">Valor recebido (R$)</Label>
            <Input
              id="valor"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="arrobasInf">@/matriz informada pelo frigorífico</Label>
            <Input
              id="arrobasInf"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={arrobasInf}
              onChange={(e) => setArrobasInf(e.target.value)}
              placeholder="Ex.: 13,10"
            />
          </div>
          {erro && <p className="text-xs text-destructive sm:col-span-2">{erro}</p>}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
          <Button
            onClick={() => {
              if (!dataEnvio) {
                setErro("Informe a data de envio.");
                return;
              }
              let arrobasNum: number | undefined;
              if (arrobasInf.trim() !== "") {
                const n = Number(arrobasInf.replace(",", "."));
                if (!Number.isFinite(n) || n <= 0) {
                  setErro("A média de arrobas informada deve ser maior que zero.");
                  return;
                }
                arrobasNum = n;
              }
              setErro(null);
              onConfirm({
                dataEnvio: fromDateInput(dataEnvio),
                frigorifico: frigorifico.trim() || undefined,
                valorRecebido: valor ? Number(valor) : undefined,
                arrobasPorMatrizInformada: arrobasNum,
              });
            }}
            disabled={submitting}
          >
            {submitting ? "Finalizando..." : "Confirmar e finalizar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

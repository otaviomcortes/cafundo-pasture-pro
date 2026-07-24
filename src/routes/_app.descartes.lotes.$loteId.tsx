import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  ChevronsUpDown,
  Plus,
  Trash2,
  PackageCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { cn } from "@/lib/utils";
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

  const adicionarMut = useMutation({
    mutationFn: async (matrizId: string) =>
      loteMatrizService.adicionar({ loteId, matrizId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loteMatrizes"] });
      qc.invalidateQueries({ queryKey: ["loteMatrizes", loteId] });
      toast.success("Matriz adicionada ao lote.");
    },
    onError: () => toast.error("Não foi possível adicionar a matriz."),
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
      pesoTotalInformado?: number;
      valorRecebido?: number;
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

  const totalPesoInicial = membros.reduce(
    (s, m) => s + (m.pesoInicial ?? 0),
    0,
  );
  const totalPesoFinal = membros.reduce((s, m) => s + (m.pesoFinal ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Button asChild variant="ghost" size="sm" className="w-fit -ml-2 text-muted-foreground">
            <Link to="/descartes">
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para Descartes
            </Link>
          </Button>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {lote.nome}
          </h1>
          <p className="text-sm text-muted-foreground">
            Início do confinamento em {formatDate(lote.dataInicioConfinamento)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={STATUS_LOTE_BADGE[lote.status]}>
            {STATUS_LOTE_LABEL[lote.status]}
          </Badge>
          {!finalizado && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDeleteLote(true)}
            >
              <Trash2 className="mr-1 h-4 w-4" /> Excluir Lote
            </Button>
          )}
        </div>
      </div>

      {/* Dados do lote */}
      <Card className="p-6 shadow-[var(--shadow-card)]">
        <h2 className="font-display text-lg font-semibold">Dados do lote</h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 text-sm md:grid-cols-3">
          <Info label="Matrizes no lote" value={membros.length} />
          <Info label="Peso inicial total (kg)" value={totalPesoInicial ? totalPesoInicial.toLocaleString("pt-BR") : "—"} />
          <Info label="Peso final total (kg)" value={totalPesoFinal ? totalPesoFinal.toLocaleString("pt-BR") : "—"} />
          <Info label="Data de envio" value={formatDate(lote.dataEnvio)} />
          <Info label="Frigorífico" value={lote.frigorifico ?? "—"} />
          <Info
            label="Peso informado pelo frigorífico (kg)"
            value={lote.pesoTotalInformado ? lote.pesoTotalInformado.toLocaleString("pt-BR") : "—"}
          />
          <Info label="Valor recebido" value={formatReais(lote.valorRecebido)} />
          <div className="col-span-2 md:col-span-3">
            <dt className="text-xs text-muted-foreground">Observações</dt>
            <dd className="font-medium">{lote.observacoes ?? "—"}</dd>
          </div>
        </dl>
      </Card>

      {/* Matrizes */}
      <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-secondary/40 px-5 py-4">
          <h2 className="font-display text-lg font-semibold">
            Matrizes do lote
          </h2>
          <div className="ml-auto flex items-center gap-2">
            {!finalizado && (
              <>
                <AddMatrizPopover
                  open={addOpen}
                  onOpenChange={setAddOpen}
                  disponiveis={disponiveis}
                  onSelect={(id) => {
                    setAddOpen(false);
                    adicionarMut.mutate(id);
                  }}
                />
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setFinalizarOpen(true)}
                  disabled={membros.length === 0}
                >
                  <PackageCheck className="mr-1 h-4 w-4" /> Finalizar Lote
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brinco</TableHead>
                <TableHead>Proprietário</TableHead>
                <TableHead className="w-40">Peso inicial (kg)</TableHead>
                <TableHead className="w-40">Peso final (kg)</TableHead>
                {!finalizado && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {membros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={finalizado ? 4 : 5} className="py-10 text-center text-muted-foreground">
                    Nenhuma matriz adicionada ao lote ainda.
                  </TableCell>
                </TableRow>
              ) : (
                membros.map((lm) => {
                  const m = matrizPorId.get(lm.matrizId);
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
                            atualizarPesoMut.mutate({ id: lm.id, campo: "pesoInicial", valor: v })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <PesoInput
                          value={lm.pesoFinal}
                          disabled={finalizado}
                          onSave={(v) =>
                            atualizarPesoMut.mutate({ id: lm.id, campo: "pesoFinal", valor: v })
                          }
                        />
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

      {/* Finalizar */}
      <FinalizarDialog
        open={finalizarOpen}
        onOpenChange={setFinalizarOpen}
        submitting={finalizarMut.isPending}
        onConfirm={(dados) => finalizarMut.mutate(dados)}
      />

      {/* Remover matriz */}
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

      {/* Excluir lote */}
      <AlertDialog
        open={confirmDeleteLote}
        onOpenChange={setConfirmDeleteLote}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lote?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove o lote e todas as suas matrizes vinculadas. Não pode ser desfeita.
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
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
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

function AddMatrizPopover({
  open,
  onOpenChange,
  disponiveis,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  disponiveis: Array<{ id: string; numeroBrinco: string; proprietario: string }>;
  onSelect: (id: string) => void;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" role="combobox" aria-expanded={open}>
          <Plus className="mr-1 h-4 w-4" /> Adicionar matriz
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
        <Command
          filter={(value, search) =>
            value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder="Digite o brinco..." />
          <CommandList>
            <CommandEmpty>Nenhuma matriz elegível.</CommandEmpty>
            <CommandGroup>
              {disponiveis.map((m) => (
                <CommandItem
                  key={m.id}
                  value={m.numeroBrinco}
                  onSelect={() => onSelect(m.id)}
                >
                  <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                  <span className="font-medium">Brinco {m.numeroBrinco}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {m.proprietario}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function FinalizarDialog({
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
    pesoTotalInformado?: number;
    valorRecebido?: number;
  }) => void;
}) {
  const [dataEnvio, setDataEnvio] = useState(
    toDateInput(new Date().toISOString()),
  );
  const [frigorifico, setFrigorifico] = useState("");
  const [peso, setPeso] = useState("");
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar lote e enviar ao frigorífico</DialogTitle>
          <DialogDescription>
            Ao finalizar, todas as matrizes do lote serão marcadas como descartadas e removidas das operações.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pesoInf">Peso informado (kg)</Label>
              <Input
                id="pesoInf"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
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
          </div>
          {erro && <p className="text-xs text-destructive">{erro}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (!dataEnvio) {
                setErro("Informe a data de envio.");
                return;
              }
              setErro(null);
              onConfirm({
                dataEnvio: fromDateInput(dataEnvio),
                frigorifico: frigorifico.trim() || undefined,
                pesoTotalInformado: peso ? Number(peso) : undefined,
                valorRecebido: valor ? Number(valor) : undefined,
              });
            }}
            disabled={submitting}
          >
            {submitting ? "Finalizando..." : "Finalizar lote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

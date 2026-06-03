import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Beef,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  protocoloIatfService,
  protocoloMatrizService,
  matrizService,
  prenhezService,
  type DiagnosticoPrenhez,
  type Matriz,
} from "@/domain";
import {
  STATUS_PROTOCOLO_LABEL,
  STATUS_PROTOCOLO_BADGE,
  DIAGNOSTICO_LABEL,
  DIAGNOSTICO_BADGE,
  formatDate,
} from "@/lib/protocoloIatfUi";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/protocolos-iatf/$id")({
  head: () => ({ meta: [{ title: "Protocolo IATF — Cafundó" }] }),
  component: ProtocoloDetalhePage,
});

function ProtocoloDetalhePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const protocoloQ = useQuery({
    queryKey: ["protocolosIatf", id],
    queryFn: () => protocoloIatfService.buscarPorId(id),
  });
  const participacoesQ = useQuery({
    queryKey: ["protocolosMatriz", "protocolo", id],
    queryFn: () => protocoloMatrizService.listarPorProtocolo(id),
  });
  const matrizesQ = useQuery({
    queryKey: ["matrizes"],
    queryFn: () => matrizService.listar(),
  });
  const todasParticipacoesQ = useQuery({
    queryKey: ["protocolosMatriz"],
    queryFn: () => protocoloMatrizService.listar(),
  });
  const protocolosQ = useQuery({
    queryKey: ["protocolosIatf"],
    queryFn: () => protocoloIatfService.listar(),
  });

  const protocolo = protocoloQ.data;
  const participacoes = participacoesQ.data ?? [];
  const matrizes = matrizesQ.data ?? [];
  const todasParticipacoes = todasParticipacoesQ.data ?? [];
  const protocolos = protocolosQ.data ?? [];

  const matrizPorId = useMemo(() => {
    const m = new Map<string, Matriz>();
    matrizes.forEach((x) => m.set(x.id, x));
    return m;
  }, [matrizes]);

  const protocolosAtivosIds = useMemo(
    () =>
      new Set(
        protocolos
          .filter((p) => p.status !== "finalizado")
          .map((p) => p.id),
      ),
    [protocolos],
  );

  const matrizesEmOutroProtocoloAtivo = useMemo(() => {
    const set = new Set<string>();
    for (const pm of todasParticipacoes) {
      if (pm.protocoloId === id) continue;
      if (!protocolosAtivosIds.has(pm.protocoloId)) continue;
      set.add(pm.matrizId);
    }
    return set;
  }, [todasParticipacoes, protocolosAtivosIds, id]);

  const matrizesNoProtocolo = useMemo(
    () => new Set(participacoes.map((p) => p.matrizId)),
    [participacoes],
  );

  // ----- Busca e cadastro -----
  const [buscaCadastro, setBuscaCadastro] = useState("");
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());

  const elegiveis = useMemo(() => {
    const termo = buscaCadastro.trim().toLowerCase();
    return matrizes
      .filter((m) => m.status === "ativa")
      .filter((m) => m.situacaoReprodutiva !== "prenha")
      .filter((m) => !matrizesNoProtocolo.has(m.id))
      .filter((m) => !matrizesEmOutroProtocoloAtivo.has(m.id))
      .filter((m) => (termo ? m.numeroBrinco.toLowerCase().includes(termo) : true))
      .sort((a, b) => a.numeroBrinco.localeCompare(b.numeroBrinco));
  }, [matrizes, matrizesNoProtocolo, matrizesEmOutroProtocoloAtivo, buscaCadastro]);

  async function adicionarSelecionadas() {
    if (selecionadas.size === 0) return;
    try {
      for (const matrizId of selecionadas) {
        await protocoloMatrizService.criar({
          protocoloId: id,
          matrizId,
          etapa1Concluida: false,
          etapa2Concluida: false,
          etapa3Concluida: false,
          diagnosticoPrenhez: "nao_avaliada",
        });
        await matrizService.atualizar(matrizId, {
          situacaoReprodutiva: "em_protocolo",
        });
      }
      toast.success(`${selecionadas.size} matriz(es) adicionada(s) ao protocolo.`);
      setSelecionadas(new Set());
      qc.invalidateQueries({ queryKey: ["protocolosMatriz"] });
      qc.invalidateQueries({ queryKey: ["matrizes"] });
    } catch {
      toast.error("Erro ao adicionar matrizes.");
    }
  }

  // ----- Checklist -----
  const [buscaChecklist, setBuscaChecklist] = useState("");
  const checklistFiltrado = useMemo(() => {
    const termo = buscaChecklist.trim().toLowerCase();
    return participacoes
      .map((pm) => ({ pm, matriz: matrizPorId.get(pm.matrizId) }))
      .filter((row) => {
        if (!termo) return true;
        return row.matriz?.numeroBrinco.toLowerCase().includes(termo);
      })
      .sort((a, b) =>
        (a.matriz?.numeroBrinco ?? "").localeCompare(b.matriz?.numeroBrinco ?? ""),
      );
  }, [participacoes, matrizPorId, buscaChecklist]);

  const brincoBuscadoExiste =
    !buscaChecklist.trim() ||
    participacoes.some((pm) =>
      matrizPorId
        .get(pm.matrizId)
        ?.numeroBrinco.toLowerCase()
        .includes(buscaChecklist.trim().toLowerCase()),
    );

  async function toggleEtapa(pmId: string, etapa: 1 | 2 | 3, value: boolean) {
    const patch: Record<string, unknown> = {};
    if (etapa === 1) {
      patch.etapa1Concluida = value;
      patch.etapa1Data = value ? new Date().toISOString() : undefined;
    } else if (etapa === 2) {
      patch.etapa2Concluida = value;
      patch.etapa2Data = value ? new Date().toISOString() : undefined;
    } else {
      patch.etapa3Concluida = value;
      patch.etapa3Data = value ? new Date().toISOString() : undefined;
    }
    await protocoloMatrizService.atualizar(pmId, patch);
    qc.invalidateQueries({ queryKey: ["protocolosMatriz"] });
  }

  async function alterarDiagnostico(
    pmId: string,
    matrizId: string,
    valor: DiagnosticoPrenhez,
  ) {
    await protocoloMatrizService.atualizar(pmId, {
      diagnosticoPrenhez: valor,
      dataDiagnostico: valor === "nao_avaliada" ? undefined : new Date().toISOString(),
    });
    if (valor === "prenha") {
      await prenhezService.criar({
        matrizId,
        origem: "iatf",
        dataConfirmacao: new Date().toISOString(),
        status: "ativa",
      });
      await matrizService.atualizar(matrizId, { situacaoReprodutiva: "prenha" });
      toast.success("Prenhez registrada para a matriz.");
    } else if (valor === "vazia") {
      await matrizService.atualizar(matrizId, { situacaoReprodutiva: "vazia" });
      toast.success("Matriz marcada como vazia.");
    } else {
      toast.success("Diagnóstico atualizado.");
    }
    qc.invalidateQueries({ queryKey: ["protocolosMatriz"] });
    qc.invalidateQueries({ queryKey: ["matrizes"] });
    qc.invalidateQueries({ queryKey: ["prenhezes"] });
  }

  async function removerMatriz(pmId: string, matrizId: string) {
    if (!confirm("Remover esta matriz do protocolo?")) return;
    await protocoloMatrizService.remover(pmId);
    const matriz = matrizPorId.get(matrizId);
    if (matriz && matriz.situacaoReprodutiva === "em_protocolo") {
      await matrizService.atualizar(matrizId, { situacaoReprodutiva: "vazia" });
    }
    qc.invalidateQueries({ queryKey: ["protocolosMatriz"] });
    qc.invalidateQueries({ queryKey: ["matrizes"] });
    toast.success("Matriz removida do protocolo.");
  }

  // ----- Contadores -----
  const total = participacoes.length;
  const e1Done = participacoes.filter((p) => p.etapa1Concluida).length;
  const e2Done = participacoes.filter((p) => p.etapa2Concluida).length;
  const e3Done = participacoes.filter((p) => p.etapa3Concluida).length;
  const todasConcluidas = participacoes.filter(
    (p) => p.etapa1Concluida && p.etapa2Concluida && p.etapa3Concluida,
  ).length;
  const pendentes = total - todasConcluidas;

  if (protocoloQ.isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Carregando protocolo...</div>;
  }
  if (!protocolo) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate({ to: "/protocolos-iatf" })}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para Protocolos IATF
        </Button>
        <Card className="p-10 text-center text-muted-foreground">
          Protocolo não encontrado.
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Button asChild variant="ghost" size="sm" className="w-fit -ml-2 text-muted-foreground">
            <Link to="/protocolos-iatf">
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para Protocolos IATF
            </Link>
          </Button>
          <h1 className="font-display text-3xl font-bold tracking-tight">{protocolo.nome}</h1>
          <p className="text-sm text-muted-foreground">
            Etapas: {formatDate(protocolo.dataEtapa1)} · {formatDate(protocolo.dataEtapa2)} ·{" "}
            {formatDate(protocolo.dataEtapa3)} · Diagnóstico previsto:{" "}
            {formatDate(protocolo.dataPrevistaDiagnostico)}
          </p>
        </div>
        <Badge variant="outline" className={STATUS_PROTOCOLO_BADGE[protocolo.status]}>
          {STATUS_PROTOCOLO_LABEL[protocolo.status]}
        </Badge>
      </div>

      {/* Contadores */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Beef className="h-4 w-4" />
          </div>
          <p className="mt-3 text-xs font-medium text-muted-foreground">Total de matrizes</p>
          <p className="font-display text-2xl font-bold tracking-tight">{total}</p>
        </Card>
        {[
          { label: "Etapa 1", done: e1Done },
          { label: "Etapa 2", done: e2Done },
          { label: "Etapa 3", done: e3Done },
        ].map((e) => (
          <Card key={e.label} className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{e.label}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="font-display text-2xl font-bold tracking-tight text-success">{e.done}</p>
              <span className="text-xs text-muted-foreground">concluídas</span>
            </div>
            <p className="mt-1 text-xs text-warning-foreground">
              {total - e.done} pendentes
            </p>
          </Card>
        ))}
        <Card className="p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/15 text-success">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="mt-3 text-xs font-medium text-muted-foreground">Todas etapas OK</p>
          <p className="font-display text-2xl font-bold tracking-tight">{todasConcluidas}</p>
          <p className="text-xs text-warning-foreground">{pendentes} pendentes</p>
        </Card>
      </div>

      {/* Cadastro de matrizes */}
      <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
        <div className="border-b border-border bg-secondary/40 px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Matrizes do Protocolo</h2>
          <p className="text-xs text-muted-foreground">
            Busque por brinco e selecione matrizes elegíveis para adicionar ao protocolo.
          </p>
        </div>
        <div className="space-y-4 p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar matrizes elegíveis por brinco..."
              value={buscaCadastro}
              onChange={(e) => setBuscaCadastro(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-64 overflow-y-auto rounded-md border border-border">
            {elegiveis.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Nenhuma matriz elegível encontrada.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {elegiveis.slice(0, 50).map((m) => {
                  const checked = selecionadas.has(m.id);
                  return (
                    <li key={m.id} className="flex items-center gap-3 px-4 py-2">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          setSelecionadas((prev) => {
                            const next = new Set(prev);
                            if (v) next.add(m.id);
                            else next.delete(m.id);
                            return next;
                          });
                        }}
                        id={`sel-${m.id}`}
                      />
                      <label htmlFor={`sel-${m.id}`} className="flex-1 cursor-pointer text-sm">
                        <span className="font-medium">Brinco {m.numeroBrinco}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {m.raca} · {m.situacaoReprodutiva}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {selecionadas.size} selecionada(s)
            </span>
            <Button onClick={adicionarSelecionadas} disabled={selecionadas.size === 0}>
              <Plus className="mr-1 h-4 w-4" /> Adicionar ao Protocolo
            </Button>
          </div>
        </div>
      </Card>

      {/* Checklist operacional */}
      <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
        <div className="border-b border-border bg-secondary/40 px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Checklist Operacional</h2>
          <p className="text-xs text-muted-foreground">
            Pesquise pelo brinco e marque rapidamente a etapa concluída.
          </p>
        </div>
        <div className="space-y-3 p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar matriz no protocolo (brinco)..."
              value={buscaChecklist}
              onChange={(e) => setBuscaChecklist(e.target.value)}
              className="pl-9"
            />
          </div>
          {buscaChecklist.trim() && !brincoBuscadoExiste && (
            <div className="flex items-center gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
              <AlertCircle className="h-4 w-4" /> Matriz não cadastrada neste protocolo.
            </div>
          )}
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brinco</TableHead>
                  <TableHead className="text-center">Etapa 1</TableHead>
                  <TableHead className="text-center">Etapa 2</TableHead>
                  <TableHead className="text-center">Etapa 3</TableHead>
                  <TableHead>Diagnóstico</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checklistFiltrado.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      Nenhuma matriz cadastrada no protocolo ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  checklistFiltrado.map(({ pm, matriz }) => {
                    const completa =
                      pm.etapa1Concluida && pm.etapa2Concluida && pm.etapa3Concluida;
                    const destacar =
                      buscaChecklist.trim() &&
                      matriz?.numeroBrinco
                        .toLowerCase()
                        .includes(buscaChecklist.trim().toLowerCase());
                    return (
                      <TableRow
                        key={pm.id}
                        className={cn(
                          destacar && "bg-primary/5",
                          !completa && "border-l-2 border-l-warning/60",
                        )}
                      >
                        <TableCell className="font-medium">
                          {matriz ? (
                            <Link
                              to="/matrizes/$id"
                              params={{ id: matriz.id }}
                              className="hover:underline"
                            >
                              {matriz.numeroBrinco}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={pm.etapa1Concluida}
                            onCheckedChange={(v) => toggleEtapa(pm.id, 1, Boolean(v))}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={pm.etapa2Concluida}
                            onCheckedChange={(v) => toggleEtapa(pm.id, 2, Boolean(v))}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={pm.etapa3Concluida}
                            onCheckedChange={(v) => toggleEtapa(pm.id, 3, Boolean(v))}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={pm.diagnosticoPrenhez}
                            onValueChange={(v) =>
                              alterarDiagnostico(pm.id, pm.matrizId, v as DiagnosticoPrenhez)
                            }
                          >
                            <SelectTrigger className="h-8 w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nao_avaliada">Não avaliada</SelectItem>
                              <SelectItem value="prenha">Prenha</SelectItem>
                              <SelectItem value="vazia">Vazia</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {completa ? (
                            <Badge variant="outline" className={DIAGNOSTICO_BADGE[pm.diagnosticoPrenhez]}>
                              {DIAGNOSTICO_LABEL[pm.diagnosticoPrenhez]}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-warning/25 text-warning-foreground border-warning/50">
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removerMatriz(pm.id, pm.matrizId)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remover</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}

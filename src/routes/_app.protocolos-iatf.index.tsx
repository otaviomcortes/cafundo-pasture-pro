import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
  type StatusProtocoloIatf,
} from "@/domain";
import {
  STATUS_PROTOCOLO_LABEL,
  STATUS_PROTOCOLO_BADGE,
  formatDate,
} from "@/lib/protocoloIatfUi";

export const Route = createFileRoute("/_app/protocolos-iatf/")({
  head: () => ({ meta: [{ title: "Protocolos IATF — Cafundó" }] }),
  component: ProtocolosIatfPage,
});

type StatusFiltro = StatusProtocoloIatf | "todos";

function ProtocolosIatfPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: protocolos = [], isLoading } = useQuery({
    queryKey: ["protocolosIatf"],
    queryFn: () => protocoloIatfService.listar(),
  });
  const { data: participacoes = [] } = useQuery({
    queryKey: ["protocolosMatriz"],
    queryFn: () => protocoloMatrizService.listar(),
  });

  const matrizesPorProtocolo = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of participacoes) m.set(p.protocoloId, (m.get(p.protocoloId) ?? 0) + 1);
    return m;
  }, [participacoes]);

  const prenhasPorProtocolo = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of participacoes) {
      if (p.diagnosticoPrenhez === "prenha") {
        m.set(p.protocoloId, (m.get(p.protocoloId) ?? 0) + 1);
      }
    }
    return m;
  }, [participacoes]);

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("todos");
  const [excluirId, setExcluirId] = useState<string | null>(null);

  const protocoloExcluir = protocolos.find((p) => p.id === excluirId) ?? null;
  const matrizesExcluir = excluirId ? matrizesPorProtocolo.get(excluirId) ?? 0 : 0;
  const prenhasExcluir = excluirId ? prenhasPorProtocolo.get(excluirId) ?? 0 : 0;

  async function confirmarExclusao() {
    if (!excluirId) return;
    try {
      const vinculos = participacoes.filter((p) => p.protocoloId === excluirId);
      for (const pm of vinculos) {
        await protocoloMatrizService.remover(pm.id);
        if (pm.diagnosticoPrenhez !== "prenha") {
          await matrizService.atualizar(pm.matrizId, {
            situacaoReprodutiva: "vazia",
          });
        }
      }
      await protocoloIatfService.remover(excluirId);
      qc.invalidateQueries({ queryKey: ["protocolosIatf"] });
      qc.invalidateQueries({ queryKey: ["protocolosMatriz"] });
      qc.invalidateQueries({ queryKey: ["matrizes"] });
      toast.success("Protocolo IATF excluído com sucesso.");
      setExcluirId(null);
    } catch {
      toast.error("Erro ao excluir protocolo.");
    }
  }


  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return protocolos
      .filter((p) => {
        if (statusFiltro !== "todos" && p.status !== statusFiltro) return false;
        if (termo && !p.nome.toLowerCase().includes(termo)) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.dataEtapa1).getTime() - new Date(a.dataEtapa1).getTime(),
      );
  }, [protocolos, statusFiltro, busca]);


  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Reprodução</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Protocolos IATF
          </h1>
        </div>
        <Button asChild>
          <Link to="/protocolos-iatf/novo">
            <Plus className="mr-1 h-4 w-4" /> Novo Protocolo
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card
            key={c.title}
            className="p-4 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-elevated)]"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses[c.tone]}`}>
              <c.icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-xs font-medium text-muted-foreground">{c.title}</p>
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
              placeholder="Buscar por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFiltro} onValueChange={(v) => setStatusFiltro(v as StatusFiltro)}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="planejado">Planejado</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="aguardando_diagnostico">Aguardando diagnóstico</SelectItem>
              <SelectItem value="finalizado">Finalizado</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto text-xs text-muted-foreground">
            {filtrados.length} de {protocolos.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Etapa 1</TableHead>
                <TableHead>Etapa 2</TableHead>
                <TableHead>Etapa 3</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Matrizes</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Carregando protocolos...
                  </TableCell>
                </TableRow>
              ) : filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Nenhum protocolo encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nome}</TableCell>
                    <TableCell>{formatDate(p.dataEtapa1)}</TableCell>
                    <TableCell>{formatDate(p.dataEtapa2)}</TableCell>
                    <TableCell>{formatDate(p.dataEtapa3)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_PROTOCOLO_BADGE[p.status]}>
                        {STATUS_PROTOCOLO_LABEL[p.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {matrizesPorProtocolo.get(p.id) ?? 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate({ to: "/protocolos-iatf/$id", params: { id: p.id } })}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Visualizar</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate({ to: "/protocolos-iatf/$id", params: { id: p.id }, hash: "editar" })}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setExcluirId(p.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog
        open={excluirId !== null}
        onOpenChange={(open) => !open && setExcluirId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja excluir este protocolo IATF?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Protocolo:</span>{" "}
                  <span className="font-medium text-foreground">
                    {protocoloExcluir?.nome ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Matrizes participantes:
                  </span>{" "}
                  <span className="font-medium text-foreground">
                    {matrizesExcluir}
                  </span>
                </div>
                {prenhasExcluir > 0 && (
                  <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-warning-foreground">
                    Este protocolo possui diagnóstico de prenhez registrado. A
                    exclusão removerá o protocolo, mas não apagará prenhezes já
                    criadas.
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

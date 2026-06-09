import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  protocoloIatfService,
  type StatusProtocoloIatf,
} from "@/domain";

export const Route = createFileRoute("/_app/protocolos-iatf/novo")({
  head: () => ({ meta: [{ title: "Novo Protocolo IATF — Cafundó" }] }),
  component: NovoProtocoloPage,
});

function toIso(date: string): string {
  return date ? new Date(date + "T00:00:00.000Z").toISOString() : "";
}

function NovoProtocoloPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [nome, setNome] = useState("");
  const [d1, setD1] = useState("");
  const [d2, setD2] = useState("");
  const [d3, setD3] = useState("");
  const [comRepasse, setComRepasse] = useState(false);
  const [inicioRepasse, setInicioRepasse] = useState("");
  const [fimRepasse, setFimRepasse] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      protocoloIatfService.criar({
        nome: nome.trim(),
        
        dataEtapa1: toIso(d1),
        dataEtapa2: toIso(d2),
        dataEtapa3: toIso(d3),
        possuiRepasseTouro: comRepasse,
        dataInicioRepasse: comRepasse ? toIso(inicioRepasse) : undefined,
        dataFimRepasse: comRepasse ? toIso(fimRepasse) : undefined,
        dataPrevistaDiagnostico: diagnostico ? toIso(diagnostico) : toIso(d3),
        status: "planejado" as StatusProtocoloIatf,
        observacoes: observacoes.trim() || undefined,
      }),
    onSuccess: (novo) => {
      qc.invalidateQueries({ queryKey: ["protocolosIatf"] });
      toast.success("Protocolo criado com sucesso!");
      navigate({ to: "/protocolos-iatf/$id", params: { id: novo.id } });
    },
    onError: () => toast.error("Erro ao criar protocolo."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!nome.trim()) return setErro("Nome do protocolo é obrigatório.");
    if (!d1) return setErro("Data da etapa 1 é obrigatória.");
    if (!d2) return setErro("Data da etapa 2 é obrigatória.");
    if (!d3) return setErro("Data da etapa 3 é obrigatória.");
    if (new Date(d2) < new Date(d1))
      return setErro("Etapa 2 não pode ser anterior à etapa 1.");
    if (new Date(d3) < new Date(d2))
      return setErro("Etapa 3 não pode ser anterior à etapa 2.");
    if (comRepasse && (!inicioRepasse || !fimRepasse))
      return setErro(
        "Datas de início e fim do repasse são obrigatórias quando há repasse com touro.",
      );
    if (comRepasse && new Date(fimRepasse) < new Date(inicioRepasse))
      return setErro("Fim do repasse não pode ser anterior ao início.");
    mutation.mutate();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link to="/protocolos-iatf">
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para Protocolos IATF
          </Link>
        </Button>
        <h1 className="font-display text-3xl font-bold tracking-tight">Novo Protocolo IATF</h1>
        <p className="text-sm text-muted-foreground">
          Defina as etapas do protocolo. Após salvar, adicione as matrizes participantes.
        </p>
      </div>

      <Card className="p-6 shadow-[var(--shadow-card)]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do protocolo *</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: IATF Lote Sede" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="d1">Etapa 1 (D0) *</Label>
              <Input id="d1" type="date" value={d1} onChange={(e) => setD1(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d2">Etapa 2 (D8) *</Label>
              <Input id="d2" type="date" value={d2} onChange={(e) => setD2(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d3">Etapa 3 (IA) *</Label>
              <Input id="d3" type="date" value={d3} onChange={(e) => setD3(e.target.value)} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="repasse" className="text-sm font-medium">
                  Possui repasse com touro
                </Label>
                <p className="text-xs text-muted-foreground">
                  Habilita as datas de início e fim do repasse.
                </p>
              </div>
              <Switch id="repasse" checked={comRepasse} onCheckedChange={setComRepasse} />
            </div>
            {comRepasse && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ri">Início do repasse *</Label>
                  <Input id="ri" type="date" value={inicioRepasse} onChange={(e) => setInicioRepasse(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rf">Fim do repasse *</Label>
                  <Input id="rf" type="date" value={fimRepasse} onChange={(e) => setFimRepasse(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="diag">Data prevista do diagnóstico</Label>
            <Input id="diag" type="date" value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="obs">Observações</Label>
            <Textarea id="obs" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} />
          </div>

          {erro && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {erro}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link to="/protocolos-iatf">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Salvar protocolo"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

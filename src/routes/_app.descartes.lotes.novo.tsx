import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { loteFrigorificoService } from "@/domain";
import { fromDateInput, toDateInput } from "@/lib/loteFrigorificoUi";

export const Route = createFileRoute("/_app/descartes/lotes/novo")({
  head: () => ({ meta: [{ title: "Novo Lote para Frigorífico — Cafundó" }] }),
  component: NovoLotePage,
});

function NovoLotePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [nome, setNome] = useState("");
  const [dataInicio, setDataInicio] = useState(
    toDateInput(new Date().toISOString()),
  );
  const [observacoes, setObservacoes] = useState("");
  const [erros, setErros] = useState<{ nome?: string; dataInicio?: string }>({});

  const mutation = useMutation({
    mutationFn: async () => {
      const novo = await loteFrigorificoService.criar({
        nome: nome.trim(),
        dataInicioConfinamento: fromDateInput(dataInicio),
        observacoes: observacoes.trim() || undefined,
      });
      return novo;
    },
    onSuccess: (novo) => {
      queryClient.invalidateQueries({ queryKey: ["lotes"] });
      toast.success("Lote criado com sucesso.");
      navigate({ to: "/descartes/lotes/$loteId", params: { loteId: novo.id } });
    },
    onError: () => toast.error("Não foi possível criar o lote."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const novos: typeof erros = {};
    if (!nome.trim()) novos.nome = "Informe um nome para o lote.";
    if (!dataInicio) novos.dataInicio = "Informe a data de início do confinamento.";
    if (Object.keys(novos).length > 0) {
      setErros(novos);
      return;
    }
    mutation.mutate();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link to="/descartes">
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para Descartes
          </Link>
        </Button>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Novo Lote para Frigorífico
        </h1>
        <p className="text-sm text-muted-foreground">
          Após criar o lote, adicione as matrizes destinadas ao frigorífico e informe seus pesos.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="space-y-5 p-6 shadow-[var(--shadow-card)]">
          <div className="space-y-2">
            <Label htmlFor="nome">
              Nome do lote <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setErros((p) => ({ ...p, nome: undefined }));
              }}
              placeholder="Ex.: Lote outubro/2026"
            />
            {erros.nome && <p className="text-xs text-destructive">{erros.nome}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataInicio">
              Início do confinamento <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => {
                setDataInicio(e.target.value);
                setErros((p) => ({ ...p, dataInicio: undefined }));
              }}
              max={toDateInput(new Date().toISOString())}
            />
            {erros.dataInicio && (
              <p className="text-xs text-destructive">{erros.dataInicio}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              rows={4}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Notas sobre o lote..."
            />
          </div>
        </Card>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/descartes" })}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Salvando..." : "Criar lote"}
          </Button>
        </div>
      </form>
    </div>
  );
}

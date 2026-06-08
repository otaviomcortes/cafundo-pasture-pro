import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { descarteService, matrizService } from "@/domain";
import {
  DescarteForm,
  emptyDescarteForm,
  type DescarteFormValues,
} from "@/components/descartes/DescarteForm";
import { fromDateInput } from "@/lib/descarteUi";

export const Route = createFileRoute("/_app/descartes/novo")({
  head: () => ({ meta: [{ title: "Novo Descarte — Cafundó" }] }),
  component: NovoDescartePage,
});

function NovoDescartePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: DescarteFormValues) => {
      if (!values.motivo || !values.destino)
        throw new Error("Campos obrigatórios ausentes.");

      // Validações de regra
      const matriz = await matrizService.buscarPorId(values.matrizId);
      if (!matriz) throw new Error("Matriz não encontrada.");
      if (matriz.status !== "ativa")
        throw new Error("Matriz não está ativa.");
      const ja = await descarteService.listarPorMatriz(values.matrizId);
      if (ja.length > 0)
        throw new Error("Matriz já possui descarte registrado.");

      const novo = await descarteService.criar({
        matrizId: values.matrizId,
        dataDescarte: fromDateInput(values.dataDescarte),
        motivo: values.motivo,
        peso: Number(values.peso),
        destino: values.destino,
        observacoes: values.observacoes.trim() || undefined,
      });

      await matrizService.atualizar(matriz.id, {
        status: "descartada",
        situacaoReprodutiva: "vazia",
      });

      return novo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["descartes"] });
      queryClient.invalidateQueries({ queryKey: ["matrizes"] });
      queryClient.invalidateQueries({ queryKey: ["matriz"] });
      toast.success("Descarte registrado com sucesso.");
      navigate({ to: "/descartes" });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Não foi possível registrar o descarte.",
      );
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link to="/descartes">
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para Descartes
          </Link>
        </Button>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Novo Descarte
        </h1>
        <p className="text-sm text-muted-foreground">
          Ao salvar, a matriz será marcada como descartada e removida das
          seleções operacionais.
        </p>
      </div>

      <DescarteForm
        initial={emptyDescarteForm()}
        submitting={mutation.isPending}
        submitLabel="Registrar descarte"
        onSubmit={(v) => mutation.mutate(v)}
        onCancel={() => navigate({ to: "/descartes" })}
      />
    </div>
  );
}

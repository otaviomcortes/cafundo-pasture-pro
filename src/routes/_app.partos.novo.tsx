import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  matrizService,
  partoService,
  prenhezService,
} from "@/domain";
import {
  PartoForm,
  emptyPartoForm,
  type PartoFormValues,
} from "@/components/partos/PartoForm";
import { fromDateInput } from "@/lib/partoUi";

export const Route = createFileRoute("/_app/partos/novo")({
  head: () => ({ meta: [{ title: "Novo Parto — Cafundó" }] }),
  component: NovoPartoPage,
});

function NovoPartoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: PartoFormValues) => {
      if (!values.sexoBezerro) throw new Error("Sexo obrigatório");

      // 1. Criar o registro de parto
      const novo = await partoService.criar({
        matrizId: values.matrizId,
        dataParto: fromDateInput(values.dataParto),
        sexoBezerro: values.sexoBezerro,
        racaBezerro: values.racaBezerro,
        observacoes: values.observacoes.trim() || undefined,
      });

      // 2. Incrementar quantidadePartos e 4. tornar matriz apta
      const matriz = await matrizService.buscarPorId(values.matrizId);
      if (matriz) {
        await matrizService.atualizar(matriz.id, {
          quantidadePartos: matriz.quantidadePartos + 1,
          situacaoReprodutiva: "apta",
        });
      }

      // 3. Encerrar prenhez ativa, se existir
      const prenhezes = await prenhezService.listarPorMatriz(values.matrizId);
      const ativa = prenhezes.find((p) => p.status === "ativa");
      if (ativa) {
        await prenhezService.encerrar(ativa.id);
      }

      return novo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partos"] });
      queryClient.invalidateQueries({ queryKey: ["matrizes"] });
      queryClient.invalidateQueries({ queryKey: ["prenhezes"] });
      toast.success("Parto registrado com sucesso.");
      navigate({ to: "/partos" });
    },
    onError: () => {
      toast.error("Não foi possível registrar o parto.");
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link to="/partos">
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para Partos
          </Link>
        </Button>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Novo Parto
        </h1>
        <p className="text-sm text-muted-foreground">
          Registre o nascimento e atualize automaticamente o status reprodutivo da matriz.
        </p>
      </div>

      <PartoForm
        initial={emptyPartoForm()}
        submitting={mutation.isPending}
        submitLabel="Registrar parto"
        onSubmit={(v) => mutation.mutate(v)}
        onCancel={() => navigate({ to: "/partos" })}
      />
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { partoService } from "@/domain";
import {
  PartoForm,
  type PartoFormValues,
} from "@/components/partos/PartoForm";
import { fromDateInput, toDateInput } from "@/lib/partoUi";

export const Route = createFileRoute("/_app/partos/$id/editar")({
  head: () => ({ meta: [{ title: "Editar Parto — Cafundó" }] }),
  component: EditarPartoPage,
});

function EditarPartoPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: parto, isLoading } = useQuery({
    queryKey: ["partos", id],
    queryFn: () => partoService.buscarPorId(id),
  });

  const mutation = useMutation({
    mutationFn: async (values: PartoFormValues) => {
      if (!values.sexoBezerro) throw new Error("Sexo obrigatório");
      return partoService.atualizar(id, {
        dataParto: fromDateInput(values.dataParto),
        sexoBezerro: values.sexoBezerro,
        racaBezerro: values.racaBezerro,
        observacoes: values.observacoes.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partos"] });
      toast.success("Parto atualizado com sucesso.");
      navigate({ to: "/partos/$id", params: { id } });
    },
    onError: () => {
      toast.error("Não foi possível atualizar o parto.");
    },
  });

  if (isLoading) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Carregando parto...
      </div>
    );
  }

  if (!parto) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Parto não encontrado</h1>
        <Button asChild>
          <Link to="/partos">Voltar para Partos</Link>
        </Button>
      </div>
    );
  }

  const initial: PartoFormValues = {
    matrizId: parto.matrizId,
    dataParto: toDateInput(parto.dataParto),
    sexoBezerro: parto.sexoBezerro,
    racaBezerro: parto.racaBezerro,
    observacoes: parto.observacoes ?? "",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link to="/partos/$id" params={{ id }}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para o parto
          </Link>
        </Button>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Editar Parto
        </h1>
        <p className="text-sm text-muted-foreground">
          A matriz vinculada não pode ser alterada nesta versão.
        </p>
      </div>

      <PartoForm
        initial={initial}
        submitting={mutation.isPending}
        submitLabel="Salvar alterações"
        matrizLocked
        onSubmit={(v) => mutation.mutate(v)}
        onCancel={() => navigate({ to: "/partos/$id", params: { id } })}
      />
    </div>
  );
}

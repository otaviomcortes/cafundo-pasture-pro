import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { descarteService } from "@/domain";
import {
  DescarteForm,
  type DescarteFormValues,
} from "@/components/descartes/DescarteForm";
import { fromDateInput, toDateInput } from "@/lib/descarteUi";

export const Route = createFileRoute("/_app/descartes/$id/editar")({
  head: () => ({ meta: [{ title: "Editar Descarte — Cafundó" }] }),
  component: EditarDescartePage,
});

function EditarDescartePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: descarte, isLoading } = useQuery({
    queryKey: ["descartes", id],
    queryFn: () => descarteService.buscarPorId(id),
  });

  const mutation = useMutation({
    mutationFn: async (values: DescarteFormValues) => {
      if (!values.motivo || !values.destino)
        throw new Error("Campos obrigatórios ausentes.");
      return descarteService.atualizar(id, {
        dataDescarte: fromDateInput(values.dataDescarte),
        motivo: values.motivo,
        peso: Number(values.peso),
        destino: values.destino,
        observacoes: values.observacoes.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["descartes"] });
      toast.success("Descarte atualizado com sucesso.");
      navigate({ to: "/descartes/$id", params: { id } });
    },
    onError: () => {
      toast.error("Não foi possível atualizar o descarte.");
    },
  });

  if (isLoading) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Carregando descarte...
      </div>
    );
  }

  if (!descarte) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">
          Descarte não encontrado
        </h1>
        <Button asChild>
          <Link to="/descartes">Voltar para Descartes</Link>
        </Button>
      </div>
    );
  }

  const initial: DescarteFormValues = {
    matrizId: descarte.matrizId,
    dataDescarte: toDateInput(descarte.dataDescarte),
    motivo: descarte.motivo,
    peso: String(descarte.peso),
    destino: descarte.destino,
    observacoes: descarte.observacoes ?? "",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link to="/descartes/$id" params={{ id }}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para o descarte
          </Link>
        </Button>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Editar Descarte
        </h1>
        <p className="text-sm text-muted-foreground">
          A matriz vinculada ao descarte não pode ser alterada.
        </p>
      </div>

      <DescarteForm
        initial={initial}
        submitting={mutation.isPending}
        submitLabel="Salvar alterações"
        matrizLocked
        onSubmit={(v) => mutation.mutate(v)}
        onCancel={() =>
          navigate({ to: "/descartes/$id", params: { id } })
        }
      />
    </div>
  );
}

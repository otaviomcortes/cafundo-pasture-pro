import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { matrizService, partoService } from "@/domain";
import { SEXO_BADGE, SEXO_LABEL, formatDate } from "@/lib/partoUi";

export const Route = createFileRoute("/_app/partos/$id/")({
  head: () => ({ meta: [{ title: "Detalhes do Parto — Cafundó" }] }),
  component: PartoDetalhePage,
});

function PartoDetalhePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data: parto, isLoading } = useQuery({
    queryKey: ["partos", id],
    queryFn: () => partoService.buscarPorId(id),
  });

  const { data: matriz } = useQuery({
    queryKey: ["matrizes", parto?.matrizId],
    queryFn: () => matrizService.buscarPorId(parto!.matrizId),
    enabled: !!parto?.matrizId,
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
        <p className="text-sm text-muted-foreground">
          O registro solicitado não existe ou foi removido.
        </p>
        <Button asChild>
          <Link to="/partos">Voltar para Partos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link to="/partos">
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para Partos
            </Link>
          </Button>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Parto em {formatDate(parto.dataParto)}
          </h1>
          <p className="text-sm text-muted-foreground">
            Matriz brinco{" "}
            <span className="font-medium text-foreground">
              {matriz?.numeroBrinco ?? "—"}
            </span>
          </p>
        </div>
        <Button
          onClick={() =>
            navigate({ to: "/partos/$id/editar", params: { id: parto.id } })
          }
        >
          <Pencil className="mr-1 h-4 w-4" /> Editar
        </Button>
      </div>

      <Card className="p-6 shadow-[var(--shadow-card)]">
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <Info label="Data do parto" value={formatDate(parto.dataParto)} />
          <Info
            label="Matriz"
            value={
              matriz ? (
                <Link
                  to="/matrizes/$id"
                  params={{ id: matriz.id }}
                  className="text-primary hover:underline"
                >
                  Brinco {matriz.numeroBrinco}
                </Link>
              ) : (
                "—"
              )
            }
          />
          <Info
            label="Sexo do bezerro"
            value={
              <Badge variant="outline" className={SEXO_BADGE[parto.sexoBezerro]}>
                {SEXO_LABEL[parto.sexoBezerro]}
              </Badge>
            }
          />
          <Info label="Raça do bezerro" value={parto.racaBezerro} />
          <div className="sm:col-span-2">
            <Info
              label="Observações"
              value={parto.observacoes ?? "—"}
              whitespace
            />
          </div>
        </dl>
      </Card>
    </div>
  );
}

function Info({
  label,
  value,
  whitespace,
}: {
  label: string;
  value: React.ReactNode;
  whitespace?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm text-foreground ${whitespace ? "whitespace-pre-wrap" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

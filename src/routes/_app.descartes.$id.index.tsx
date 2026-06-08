import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { descarteService, matrizService, PROPRIETARIO_LABEL } from "@/domain";
import {
  MOTIVO_DESCARTE_LABEL,
  DESTINO_DESCARTE_LABEL,
  formatDate,
} from "@/lib/descarteUi";

export const Route = createFileRoute("/_app/descartes/$id/")({
  head: () => ({ meta: [{ title: "Detalhes do Descarte — Cafundó" }] }),
  component: DescarteDetalhePage,
});

function DescarteDetalhePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data: descarte, isLoading } = useQuery({
    queryKey: ["descartes", id],
    queryFn: () => descarteService.buscarPorId(id),
  });

  const { data: matriz } = useQuery({
    queryKey: ["matrizes", descarte?.matrizId],
    queryFn: () => matrizService.buscarPorId(descarte!.matrizId),
    enabled: !!descarte?.matrizId,
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link to="/descartes">
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para Descartes
            </Link>
          </Button>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Descarte em {formatDate(descarte.dataDescarte)}
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
            navigate({
              to: "/descartes/$id/editar",
              params: { id: descarte.id },
            })
          }
        >
          <Pencil className="mr-1 h-4 w-4" /> Editar
        </Button>
      </div>

      <Card className="p-6 shadow-[var(--shadow-card)]">
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <Info label="Data do descarte" value={formatDate(descarte.dataDescarte)} />
          <Info
            label="Brinco da matriz"
            value={
              matriz ? (
                <Link
                  to="/matrizes/$id"
                  params={{ id: matriz.id }}
                  className="text-primary hover:underline"
                >
                  {matriz.numeroBrinco}
                </Link>
              ) : (
                "—"
              )
            }
          />
          <Info
            label="Proprietário"
            value={matriz ? PROPRIETARIO_LABEL[matriz.proprietario] : "—"}
          />
          <Info
            label="Motivo"
            value={MOTIVO_DESCARTE_LABEL[descarte.motivo]}
          />
          <Info label="Peso (kg)" value={descarte.peso.toLocaleString("pt-BR")} />
          <Info
            label="Destino"
            value={DESTINO_DESCARTE_LABEL[descarte.destino]}
          />
          <div className="sm:col-span-2">
            <Info
              label="Observações"
              value={descarte.observacoes ?? "—"}
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

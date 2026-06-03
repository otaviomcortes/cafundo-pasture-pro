import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Baby, Syringe, HeartPulse, PackageMinus, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  matrizService,
  partoService,
  prenhezService,
  descarteService,
  protocoloMatrizService,
  protocoloIatfService,
  PROPRIETARIO_LABEL,
  type ProtocoloIatf,
} from "@/domain";
import {
  STATUS_LABEL,
  SITUACAO_LABEL,
  STATUS_BADGE,
  SITUACAO_BADGE,
  formatDate,
  calcularIdade,
} from "@/lib/matrizUi";

export const Route = createFileRoute("/_app/matrizes/$id")({
  head: () => ({
    meta: [{ title: "Detalhes da Matriz — Cafundó" }],
  }),
  component: MatrizDetalhePage,
});

const SEXO_LABEL: Record<"macho" | "femea", string> = {
  macho: "Macho",
  femea: "Fêmea",
};

const ORIGEM_PRENHEZ_LABEL: Record<string, string> = {
  iatf: "IATF",
  monta_natural: "Monta natural",
};

const STATUS_PRENHEZ_LABEL: Record<string, string> = {
  ativa: "Ativa",
  encerrada: "Encerrada",
  perdida: "Perdida",
};

const STATUS_PRENHEZ_BADGE: Record<string, string> = {
  ativa: "bg-success/15 text-success border-success/30",
  encerrada: "bg-muted text-muted-foreground border-border",
  perdida: "bg-destructive/10 text-destructive border-destructive/30",
};

const MOTIVO_DESCARTE_LABEL: Record<string, string> = {
  idade: "Idade",
  falha_reprodutiva: "Falha reprodutiva",
  problema_sanitario: "Problema sanitário",
  problema_locomotor: "Problema locomotor",
  temperamento: "Temperamento",
  outros: "Outros",
};

const DESTINO_DESCARTE_LABEL: Record<string, string> = {
  frigorifico: "Frigorífico",
  leilao: "Leilão",
  venda_direta: "Venda direta",
};

const DIAGNOSTICO_LABEL: Record<string, string> = {
  prenha: "Prenha",
  vazia: "Vazia",
  nao_avaliada: "Não avaliada",
};

const DIAGNOSTICO_BADGE: Record<string, string> = {
  prenha: "bg-success/15 text-success border-success/30",
  vazia: "bg-warning/25 text-warning-foreground border-warning/50",
  nao_avaliada: "bg-muted text-muted-foreground border-border",
};

function EtapaIcone({ concluida }: { concluida: boolean }) {
  return concluida ? (
    <span className="inline-flex items-center gap-1 text-success">
      <Check className="h-4 w-4" /> Sim
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <X className="h-4 w-4" /> Não
    </span>
  );
}

function MatrizDetalhePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const matrizQ = useQuery({
    queryKey: ["matriz", id],
    queryFn: () => matrizService.buscarPorId(id),
  });

  const partosQ = useQuery({
    queryKey: ["partos", "matriz", id],
    queryFn: () => partoService.listarPorMatriz(id),
  });

  const prenhezesQ = useQuery({
    queryKey: ["prenhezes", "matriz", id],
    queryFn: () => prenhezService.listarPorMatriz(id),
  });

  const descartesQ = useQuery({
    queryKey: ["descartes", "matriz", id],
    queryFn: () => descarteService.listarPorMatriz(id),
  });

  const participacoesQ = useQuery({
    queryKey: ["protocolosMatriz", "matriz", id],
    queryFn: () => protocoloMatrizService.listarPorMatriz(id),
  });

  const protocolosQ = useQuery({
    queryKey: ["protocolosIatf"],
    queryFn: () => protocoloIatfService.listar(),
  });

  const matriz = matrizQ.data;
  const partos = partosQ.data ?? [];
  const prenhezes = prenhezezSort(prenhezesQ.data ?? []);
  const descartes = descartesQ.data ?? [];
  const participacoes = participacoesQ.data ?? [];
  const protocolos = protocolosQ.data ?? [];

  const protocolosMap = new Map<string, ProtocoloIatf>(
    protocolos.map((p) => [p.id, p]),
  );

  if (matrizQ.isLoading) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Carregando matriz...
      </div>
    );
  }

  if (!matriz) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate({ to: "/matrizes" })}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para Matrizes
        </Button>
        <Card className="p-10 text-center text-muted-foreground">
          Matriz não encontrada.
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 text-muted-foreground"
          >
            <Link to="/matrizes">
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para Matrizes
            </Link>
          </Button>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Matriz {matriz.numeroBrinco}
          </h1>
          <p className="text-sm text-muted-foreground">
            Histórico reprodutivo completo
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className={STATUS_BADGE[matriz.status]}>
            {STATUS_LABEL[matriz.status]}
          </Badge>
          <Badge
            variant="outline"
            className={SITUACAO_BADGE[matriz.situacaoReprodutiva]}
          >
            {SITUACAO_LABEL[matriz.situacaoReprodutiva]}
          </Badge>
        </div>
      </div>

      {/* Dados da matriz */}
      <Card className="p-6 shadow-[var(--shadow-card)]">
        <h2 className="font-display text-xl font-semibold">Dados da Matriz</h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 text-sm md:grid-cols-3 lg:grid-cols-4">
          <Info label="Brinco" value={matriz.numeroBrinco} />
          <Info label="Proprietário" value={PROPRIETARIO_LABEL[matriz.proprietario]} />
          <Info label="Raça" value={matriz.raca} />
          <Info label="Data de nascimento" value={formatDate(matriz.dataNascimento)} />
          <Info label="Idade" value={calcularIdade(matriz.dataNascimento)} />
          <Info
            label="Status"
            value={
              <Badge variant="outline" className={STATUS_BADGE[matriz.status]}>
                {STATUS_LABEL[matriz.status]}
              </Badge>
            }
          />
          <Info
            label="Situação reprodutiva"
            value={
              <Badge
                variant="outline"
                className={SITUACAO_BADGE[matriz.situacaoReprodutiva]}
              >
                {SITUACAO_LABEL[matriz.situacaoReprodutiva]}
              </Badge>
            }
          />
          <Info label="Quantidade de partos" value={partos.length} />
          <Info label="Cadastrada em" value={formatDate(matriz.criadoEm)} />
          <Info label="Atualizada em" value={formatDate(matriz.atualizadoEm)} />
          <div className="col-span-2 md:col-span-3 lg:col-span-4">
            <dt className="text-xs text-muted-foreground">Observações</dt>
            <dd className="font-medium">{matriz.observacoes ?? "—"}</dd>
          </div>
        </dl>
      </Card>

      {/* Partos */}
      <SecaoHistorico
        titulo="Histórico de Partos"
        icone={<Baby className="h-5 w-5" />}
        total={partos.length}
        vazio="Nenhum parto registrado para esta matriz."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Sexo do bezerro</TableHead>
              <TableHead>Raça do bezerro</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...partos]
              .sort(
                (a, b) =>
                  new Date(b.dataParto).getTime() -
                  new Date(a.dataParto).getTime(),
              )
              .map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.dataParto)}</TableCell>
                  <TableCell>{SEXO_LABEL[p.sexoBezerro]}</TableCell>
                  <TableCell>{p.racaBezerro}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.observacoes ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </SecaoHistorico>

      {/* Protocolos IATF */}
      <SecaoHistorico
        titulo="Histórico de Protocolos IATF"
        icone={<Syringe className="h-5 w-5" />}
        total={participacoes.length}
        vazio="Nenhum protocolo IATF registrado para esta matriz."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Protocolo</TableHead>
              <TableHead className="text-center">Etapa 1</TableHead>
              <TableHead className="text-center">Etapa 2</TableHead>
              <TableHead className="text-center">Etapa 3</TableHead>
              <TableHead>Diagnóstico</TableHead>
              <TableHead>Data diagnóstico</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participacoes.map((pm) => {
              const proto = protocolosMap.get(pm.protocoloId);
              return (
                <TableRow key={pm.id}>
                  <TableCell className="font-medium">
                    {proto?.nome ?? pm.protocoloId}
                  </TableCell>
                  <TableCell className="text-center">
                    <EtapaIcone concluida={pm.etapa1Concluida} />
                  </TableCell>
                  <TableCell className="text-center">
                    <EtapaIcone concluida={pm.etapa2Concluida} />
                  </TableCell>
                  <TableCell className="text-center">
                    <EtapaIcone concluida={pm.etapa3Concluida} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={DIAGNOSTICO_BADGE[pm.diagnosticoPrenhez]}
                    >
                      {DIAGNOSTICO_LABEL[pm.diagnosticoPrenhez]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(pm.dataDiagnostico)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </SecaoHistorico>

      {/* Prenhezes */}
      <SecaoHistorico
        titulo="Histórico de Prenhezes"
        icone={<HeartPulse className="h-5 w-5" />}
        total={prenhezes.length}
        vazio="Nenhuma prenhez registrada para esta matriz."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Origem</TableHead>
              <TableHead>Data de confirmação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prenhezes.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{ORIGEM_PRENHEZ_LABEL[p.origem]}</TableCell>
                <TableCell>{formatDate(p.dataConfirmacao)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={STATUS_PRENHEZ_BADGE[p.status]}
                  >
                    {STATUS_PRENHEZ_LABEL[p.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.observacoes ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SecaoHistorico>

      {/* Descarte */}
      <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-5 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <PackageMinus className="h-5 w-5" />
          </span>
          <h2 className="font-display text-lg font-semibold">Informações de Descarte</h2>
        </div>
        {descartes.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            Matriz sem registro de descarte.
          </div>
        ) : (
          <div className="p-5">
            {(() => {
              const d = descartes[0];
              return (
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm md:grid-cols-3">
                  <Info label="Data do descarte" value={formatDate(d.dataDescarte)} />
                  <Info
                    label="Motivo"
                    value={MOTIVO_DESCARTE_LABEL[d.motivo] ?? d.motivo}
                  />
                  <Info label="Peso (kg)" value={d.peso} />
                  <Info
                    label="Destino"
                    value={DESTINO_DESCARTE_LABEL[d.destino] ?? d.destino}
                  />
                  <div className="col-span-2 md:col-span-3">
                    <dt className="text-xs text-muted-foreground">Observações</dt>
                    <dd className="font-medium">{d.observacoes ?? "—"}</dd>
                  </div>
                </dl>
              );
            })()}
          </div>
        )}
      </Card>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function SecaoHistorico({
  titulo,
  icone,
  total,
  vazio,
  children,
}: {
  titulo: string;
  icone: React.ReactNode;
  total: number;
  vazio: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icone}
          </span>
          <h2 className="font-display text-lg font-semibold">{titulo}</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {total} {total === 1 ? "registro" : "registros"}
        </span>
      </div>
      {total === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">
          {vazio}
        </div>
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}
    </Card>
  );
}

function prenhezezSort<T extends { dataConfirmacao: string }>(arr: T[]): T[] {
  return [...arr].sort(
    (a, b) =>
      new Date(b.dataConfirmacao).getTime() -
      new Date(a.dataConfirmacao).getTime(),
  );
}

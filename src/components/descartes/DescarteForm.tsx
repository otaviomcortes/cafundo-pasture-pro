import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  matrizService,
  descarteService,
  MOTIVOS_DESCARTE,
  DESTINOS_DESCARTE,
  PROPRIETARIO_LABEL,
  type MotivoDescarte,
  type DestinoDescarte,
} from "@/domain";
import {
  MOTIVO_DESCARTE_LABEL,
  DESTINO_DESCARTE_LABEL,
  toDateInput,
} from "@/lib/descarteUi";

export interface DescarteFormValues {
  matrizId: string;
  dataDescarte: string;
  motivo: MotivoDescarte | "";
  peso: string; // controlled as string for input
  destino: DestinoDescarte | "";
  observacoes: string;
}

export function emptyDescarteForm(): DescarteFormValues {
  return {
    matrizId: "",
    dataDescarte: toDateInput(new Date().toISOString()),
    motivo: "",
    peso: "",
    destino: "",
    observacoes: "",
  };
}

interface Props {
  initial: DescarteFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: DescarteFormValues) => void;
  onCancel: () => void;
  /** Quando true, a matriz não pode ser alterada (modo edição). */
  matrizLocked?: boolean;
}

export function DescarteForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
  matrizLocked,
}: Props) {
  const [values, setValues] = useState<DescarteFormValues>(initial);
  const [matrizOpen, setMatrizOpen] = useState(false);
  const [erros, setErros] = useState<
    Partial<Record<keyof DescarteFormValues, string>>
  >({});

  const { data: matrizes = [] } = useQuery({
    queryKey: ["matrizes"],
    queryFn: () => matrizService.listar(),
  });

  const { data: descartes = [] } = useQuery({
    queryKey: ["descartes"],
    queryFn: () => descarteService.listar(),
  });

  // IDs de matrizes que já possuem descarte (exceto a do registro atual quando editando).
  const matrizesComDescarte = useMemo(() => {
    const set = new Set<string>();
    for (const d of descartes) {
      if (matrizLocked && d.matrizId === initial.matrizId) continue;
      set.add(d.matrizId);
    }
    return set;
  }, [descartes, matrizLocked, initial.matrizId]);

  // Disponíveis: ativas e sem descarte. No modo edição, sempre incluir a matriz atual.
  const matrizesDisponiveis = useMemo(() => {
    const elegiveis = matrizes.filter(
      (m) => m.status === "ativa" && !matrizesComDescarte.has(m.id),
    );
    if (matrizLocked && values.matrizId) {
      const atual = matrizes.find((m) => m.id === values.matrizId);
      if (atual && !elegiveis.some((m) => m.id === atual.id)) {
        return [atual, ...elegiveis];
      }
    }
    return elegiveis;
  }, [matrizes, matrizesComDescarte, matrizLocked, values.matrizId]);

  const matrizSelecionada = matrizes.find((m) => m.id === values.matrizId);

  function set<K extends keyof DescarteFormValues>(
    key: K,
    v: DescarteFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: v }));
    setErros((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const novos: typeof erros = {};
    if (!values.matrizId) novos.matrizId = "Selecione a matriz.";
    if (!values.dataDescarte)
      novos.dataDescarte = "Informe a data do descarte.";
    if (!values.motivo) novos.motivo = "Selecione o motivo.";
    const pesoNum = Number(values.peso);
    if (!values.peso || Number.isNaN(pesoNum) || pesoNum <= 0)
      novos.peso = "Informe um peso maior que zero.";
    if (!values.destino) novos.destino = "Selecione o destino.";

    if (Object.keys(novos).length > 0) {
      setErros(novos);
      return;
    }
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="space-y-5 p-6 shadow-[var(--shadow-card)]">
        {/* Matriz */}
        <div className="space-y-2">
          <Label>
            Matriz <span className="text-destructive">*</span>
          </Label>
          {matrizLocked ? (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {matrizSelecionada
                  ? `Brinco ${matrizSelecionada.numeroBrinco}`
                  : "Matriz indisponível"}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                A matriz não pode ser alterada.
              </span>
            </div>
          ) : (
            <Popover open={matrizOpen} onOpenChange={setMatrizOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={matrizOpen}
                  className={cn(
                    "w-full justify-between",
                    !matrizSelecionada && "text-muted-foreground",
                  )}
                >
                  {matrizSelecionada
                    ? `Brinco ${matrizSelecionada.numeroBrinco}`
                    : "Buscar matriz pelo brinco..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command
                  filter={(value, search) =>
                    value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
                  }
                >
                  <CommandInput placeholder="Digite o brinco..." />
                  <CommandList>
                    <CommandEmpty>
                      Nenhuma matriz elegível encontrada.
                    </CommandEmpty>
                    <CommandGroup>
                      {matrizesDisponiveis.map((m) => (
                        <CommandItem
                          key={m.id}
                          value={m.numeroBrinco}
                          onSelect={() => {
                            set("matrizId", m.id);
                            setMatrizOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              m.id === values.matrizId
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span className="font-medium">
                            Brinco {m.numeroBrinco}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {PROPRIETARIO_LABEL[m.proprietario]}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
          {erros.matrizId && (
            <p className="text-xs text-destructive">{erros.matrizId}</p>
          )}
          {!matrizLocked && (
            <p className="text-xs text-muted-foreground">
              Apenas matrizes ativas e sem descarte registrado são exibidas.
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="dataDescarte">
              Data do descarte <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dataDescarte"
              type="date"
              value={values.dataDescarte}
              onChange={(e) => set("dataDescarte", e.target.value)}
              max={toDateInput(new Date().toISOString())}
            />
            {erros.dataDescarte && (
              <p className="text-xs text-destructive">{erros.dataDescarte}</p>
            )}
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label>
              Motivo <span className="text-destructive">*</span>
            </Label>
            <Select
              value={values.motivo || undefined}
              onValueChange={(v) => set("motivo", v as MotivoDescarte)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {MOTIVOS_DESCARTE.map((m) => (
                  <SelectItem key={m} value={m}>
                    {MOTIVO_DESCARTE_LABEL[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {erros.motivo && (
              <p className="text-xs text-destructive">{erros.motivo}</p>
            )}
          </div>

          {/* Peso */}
          <div className="space-y-2">
            <Label htmlFor="peso">
              Peso (kg) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="peso"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={values.peso}
              onChange={(e) => set("peso", e.target.value)}
              placeholder="Ex.: 480"
            />
            {erros.peso && (
              <p className="text-xs text-destructive">{erros.peso}</p>
            )}
          </div>

          {/* Destino */}
          <div className="space-y-2">
            <Label>
              Destino <span className="text-destructive">*</span>
            </Label>
            <Select
              value={values.destino || undefined}
              onValueChange={(v) => set("destino", v as DestinoDescarte)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o destino" />
              </SelectTrigger>
              <SelectContent>
                {DESTINOS_DESCARTE.map((d) => (
                  <SelectItem key={d} value={d}>
                    {DESTINO_DESCARTE_LABEL[d]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {erros.destino && (
              <p className="text-xs text-destructive">{erros.destino}</p>
            )}
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            rows={4}
            value={values.observacoes}
            onChange={(e) => set("observacoes", e.target.value)}
            placeholder="Notas adicionais sobre o descarte..."
          />
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

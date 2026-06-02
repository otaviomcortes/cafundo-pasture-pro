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
import { matrizService, type SexoBezerro } from "@/domain";
import {
  RACAS_BEZERRO_PRESET,
  isRacaPreset,
  toDateInput,
} from "@/lib/partoUi";

export interface PartoFormValues {
  matrizId: string;
  dataParto: string; // yyyy-mm-dd
  sexoBezerro: SexoBezerro | "";
  racaBezerro: string;
  observacoes: string;
}

export function emptyPartoForm(): PartoFormValues {
  return {
    matrizId: "",
    dataParto: toDateInput(new Date().toISOString()),
    sexoBezerro: "",
    racaBezerro: "Nelore",
    observacoes: "",
  };
}

interface Props {
  initial: PartoFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: PartoFormValues) => void;
  onCancel: () => void;
  /** Quando true, o seletor de matriz é bloqueado (modo edição). */
  matrizLocked?: boolean;
}

export function PartoForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
  matrizLocked,
}: Props) {
  const [values, setValues] = useState<PartoFormValues>(initial);
  const [matrizOpen, setMatrizOpen] = useState(false);
  const [erros, setErros] = useState<Partial<Record<keyof PartoFormValues, string>>>({});

  // Modo de raça: preset (Nelore/Aberdeen) ou "outros" (texto livre).
  const initialMode: "preset" | "outros" =
    !initial.racaBezerro || isRacaPreset(initial.racaBezerro) ? "preset" : "outros";
  const [racaMode, setRacaMode] = useState<"preset" | "outros">(initialMode);
  const [racaPreset, setRacaPreset] = useState<string>(
    initialMode === "preset" && initial.racaBezerro
      ? initial.racaBezerro
      : "Nelore",
  );
  const [racaOutros, setRacaOutros] = useState<string>(
    initialMode === "outros" ? initial.racaBezerro : "",
  );

  const { data: matrizes = [] } = useQuery({
    queryKey: ["matrizes"],
    queryFn: () => matrizService.listar(),
  });

  // Disponíveis para seleção: apenas ativas; no modo edição, incluir a matriz atual mesmo que inativa.
  const matrizesDisponiveis = useMemo(() => {
    const ativas = matrizes.filter((m) => m.status === "ativa");
    if (matrizLocked && values.matrizId) {
      const atual = matrizes.find((m) => m.id === values.matrizId);
      if (atual && !ativas.some((m) => m.id === atual.id)) {
        return [atual, ...ativas];
      }
    }
    return ativas;
  }, [matrizes, values.matrizId, matrizLocked]);

  const matrizSelecionada = matrizes.find((m) => m.id === values.matrizId);

  function set<K extends keyof PartoFormValues>(key: K, v: PartoFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
    setErros((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const racaFinal =
      racaMode === "outros" ? racaOutros.trim() : racaPreset;
    const novos: typeof erros = {};
    if (!values.matrizId) novos.matrizId = "Selecione a matriz.";
    if (!values.dataParto) novos.dataParto = "Informe a data do parto.";
    if (!values.sexoBezerro) novos.sexoBezerro = "Informe o sexo do bezerro.";
    if (!racaFinal) {
      novos.racaBezerro =
        racaMode === "outros" ? "Informe a raça." : "Selecione a raça.";
    }
    if (Object.keys(novos).length > 0) {
      setErros(novos);
      return;
    }
    onSubmit({ ...values, racaBezerro: racaFinal });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="space-y-5 p-6 shadow-[var(--shadow-card)]">
        {/* Matriz */}
        <div className="space-y-2">
          <Label>Matriz <span className="text-destructive">*</span></Label>
          {matrizLocked ? (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {matrizSelecionada
                  ? `Brinco ${matrizSelecionada.numeroBrinco}`
                  : "Matriz indisponível"}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                A matriz não pode ser alterada nesta versão.
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
                    <CommandEmpty>Nenhuma matriz ativa encontrada.</CommandEmpty>
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
                              m.id === values.matrizId ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <span className="font-medium">Brinco {m.numeroBrinco}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {m.raca}
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
              Apenas matrizes ativas são exibidas.
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="dataParto">
              Data do parto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dataParto"
              type="date"
              value={values.dataParto}
              onChange={(e) => set("dataParto", e.target.value)}
              max={toDateInput(new Date().toISOString())}
            />
            {erros.dataParto && (
              <p className="text-xs text-destructive">{erros.dataParto}</p>
            )}
          </div>

          {/* Sexo */}
          <div className="space-y-2">
            <Label>
              Sexo do bezerro <span className="text-destructive">*</span>
            </Label>
            <Select
              value={values.sexoBezerro || undefined}
              onValueChange={(v) => set("sexoBezerro", v as SexoBezerro)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="macho">Macho</SelectItem>
                <SelectItem value="femea">Fêmea</SelectItem>
              </SelectContent>
            </Select>
            {erros.sexoBezerro && (
              <p className="text-xs text-destructive">{erros.sexoBezerro}</p>
            )}
          </div>

          {/* Raça */}
          <div className="space-y-2">
            <Label>Raça do bezerro</Label>
            <Select
              value={values.racaBezerro}
              onValueChange={(v) => set("racaBezerro", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RACAS_BEZERRO.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {erros.racaBezerro && (
              <p className="text-xs text-destructive">{erros.racaBezerro}</p>
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
            placeholder="Notas sobre o parto, condição do bezerro, intercorrências..."
          />
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

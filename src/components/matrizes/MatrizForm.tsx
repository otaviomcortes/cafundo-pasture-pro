import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROPRIETARIOS_MATRIZ,
  PROPRIETARIO_LABEL,
  type Matriz,
  type MatrizInput,
  type MatrizStatus,
  type ProprietarioMatriz,
  type SituacaoReprodutiva,
} from "@/domain";
import { STATUS_LABEL, SITUACAO_LABEL } from "@/lib/matrizUi";

export interface MatrizFormValues {
  numeroBrinco: string;
  proprietario: ProprietarioMatriz | "";
  raca: string;
  dataNascimento: string; // yyyy-mm-dd or ""
  status: MatrizStatus;
  situacaoReprodutiva: SituacaoReprodutiva;
  observacoes: string;
}

function isoToDateInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function emptyMatrizForm(): MatrizFormValues {
  return {
    numeroBrinco: "",
    proprietario: "",
    raca: "Nelore",
    dataNascimento: "",
    status: "ativa",
    situacaoReprodutiva: "vazia",
    observacoes: "",
  };
}

export function matrizToForm(m: Matriz): MatrizFormValues {
  return {
    numeroBrinco: m.numeroBrinco,
    proprietario: m.proprietario,
    raca: m.raca || "Nelore",
    dataNascimento: isoToDateInput(m.dataNascimento),
    status: m.status,
    situacaoReprodutiva: m.situacaoReprodutiva,
    observacoes: m.observacoes ?? "",
  };
}

interface Props {
  initial: MatrizFormValues;
  matrizes: Matriz[];
  editingId?: string;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (input: MatrizInput) => void;
  onCancel: () => void;
}

export function MatrizForm({
  initial,
  matrizes,
  editingId,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const [values, setValues] = useState<MatrizFormValues>(initial);
  const [erros, setErros] = useState<
    Partial<Record<keyof MatrizFormValues, string>>
  >({});

  const hojeStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function set<K extends keyof MatrizFormValues>(
    key: K,
    v: MatrizFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: v }));
    setErros((prev) => ({ ...prev, [key]: undefined }));
  }

  function validar(): typeof erros {
    const novos: typeof erros = {};
    const brinco = values.numeroBrinco.trim();
    if (!brinco) novos.numeroBrinco = "Informe o número do brinco.";
    else {
      const dup = matrizes.find(
        (m) =>
          m.numeroBrinco.trim().toLowerCase() === brinco.toLowerCase() &&
          m.id !== editingId,
      );
      if (dup) novos.numeroBrinco = "Já existe matriz com este brinco.";
    }
    if (!values.proprietario) novos.proprietario = "Selecione o proprietário.";
    if (values.dataNascimento && values.dataNascimento > hojeStr) {
      novos.dataNascimento = "Data não pode ser futura.";
    }
    // Compatibilidade status x situação
    const inativa = values.status !== "ativa";
    if (
      inativa &&
      (values.situacaoReprodutiva === "em_protocolo" ||
        values.situacaoReprodutiva === "prenha")
    ) {
      novos.situacaoReprodutiva =
        "Situação incompatível com status não ativo.";
    }
    return novos;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const novos = validar();
    if (Object.keys(novos).length > 0) {
      setErros(novos);
      return;
    }
    const dataNascIso = values.dataNascimento
      ? new Date(values.dataNascimento + "T00:00:00").toISOString()
      : new Date().toISOString();
    const input: MatrizInput = {
      numeroBrinco: values.numeroBrinco.trim(),
      proprietario: values.proprietario as ProprietarioMatriz,
      raca: values.raca.trim() || "Nelore",
      dataNascimento: dataNascIso,
      status: values.status,
      situacaoReprodutiva: values.situacaoReprodutiva,
      quantidadePartos: 0,
      observacoes: values.observacoes.trim() || undefined,
    };
    onSubmit(input);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identificação */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Identificação
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="numeroBrinco">
              Número do brinco <span className="text-destructive">*</span>
            </Label>
            <Input
              id="numeroBrinco"
              value={values.numeroBrinco}
              onChange={(e) => set("numeroBrinco", e.target.value)}
              placeholder="Ex.: 145"
            />
            {erros.numeroBrinco && (
              <p className="text-xs text-destructive">{erros.numeroBrinco}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Proprietário <span className="text-destructive">*</span>
            </Label>
            <Select
              value={values.proprietario || undefined}
              onValueChange={(v) =>
                set("proprietario", v as ProprietarioMatriz)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o proprietário" />
              </SelectTrigger>
              <SelectContent>
                {PROPRIETARIOS_MATRIZ.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PROPRIETARIO_LABEL[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {erros.proprietario && (
              <p className="text-xs text-destructive">{erros.proprietario}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="raca">Raça</Label>
            <Input
              id="raca"
              value={values.raca}
              onChange={(e) => set("raca", e.target.value)}
              placeholder="Nelore"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataNascimento">Data de nascimento</Label>
            <Input
              id="dataNascimento"
              type="date"
              value={values.dataNascimento}
              max={hojeStr}
              onChange={(e) => set("dataNascimento", e.target.value)}
            />
            {erros.dataNascimento && (
              <p className="text-xs text-destructive">
                {erros.dataNascimento}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Situação */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Situação
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={values.status}
              onValueChange={(v) => set("status", v as MatrizStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABEL) as MatrizStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Situação reprodutiva</Label>
            <Select
              value={values.situacaoReprodutiva}
              onValueChange={(v) =>
                set("situacaoReprodutiva", v as SituacaoReprodutiva)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SITUACAO_LABEL) as SituacaoReprodutiva[]).map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {SITUACAO_LABEL[s]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            {erros.situacaoReprodutiva && (
              <p className="text-xs text-destructive">
                {erros.situacaoReprodutiva}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Observações */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Observações
        </h3>
        <Textarea
          rows={3}
          value={values.observacoes}
          onChange={(e) => set("observacoes", e.target.value)}
          placeholder="Notas adicionais sobre a matriz..."
        />
      </section>

      <div className="flex justify-end gap-2 pt-2">
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

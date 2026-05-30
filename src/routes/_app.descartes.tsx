import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { PackageMinus } from "lucide-react";

export const Route = createFileRoute("/_app/descartes")({
  component: () => (
    <PlaceholderPage
      title="Descartes"
      icon={PackageMinus}
      description="Controle de descartes de matrizes, motivos e impacto no rebanho ativo."
    />
  ),
});

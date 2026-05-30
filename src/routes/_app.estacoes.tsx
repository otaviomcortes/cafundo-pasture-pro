import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { CalendarRange } from "lucide-react";

export const Route = createFileRoute("/_app/estacoes")({
  component: () => (
    <PlaceholderPage
      title="Estações de Monta"
      icon={CalendarRange}
      description="Planejamento e acompanhamento das estações de monta anuais, com indicadores por lote."
    />
  ),
});

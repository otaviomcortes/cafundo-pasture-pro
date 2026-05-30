import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { FileBarChart } from "lucide-react";

export const Route = createFileRoute("/_app/relatorios")({
  component: () => (
    <PlaceholderPage
      title="Relatórios"
      icon={FileBarChart}
      description="Relatórios reprodutivos, zootécnicos e indicadores gerenciais da fazenda."
    />
  ),
});

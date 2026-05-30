import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { Baby } from "lucide-react";

export const Route = createFileRoute("/_app/partos")({
  component: () => (
    <PlaceholderPage
      title="Partos"
      icon={Baby}
      description="Registro de partos, condição do bezerro ao nascer e indicadores de natalidade."
    />
  ),
});

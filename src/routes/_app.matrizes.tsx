import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { Beef } from "lucide-react";

export const Route = createFileRoute("/_app/matrizes")({
  component: () => (
    <PlaceholderPage
      title="Matrizes"
      icon={Beef}
      description="Cadastro completo das matrizes do rebanho, com histórico reprodutivo, sanitário e zootécnico."
    />
  ),
});

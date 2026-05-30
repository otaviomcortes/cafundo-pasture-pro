import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { Syringe } from "lucide-react";

export const Route = createFileRoute("/_app/protocolos")({
  component: () => (
    <PlaceholderPage
      title="Protocolos IATF"
      icon={Syringe}
      description="Gestão de protocolos hormonais, cronograma de manejos D0–D11 e aplicação por lote."
    />
  ),
});

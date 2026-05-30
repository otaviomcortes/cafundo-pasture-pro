import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { HeartPulse } from "lucide-react";

export const Route = createFileRoute("/_app/prenhezes")({
  component: () => (
    <PlaceholderPage
      title="Prenhezes"
      icon={HeartPulse}
      description="Diagnóstico, acompanhamento e previsão de partos das matrizes prenhas."
    />
  ),
});

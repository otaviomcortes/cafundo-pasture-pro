import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Cafundó</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
      </div>

      <Card className="flex flex-col items-center justify-center gap-4 p-12 text-center shadow-[var(--shadow-card)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-8 w-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="font-display text-xl font-semibold">Módulo em construção</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground">
          <Construction className="h-3.5 w-3.5" />
          Estrutura pronta para integração com PostgreSQL
        </div>
        <Button variant="outline" size="sm">Solicitar prioridade</Button>
      </Card>
    </div>
  );
}

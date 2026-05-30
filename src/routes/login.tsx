import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Entrar — Cafundó" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock auth - estrutura pronta para integração futura
    setTimeout(() => navigate({ to: "/" }), 600);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-20"
          style={{ background: "var(--gradient-accent)" }}
        />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative space-y-4">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Gestão reprodutiva,<br />do curral ao escritório.
          </h1>
          <p className="max-w-md text-sm text-sidebar-foreground/70">
            Centralize matrizes, estações de monta, protocolos IATF, prenhezes e partos
            em uma plataforma feita para a pecuária de corte.
          </p>
          <div className="flex gap-6 pt-6 text-xs uppercase tracking-widest text-sidebar-foreground/60">
            <span>Matrizes</span>
            <span>IATF</span>
            <span>Prenhezes</span>
            <span>Partos</span>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 lg:p-10">
        <Card className="w-full max-w-md border-border/60 p-8 shadow-[var(--shadow-elevated)]">
          <div className="mb-6 lg:hidden">
            <Logo variant="dark" />
          </div>
          <div className="mb-6 space-y-1">
            <h2 className="font-display text-2xl font-bold">Bem-vindo de volta</h2>
            <p className="text-sm text-muted-foreground">
              Acesse sua fazenda para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="voce@fazenda.com" defaultValue="joao@cafundo.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button type="button" className="text-xs text-accent hover:underline">
                  Esqueci a senha
                </button>
              </div>
              <Input id="password" type="password" defaultValue="••••••••" required />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Ainda não tem conta?{" "}
              <Link to="/login" className="font-medium text-accent hover:underline">
                Fale com o suporte
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}

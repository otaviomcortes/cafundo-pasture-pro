import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Beef,
  Syringe,
  HeartPulse,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Logo } from "./Logo";

// Ícones por módulo (contexto pecuário):
//  - Matrizes:     Beef  (animal do rebanho)
//  - Protocolos:   Syringe (manejo reprodutivo)
//  - Partos:       HeartPulse (acompanhamento reprodutivo)
//  - Descartes:    Beef  (saída do ciclo reprodutivo / abate)
const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Matrizes", url: "/matrizes", icon: Beef },
  { title: "Protocolos IATF", url: "/protocolos-iatf", icon: Syringe },
  { title: "Partos", url: "/partos", icon: HeartPulse },
  { title: "Descartes", url: "/descartes", icon: Beef },
];

// NOTA: a rota /relatorios permanece registrada no código para evitar
// quebra de navegação por links antigos, porém foi removida do menu
// nesta sprint de simplificação. Decisão de remoção definitiva pendente.

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operacional</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="text-xs text-sidebar-foreground/60">
          <p className="font-semibold text-sidebar-foreground/80">Fazenda Cafundó</p>
          <p>v0.1.0 · Estrutura inicial</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  UsersIcon,
  Building2Icon,
  WalletIcon,
  BarChart3Icon,
  ReceiptTextIcon,
  ListTreeIcon,
  CalendarClockIcon ,
} from "lucide-react";

const navItems = [
  { title: "Empleados", url: "/empleados", icon: UsersIcon },
  { title: "Departamentos", url: "/departamentos", icon: Building2Icon },
  { title: "Conceptos", url: "/conceptos", icon: ListTreeIcon },
  { title: "Períodos", url: "/periodos", icon: CalendarClockIcon },
  { title: "Nómina", url: "/nomina", icon: WalletIcon },
  { title: "Reportes", url: "/reportes", icon: BarChart3Icon },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<NavLink to="/empleados" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <ReceiptTextIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Consulting, S.A.</span>
                <span className="truncate text-xs">Sistema de Nóminas</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                isActive={location.pathname.startsWith(item.url)}
                render={<NavLink to={item.url} />}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

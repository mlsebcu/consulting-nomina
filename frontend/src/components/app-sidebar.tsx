import type { ComponentProps } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { navegacionPorRol, RUTA_INICIAL } from "@/routes/navegacion";

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
    const { pathname } = useLocation();
    const { esAdmin } = useAuth();

    return (
        <Sidebar variant="inset" className="print:hidden" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<NavLink to={RUTA_INICIAL} />}>
                            <img src={logo} alt="" className="size-8 shrink-0 object-contain" />
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">Consulting, S.A.</span>
                                <span className="truncate text-xs">Sistema de Nóminas</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {navegacionPorRol(esAdmin).map((grupo) => (
                    <SidebarGroup key={grupo.titulo}>
                        <SidebarGroupLabel>{grupo.titulo}</SidebarGroupLabel>
                        <SidebarMenu>
                            {grupo.items.map((item) => (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton
                                        isActive={pathname.startsWith(item.url)}
                                        tooltip={item.titulo}
                                        render={<NavLink to={item.url} />}
                                    >
                                        <item.icono />
                                        <span>{item.titulo}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

import type { ComponentProps } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ReceiptTextIcon } from "lucide-react";
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
import { NAVEGACION, RUTA_INICIAL } from "@/routes/navegacion";

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
    const { pathname } = useLocation();

    return (
        <Sidebar variant="inset" className="print:hidden" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<NavLink to={RUTA_INICIAL} />}>
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
                {NAVEGACION.map((grupo) => (
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

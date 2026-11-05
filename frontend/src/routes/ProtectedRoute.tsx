import { Suspense } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { buscarItem } from "./navegacion";

export function ProtectedRoute() {
    const { usuario } = useAuth();
    const { pathname } = useLocation();

    if (!usuario) {
        return <Navigate to="/login" replace state={{ desde: pathname }} />;
    }

    const item = buscarItem(pathname);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="min-w-0">
                <header className="flex h-16 shrink-0 items-center gap-2 px-4 print:hidden">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                    <div className="leading-tight">
                        <h1 className="text-sm font-semibold">{item?.titulo}</h1>
                        <p className="hidden text-xs text-muted-foreground sm:block">
                            {item?.descripcion}
                        </p>
                    </div>
                </header>
                <main className="flex min-w-0 flex-1 flex-col gap-4 p-4 pt-0">
                    <Suspense
                        fallback={
                            <div className="flex flex-1 items-center justify-center py-16">
                                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                            </div>
                        }
                    >
                        <Outlet />
                    </Suspense>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

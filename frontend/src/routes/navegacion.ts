import {
    BarChart3Icon,
    Building2Icon,
    CalendarClockIcon,
    ClipboardListIcon,
    HouseIcon,
    ListTreeIcon,
    SlidersHorizontalIcon,
    UserCogIcon,
    UsersIcon,
    WalletIcon,
    type LucideIcon,
} from "lucide-react";

export interface ItemNavegacion {
    titulo: string;
    url: string;
    icono: LucideIcon;
    descripcion: string;
    soloAdmin?: boolean;
}

export interface GrupoNavegacion {
    titulo: string;
    items: ItemNavegacion[];
}

export const NAVEGACION: GrupoNavegacion[] = [
    {
        titulo: "General",
        items: [
            {
                titulo: "Inicio",
                url: "/inicio",
                icono: HouseIcon,
                descripcion: "Resumen del período y cumpleañeros del mes",
            },
        ],
    },
    {
        titulo: "Proceso de nómina",
        items: [
            {
                titulo: "Novedades",
                url: "/novedades",
                icono: ClipboardListIcon,
                descripcion: "Horas extras, comisiones y descuentos del período",
            },
            {
                titulo: "Nómina",
                url: "/nomina",
                icono: WalletIcon,
                descripcion: "Cálculo de anticipo, fin de mes y cierre",
            },
            {
                titulo: "Reportes",
                url: "/reportes",
                icono: BarChart3Icon,
                descripcion: "Consultas de IGSS, ISR, póliza y libro de salarios",
            },
        ],
    },
    {
        titulo: "Organización",
        items: [
            {
                titulo: "Empleados",
                url: "/empleados",
                icono: UsersIcon,
                descripcion: "Colaboradores activos y sus datos laborales",
            },
            {
                titulo: "Departamentos",
                url: "/departamentos",
                icono: Building2Icon,
                descripcion: "Áreas de la empresa y su cuenta contable",
            },
        ],
    },
    {
        titulo: "Configuración",
        items: [
            {
                titulo: "Períodos",
                url: "/periodos",
                icono: CalendarClockIcon,
                descripcion: "Calendario de pago y estado de cada período",
            },
            {
                titulo: "Conceptos",
                url: "/conceptos",
                icono: ListTreeIcon,
                descripcion: "Ingresos, descuentos, provisiones y su tratamiento fiscal",
            },
            {
                titulo: "Parámetros",
                url: "/parametros",
                icono: SlidersHorizontalIcon,
                descripcion: "Porcentajes y valores legales por año",
            },
            {
                titulo: "Usuarios",
                url: "/usuarios",
                icono: UserCogIcon,
                descripcion: "Accesos al sistema y roles",
                soloAdmin: true,
            },
        ],
    },
];

export const RUTA_INICIAL = "/inicio";

export function navegacionPorRol(esAdmin: boolean): GrupoNavegacion[] {
    return NAVEGACION.map((grupo) => ({
        ...grupo,
        items: grupo.items.filter((item) => esAdmin || !item.soloAdmin),
    })).filter((grupo) => grupo.items.length > 0);
}

export function buscarItem(pathname: string): ItemNavegacion | undefined {
    return NAVEGACION.flatMap((g) => g.items).find((item) =>
        pathname.startsWith(item.url),
    );
}

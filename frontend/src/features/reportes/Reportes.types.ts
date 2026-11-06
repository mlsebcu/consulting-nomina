export interface Cumpleaniero {
    empleadoId: number;
    codigoEmpleado: string;
    empleado: string;
    departamento: string;
    puesto: string;
    correoCorporativo: string;
    fechaNacimiento: string;
    dia: number;
    mesNacimiento: string;
    edad: number;
}

export interface FilaDescuento {
    anio: number;
    mes: string;
    numeroPeriodo: number;
    tipoPeriodo: string;
    codigoEmpleado: string;
    empleado: string;
    departamento: string;
    salarioBase: number;
    monto: number;
    fechaCalculo: string;
}

export interface FilaPoliza {
    cuentaContable: string;
    departamento: string;
    tipoMovimiento: "DEBE" | "HABER";
    concepto: string;
    debe: number;
    haber: number;
}

export interface FilaLibroSalarios {
    anio: number;
    mes: string;
    numeroPeriodo: number;
    tipoPeriodo: string;
    departamento: string;
    codigoEmpleado: string;
    empleado: string;
    puesto: string;
    salarioBase: number;
    diasLaborados: number;
    ingresos: number;
    egresos: number;
    provisiones: number;
    anticipo: number;
    liquido: number;
    estado: string;
}

export interface TotalDepartamento {
    departamento: string;
    totalEmpleados: number;
    totalIngresos: number;
    totalEgresos: number;
    totalProvisiones: number;
    totalAnticipo: number;
    totalLiquido: number;
}

export interface ReporteCumpleanieros {
    lista: Cumpleaniero[];
}

export interface ReporteDescuento {
    lista: FilaDescuento[];
    total: number;
}

export interface ReportePoliza {
    lista: FilaPoliza[];
    totales: { debe: number; haber: number; cuadra: boolean };
}

export interface ReporteLibroSalarios {
    lista: FilaLibroSalarios[];
    totales: TotalDepartamento[];
}

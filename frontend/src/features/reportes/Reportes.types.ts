// ============================================================
// CUMPLEAÑEROS
// ============================================================
export interface Cumpleaniero {
    EmpleadoId: number;
    CodigoEmpleado: string;
    Empleado: string;
    Departamento: string;
    Puesto: string;
    CorreoCorporativo: string;
    FechaNacimiento: string;
    Dia: number;
    MesNacimiento: string;
    Edad: number;
}

export interface ReporteCumpleanierosResponse {
    lista: Cumpleaniero[];
}

// ============================================================
// IGSS
// ============================================================
export interface FilaIGSS {
    Anio: number;
    Mes: string;
    NumeroPeriodo: number;
    TipoPeriodo: string;
    CodigoEmpleado: string;
    Empleado: string;
    Departamento: string;
    SalarioBase: number;
    MontoIGSS: number;
    FechaCalculo: string;
}

export interface ReporteIGSSResponse {
    lista: FilaIGSS[];
    total: { totalIGSS: number };
}

// ============================================================
// ISR
// ============================================================
export interface FilaISR {
    Anio: number;
    Mes: string;
    NumeroPeriodo: number;
    TipoPeriodo: string;
    CodigoEmpleado: string;
    Empleado: string;
    Departamento: string;
    SalarioBase: number;
    MontoISR: number;
    FechaCalculo: string;
}

export interface ReporteISRResponse {
    lista: FilaISR[];
    total: { totalISR: number };
}

// ============================================================
// PÓLIZA
// ============================================================
export interface FilaPoliza {
    CuentaContable: string;
    Departamento: string;
    TipoMovimiento: "DEBE" | "HABER";
    Concepto: string;
    Debe: number;
    Haber: number;
}

export interface ReportePolizaResponse {
    lista: FilaPoliza[];
    totales: {
        debe: number;
        haber: number;
        cuadra: boolean;
    };
}

// ============================================================
// LIBRO DE SALARIOS
// ============================================================
export interface FilaLibroSalarios {
    Anio: number;
    Mes: string;
    NumeroPeriodo: number;
    TipoPeriodo: string;
    Departamento: string;
    CodigoEmpleado: string;
    Empleado: string;
    Puesto: string;
    SalarioBase: number;
    DiasLaborados: number;
    Ingresos: number;
    Egresos: number;
    Provisiones: number;
    Anticipo: number;
    Liquido: number;
    Estado: string;
}

export interface TotalLibroSalarios {
    Departamento: string;
    TotalEmpleados: number;
    TotalIngresos: number;
    TotalEgresos: number;
    TotalProvisiones: number;
    TotalAnticipo: number;
    TotalLiquido: number;
}

export interface ReporteLibroSalariosResponse {
    lista: FilaLibroSalarios[];
    totales: TotalLibroSalarios[];
}

// ============================================================
// RECIBO
// ============================================================
export interface ReciboCabecera {
    NominaEmpleadoId: number;
    Anio: number;
    Mes: string;
    NumeroPeriodo: number;
    TipoPeriodo: string;
    FechaInicio: string;
    FechaFin: string;
    TipoNomina: string;
    CodigoEmpleado: string;
    Empleado: string;
    DPI: string;
    Puesto: string;
    Departamento: string;
    Banco: string;
    TipoCuenta: string;
    NumeroCuenta: string;
    TotalPercepciones: number;
    TotalDeducciones: number;
    TotalProvisiones: number;
    Anticipo: number;
    Liquido: number;
    Estado: string;
    FechaCalculo: string;
}

export interface ReciboDetalle {
    Orden: number;
    ConceptoCodigo: string;
    ConceptoNombre: string;
    NaturalezaCodigo: string;
    Monto: number;
}

export interface ReporteReciboResponse {
    cabecera: ReciboCabecera;
    detalle: ReciboDetalle[];
}

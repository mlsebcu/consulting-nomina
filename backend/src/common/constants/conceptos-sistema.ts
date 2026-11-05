// Códigos que el motor de cálculo (database/02_funciones.sql) reconoce por nombre.
export const CONCEPTO_SISTEMA = {
  SALARIO_BASE: '100',
  HORAS_EXTRAS: '101',
  HORAS_DOBLES: '102',
  BONIFICACION_DECRETO: '103',
  IGSS: '200',
  ISR: '201',
  ANTICIPO: '204',
  AGUINALDO: '300',
  BONO_14: '301',
} as const;

export const CONCEPTOS_POR_HORAS: readonly string[] = [
  CONCEPTO_SISTEMA.HORAS_EXTRAS,
  CONCEPTO_SISTEMA.HORAS_DOBLES,
];

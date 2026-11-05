import { mapRows } from './row-mapper';
import { SnakeNamingStrategy, toSnakeCase } from './snake-naming.strategy';

describe('SnakeNamingStrategy', () => {
  const strategy = new SnakeNamingStrategy();

  it.each([
    ['empleadoId', 'empleado_id'],
    ['totalPercepciones', 'total_percepciones'],
    ['dpi', 'dpi'],
  ])('convierte %s en %s', (entrada, esperado) => {
    expect(toSnakeCase(entrada)).toBe(esperado);
  });

  it('respeta el nombre explícito de la columna', () => {
    expect(strategy.columnName('fechaCreacion', 'creado_en', [])).toBe(
      'creado_en',
    );
  });

  it('usa el nombre de tabla declarado en la entidad', () => {
    expect(strategy.tableName('NominaEmpleado', 'nomina_empleado')).toBe(
      'nomina_empleado',
    );
    expect(strategy.tableName('NominaEmpleado', undefined)).toBe(
      'nomina_empleado',
    );
  });
});

describe('mapRows', () => {
  it('convierte las columnas devueltas por PostgreSQL a camelCase', () => {
    const [fila] = mapRows<{ codigoEmpleado: string; totalIgss: number }>([
      { codigo_empleado: 'EMP-001', total_igss: 120.5 },
    ]);
    expect(fila).toEqual({ codigoEmpleado: 'EMP-001', totalIgss: 120.5 });
  });
});

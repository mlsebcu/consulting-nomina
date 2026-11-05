import { DataSource } from 'typeorm';
import { NominaService } from '../nomina/nomina.service';
import { PeriodosService } from '../periodos/periodos.service';
import { ReportesService } from './reportes.service';

const PERIODO_ID = 2;

describe('ReportesService', () => {
  let service: ReportesService;
  let query: jest.Mock;

  beforeEach(() => {
    query = jest.fn();
    service = new ReportesService(
      { query } as unknown as DataSource,
      {
        findOne: jest.fn().mockResolvedValue({}),
      } as unknown as PeriodosService,
      {} as NominaService,
    );
  });

  it('la póliza cuadra cuando debe y haber coinciden al centavo', async () => {
    query.mockResolvedValue([
      {
        cuenta_contable: '5101-10',
        tipo_movimiento: 'DEBE',
        debe: 1000.1,
        haber: 0,
      },
      {
        cuenta_contable: '2101-01',
        tipo_movimiento: 'HABER',
        debe: 0,
        haber: 48.3,
      },
      {
        cuenta_contable: '2101-99',
        tipo_movimiento: 'HABER',
        debe: 0,
        haber: 951.8,
      },
    ]);

    const { totales } = await service.polizaContabilidad(PERIODO_ID);

    expect(totales).toEqual({ debe: 1000.1, haber: 1000.1, cuadra: true });
    expect(query).toHaveBeenCalledWith(
      'SELECT * FROM fn_poliza_contabilidad($1)',
      [PERIODO_ID],
    );
  });

  it('el libro de salarios agrupa totales por departamento', async () => {
    const fila = {
      ingresos: 100,
      egresos: 10,
      provisiones: 5,
      anticipo: 40,
      liquido: 50,
    };
    query.mockResolvedValue([
      { departamento: 'Finanzas', ...fila },
      { departamento: 'Finanzas', ...fila },
      { departamento: 'Mercadeo', ...fila },
    ]);

    const { totales } = await service.libroSalarios(PERIODO_ID);

    expect(totales).toEqual([
      expect.objectContaining({
        departamento: 'Finanzas',
        totalEmpleados: 2,
        totalLiquido: 100,
      }),
      expect.objectContaining({
        departamento: 'Mercadeo',
        totalEmpleados: 1,
        totalLiquido: 50,
      }),
    ]);
  });

  it('el listado de ISR filtra por el concepto de sistema 201', async () => {
    query.mockResolvedValue([{ monto: 265.14 }, { monto: 78.37 }]);

    const { total } = await service.listadoISR(PERIODO_ID);

    expect(total).toBe(343.51);
    expect(query).toHaveBeenCalledWith(
      'SELECT * FROM fn_listado_descuento($1, $2)',
      [PERIODO_ID, '201'],
    );
  });
});

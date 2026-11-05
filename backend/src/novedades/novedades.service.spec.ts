import { jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CONCEPTO_SISTEMA } from '../common/constants/conceptos-sistema.js';
import { EstadoPeriodo, TipoCalculo } from '../common/enums/nomina.enums.js';
import { ConceptosService } from '../conceptos/conceptos.service.js';
import { EmpleadosService } from '../empleados/empleados.service.js';
import { PeriodosService } from '../periodos/periodos.service.js';
import { Novedad } from './entities/novedad.entity.js';
import { modoCaptura, NovedadesService } from './novedades.service.js';

type FuncionMock = (...args: any[]) => any;

const USUARIO_ID = 1;

describe('modoCaptura', () => {
  it('las horas extras y dobles se capturan por cantidad', () => {
    expect(
      modoCaptura({
        codigo: CONCEPTO_SISTEMA.HORAS_EXTRAS,
        tipoCalculo: TipoCalculo.FORMULA,
      }),
    ).toBe('CANTIDAD');
    expect(
      modoCaptura({
        codigo: CONCEPTO_SISTEMA.HORAS_DOBLES,
        tipoCalculo: TipoCalculo.FORMULA,
      }),
    ).toBe('CANTIDAD');
  });

  it('los conceptos manuales se capturan por monto', () => {
    expect(
      modoCaptura({ codigo: '105', tipoCalculo: TipoCalculo.MANUAL }),
    ).toBe('MONTO');
  });

  it('IGSS e ISR no admiten novedades', () => {
    expect(
      modoCaptura({
        codigo: CONCEPTO_SISTEMA.IGSS,
        tipoCalculo: TipoCalculo.PORCENTAJE,
      }),
    ).toBeNull();
    expect(
      modoCaptura({
        codigo: CONCEPTO_SISTEMA.ISR,
        tipoCalculo: TipoCalculo.FORMULA,
      }),
    ).toBeNull();
  });
});

describe('NovedadesService.create', () => {
  let service: NovedadesService;
  let repo: jest.Mocked<Pick<Repository<Novedad>, 'create' | 'save'>>;
  let periodos: { findOne: jest.Mock<FuncionMock> };
  let conceptos: { findOneConcepto: jest.Mock<FuncionMock> };

  beforeEach(() => {
    repo = {
      create: jest.fn<FuncionMock>((dto) => dto as Novedad),
      save: jest.fn<FuncionMock>((entidad) =>
        Promise.resolve(entidad as Novedad),
      ),
    } as never;
    periodos = {
      findOne: jest
        .fn<FuncionMock>()
        .mockResolvedValue({ estado: EstadoPeriodo.ABIERTO }),
    };
    conceptos = { findOneConcepto: jest.fn<FuncionMock>() };

    service = new NovedadesService(
      repo as unknown as Repository<Novedad>,
      periodos as unknown as PeriodosService,
      {
        findOne: jest.fn<FuncionMock>().mockResolvedValue({}),
      } as unknown as EmpleadosService,
      conceptos as unknown as ConceptosService,
    );
  });

  it('guarda solo la cantidad para horas extras aunque se envíe monto', async () => {
    conceptos.findOneConcepto.mockResolvedValue({
      nombre: 'Horas Extras',
      codigo: CONCEPTO_SISTEMA.HORAS_EXTRAS,
      tipoCalculo: TipoCalculo.FORMULA,
    });

    const novedad = await service.create(
      { empleadoId: 1, periodoId: 1, conceptoId: 2, cantidad: 6, monto: 999 },
      USUARIO_ID,
    );

    expect(novedad).toMatchObject({
      cantidad: 6,
      monto: null,
      creadoPor: USUARIO_ID,
    });
  });

  it('exige monto en conceptos manuales', async () => {
    conceptos.findOneConcepto.mockResolvedValue({
      nombre: 'Comisiones',
      codigo: '105',
      tipoCalculo: TipoCalculo.MANUAL,
    });

    await expect(
      service.create(
        { empleadoId: 1, periodoId: 1, conceptoId: 6, cantidad: 3 },
        USUARIO_ID,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rechaza novedades en un período cerrado', async () => {
    periodos.findOne.mockResolvedValue({ estado: EstadoPeriodo.CERRADO });

    await expect(
      service.create(
        { empleadoId: 1, periodoId: 1, conceptoId: 6, monto: 100 },
        USUARIO_ID,
      ),
    ).rejects.toThrow('período cerrado');
    expect(repo.save).not.toHaveBeenCalled();
  });
});

import { jest } from '@jest/globals';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TipoDatoParametro } from '../common/enums/nomina.enums.js';
import { Parametro } from './entities/parametro.entity.js';
import { ParametrosService } from './parametros.service.js';

type FuncionMock = (...args: any[]) => any;

const USUARIO_ID = 1;

describe('ParametrosService', () => {
  let service: ParametrosService;
  let repo: {
    findOne: jest.Mock<FuncionMock>;
    save: jest.Mock<FuncionMock>;
    count: jest.Mock<FuncionMock>;
  };

  beforeEach(() => {
    repo = {
      findOne: jest.fn<FuncionMock>(),
      save: jest.fn<FuncionMock>((p: Parametro) => Promise.resolve(p)),
      count: jest.fn<FuncionMock>(),
    };
    service = new ParametrosService(repo as unknown as Repository<Parametro>);
  });

  it('rechaza un valor no numérico en un parámetro numérico', async () => {
    repo.findOne.mockResolvedValue({
      codigo: 'IGSS_LABORAL_PORCENTAJE',
      tipoDato: TipoDatoParametro.NUMERO,
    });

    await expect(
      service.update(1, { valor: '4,83' }, USUARIO_ID),
    ).rejects.toThrow(BadRequestException);
  });

  it('acepta texto en parámetros de tipo TEXTO', async () => {
    repo.findOne.mockResolvedValue({
      codigo: 'CUENTA_SUELDOS_POR_PAGAR',
      tipoDato: TipoDatoParametro.TEXTO,
    });

    const actualizado = await service.update(
      1,
      { valor: ' 2101-98 ' },
      USUARIO_ID,
    );

    expect(actualizado).toMatchObject({
      valor: '2101-98',
      modificadoPor: USUARIO_ID,
    });
  });

  it('no copia sobre un año que ya tiene parámetros', async () => {
    repo.count.mockResolvedValue(15);

    await expect(
      service.copiar({ anioOrigen: 2026, anioDestino: 2027 }, USUARIO_ID),
    ).rejects.toThrow(ConflictException);
  });
});

import { ConflictException } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { DepartamentosService } from '../departamentos/departamentos.service';
import { EmpleadosService } from './empleados.service';
import { Empleado } from './entities/empleado.entity';

const USUARIO_ID = 1;
const EMPLEADO_ID = 7;

describe('EmpleadosService.update', () => {
  let service: EmpleadosService;
  let repo: { findOne: jest.Mock; exists: jest.Mock; save: jest.Mock };

  beforeEach(() => {
    repo = {
      findOne: jest.fn().mockResolvedValue({
        empleadoId: EMPLEADO_ID,
        codigoEmpleado: 'EMP-007',
        dpi: '1000000000707',
        departamentoId: 1,
      }),
      exists: jest.fn().mockResolvedValue(false),
      save: jest.fn((e: Empleado) => Promise.resolve(e)),
    };
    service = new EmpleadosService(
      repo as unknown as Repository<Empleado>,
      { findOne: jest.fn() } as unknown as DepartamentosService,
    );
  });

  it('permite guardar sin cambios de código ni DPI', async () => {
    await service.update(
      EMPLEADO_ID,
      { codigoEmpleado: 'EMP-007', dpi: '1000000000707', puesto: 'Gerente' },
      USUARIO_ID,
    );

    expect(repo.exists).toHaveBeenCalledWith({
      where: expect.objectContaining({
        empleadoId: Not(EMPLEADO_ID),
      }) as unknown,
    });
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ puesto: 'Gerente', modificadoPor: USUARIO_ID }),
    );
  });

  it('rechaza un código que ya usa otro empleado', async () => {
    repo.exists.mockResolvedValueOnce(true);

    await expect(
      service.update(EMPLEADO_ID, { codigoEmpleado: 'EMP-001' }, USUARIO_ID),
    ).rejects.toThrow(ConflictException);
    expect(repo.save).not.toHaveBeenCalled();
  });
});

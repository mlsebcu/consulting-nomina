import { jest } from '@jest/globals';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Usuario } from '../auth/usuario.entity.js';
import { Rol } from '../common/enums/rol.enum.js';
import { UsuariosService } from './usuarios.service.js';

type FuncionMock = (...args: any[]) => any;

const ADMIN_ID = 1;

describe('UsuariosService', () => {
  let service: UsuariosService;
  let repo: {
    exists: jest.Mock<FuncionMock>;
    findOne: jest.Mock<FuncionMock>;
    save: jest.Mock<FuncionMock>;
    create: jest.Mock<FuncionMock>;
  };

  beforeEach(() => {
    repo = {
      exists: jest.fn<FuncionMock>().mockResolvedValue(false),
      findOne: jest
        .fn<FuncionMock>()
        .mockResolvedValue({ usuarioId: ADMIN_ID, rol: Rol.ADMIN }),
      save: jest.fn<FuncionMock>((u: Usuario) =>
        Promise.resolve({ ...u, usuarioId: 2 }),
      ),
      create: jest.fn<FuncionMock>((u: Partial<Usuario>) => u),
    };
    service = new UsuariosService(repo as unknown as Repository<Usuario>);
  });

  it('guarda la contraseña como hash bcrypt', async () => {
    await service.create(
      {
        nombreUsuario: 'rrhh01',
        rol: Rol.RRHH,
        password: 'Segura123',
        nombreCompleto: 'Recursos Humanos',
      },
      ADMIN_ID,
    );

    const guardado = repo.create.mock.calls[0][0] as Partial<Usuario>;
    expect(guardado.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(guardado.passwordHash).not.toContain('Segura123');
  });

  it('rechaza un nombre de usuario existente', async () => {
    repo.exists.mockResolvedValue(true);

    await expect(
      service.create(
        {
          nombreUsuario: 'admin',
          nombreCompleto: 'Administrador',
          rol: Rol.ADMIN,
          password: 'Segura123',
        },
        ADMIN_ID,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('impide que un administrador se desactive a sí mismo', async () => {
    await expect(
      service.update(ADMIN_ID, { activo: false }, ADMIN_ID),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.update(ADMIN_ID, { rol: Rol.RRHH }, ADMIN_ID),
    ).rejects.toThrow(BadRequestException);
  });
});

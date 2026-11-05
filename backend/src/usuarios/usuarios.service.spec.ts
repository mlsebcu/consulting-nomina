import { BadRequestException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Usuario } from '../auth/usuario.entity';
import { Rol } from '../common/enums/rol.enum';
import { UsuariosService } from './usuarios.service';

const ADMIN_ID = 1;

describe('UsuariosService', () => {
  let service: UsuariosService;
  let repo: {
    exists: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
  };

  beforeEach(() => {
    repo = {
      exists: jest.fn().mockResolvedValue(false),
      findOne: jest
        .fn()
        .mockResolvedValue({ usuarioId: ADMIN_ID, rol: Rol.ADMIN }),
      save: jest.fn((u: Usuario) => Promise.resolve({ usuarioId: 2, ...u })),
      create: jest.fn((u: Partial<Usuario>) => u),
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

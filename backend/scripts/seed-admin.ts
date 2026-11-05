import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import {
  BCRYPT_SALT_ROUNDS,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../src/auth/auth.constants';
import { Usuario } from '../src/auth/usuario.entity';
import { Rol } from '../src/common/enums/rol.enum';
import { ConceptoReglaFiscal } from '../src/conceptos/entities/concepto-regla-fiscal.entity';
import { Concepto } from '../src/conceptos/entities/concepto.entity';
import { NaturalezaConcepto } from '../src/conceptos/entities/naturaleza-concepto.entity';
import { buildDataSourceOptions } from '../src/database/database.config';
import { Departamento } from '../src/departamentos/entities/departamento.entity';
import { Empleado } from '../src/empleados/entities/empleado.entity';

function leerVariable(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Defina la variable de entorno ${nombre}`);
  }
  return valor;
}

async function seedAdmin() {
  const nombreUsuario = leerVariable('ADMIN_USERNAME');
  const password = leerVariable('ADMIN_PASSWORD');

  if (
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    throw new Error(
      `ADMIN_PASSWORD debe tener entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres`,
    );
  }

  const dataSource = new DataSource({
    ...buildDataSourceOptions(process.env),
    entities: [
      Usuario,
      Empleado,
      Departamento,
      Concepto,
      NaturalezaConcepto,
      ConceptoReglaFiscal,
    ],
  });
  await dataSource.initialize();

  try {
    const repo = dataSource.getRepository(Usuario);
    if (await repo.exists({ where: { nombreUsuario } })) {
      console.log(`El usuario ${nombreUsuario} ya existe`);
      return;
    }

    await repo.save(
      repo.create({
        nombreUsuario,
        passwordHash: await bcrypt.hash(password, BCRYPT_SALT_ROUNDS),
        rol: Rol.ADMIN,
      }),
    );
    console.log(`Usuario ${nombreUsuario} creado`);
  } finally {
    await dataSource.destroy();
  }
}

seedAdmin().catch((error: Error) => {
  console.error(error.message);
  process.exit(1);
});

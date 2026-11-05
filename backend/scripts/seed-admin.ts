import 'dotenv/config';
import bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import {
  BCRYPT_SALT_ROUNDS,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../src/auth/auth.constants.js';
import { Usuario } from '../src/auth/usuario.entity.js';
import { Rol } from '../src/common/enums/rol.enum.js';
import { ConceptoReglaFiscal } from '../src/conceptos/entities/concepto-regla-fiscal.entity.js';
import { Concepto } from '../src/conceptos/entities/concepto.entity.js';
import { NaturalezaConcepto } from '../src/conceptos/entities/naturaleza-concepto.entity.js';
import { buildDataSourceOptions } from '../src/database/database.config.js';
import { Departamento } from '../src/departamentos/entities/departamento.entity.js';
import { Empleado } from '../src/empleados/entities/empleado.entity.js';

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
  const nombreCompleto = leerVariable('ADMIN_NOMBRE');

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
        nombreCompleto,
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

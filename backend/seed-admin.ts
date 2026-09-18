// Ejecutar una sola vez: npx ts-node seed-admin.ts
import 'dotenv/config';

import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Usuario } from './src/auth/usuario.entity';
import { Empleado } from './src/empleados/entities/empleado.entity';
import { Departamento } from './src/departamentos/entities/departamento.entity';

async function seedAdmin() {
  const dataSource = new DataSource({
    type: 'mssql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    },

    entities: [Usuario, Empleado, Departamento],
  });

  await dataSource.initialize();

  const passwordHash = await bcrypt.hash('Umg2026!', 10);

  const repo = dataSource.getRepository(Usuario);
  const existe = await repo.findOne({ where: { nombreUsuario: 'admin' } });

  if (!existe) {
    await repo.save({
      nombreUsuario: 'admin',
      passwordHash,
      rol: 'ADMIN',
      empleadoId: null,
      activo: true,
      fechaCreacion: new Date(),
      fechaModificacion: null,
      creadoPor: null,
      modificadoPor: null,
      eliminadoPor: null,
      fechaEliminacion: null,
    });
    console.log('Usuario admin creado. Cambiar contraseña por defecto.');
  } else {
    console.log('El usuario admin ya existe, no se creó de nuevo.');
  }

  await dataSource.destroy();
}

seedAdmin().catch(console.error);
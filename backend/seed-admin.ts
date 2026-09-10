// Ejecutar una sola vez: npx ts-node seed-admin.ts
// (ajusta la ruta de conexión según tu configuración real de TypeORM/DataSource)
import 'dotenv/config';

import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Usuario } from './src/auth/usuario.entity';

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
    
    entities: [Usuario],
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
      activo: true,
    });
    console.log('Usuario admin creado. Cambiar contraseña por defecto.');
  } else {
    console.log('El usuario admin ya existe, no se creó de nuevo.');
  }

  await dataSource.destroy();
}

seedAdmin().catch(console.error);

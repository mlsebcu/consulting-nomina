import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { cabecerasSeguridad } from './common/middleware/cabeceras-seguridad.middleware.js';
import { DatabaseExceptionFilter } from './database/database-exception.filter.js';

const PUERTO_POR_DEFECTO = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const esProduccion = config.get('NODE_ENV') === 'production';

  app.use(cabecerasSeguridad);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new DatabaseExceptionFilter());
  app.enableCors({
    origin: config
      .getOrThrow<string>('CORS_ORIGINS')
      .split(',')
      .map((origen) => origen.trim()),
  });
  app.enableShutdownHooks();

  if (!esProduccion) {
    const documento = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('API Nómina - Consulting, S.A.')
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('docs', app, documento);
  }

  await app.listen(config.get<number>('PORT') ?? PUERTO_POR_DEFECTO);
}

void bootstrap();

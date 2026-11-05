import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DatabaseExceptionFilter } from './database/database-exception.filter';

const PUERTO_POR_DEFECTO = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const esProduccion = config.get('NODE_ENV') === 'production';

  // Swagger UI usa scripts en línea, solo disponible fuera de producción
  app.use(helmet({ contentSecurityPolicy: esProduccion ? undefined : false }));
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

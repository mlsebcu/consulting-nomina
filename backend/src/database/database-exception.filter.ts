import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { QueryFailedError } from 'typeorm';

// Códigos SQLSTATE de PostgreSQL
const PG_RAISE_EXCEPTION = 'P0001';
const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_CHECK_VIOLATION = '23514';

interface PgDriverError {
  code?: string;
  message?: string;
}

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const driverError = exception.driverError as PgDriverError;
    const { status, message } = this.traducir(driverError);

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({ statusCode: status, message });
  }

  private traducir(error: PgDriverError): { status: number; message: string } {
    switch (error.code) {
      case PG_RAISE_EXCEPTION:
        return {
          status: HttpStatus.BAD_REQUEST,
          message: error.message ?? 'Operación no permitida',
        };
      case PG_UNIQUE_VIOLATION:
        return {
          status: HttpStatus.CONFLICT,
          message: 'Ya existe un registro con esos datos',
        };
      case PG_FOREIGN_KEY_VIOLATION:
        return {
          status: HttpStatus.CONFLICT,
          message: 'El registro está relacionado con otros datos',
        };
      case PG_CHECK_VIOLATION:
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Los datos no cumplen las reglas de validación',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error interno del servidor',
        };
    }
  }
}

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CONCEPTO_SISTEMA } from '../common/constants/conceptos-sistema';
import { mapRows } from '../database/row-mapper';
import { NominaService } from '../nomina/nomina.service';
import { PeriodosService } from '../periodos/periodos.service';
import type {
  Cumpleaniero,
  FilaDescuento,
  FilaLibroSalarios,
  FilaPoliza,
  TotalDepartamento,
} from './reportes.types';

const CENTAVOS = 100;

function redondear(valor: number): number {
  return Math.round(valor * CENTAVOS) / CENTAVOS;
}

function sumar<T>(filas: T[], campo: (fila: T) => number): number {
  return redondear(filas.reduce((total, fila) => total + campo(fila), 0));
}

@Injectable()
export class ReportesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly periodosService: PeriodosService,
    private readonly nominaService: NominaService,
  ) {}

  async listadoCumpleanieros(mes: number) {
    const lista = await this.consultar<Cumpleaniero>(
      'fn_listado_cumpleanieros',
      mes,
    );
    return { lista };
  }

  async listadoIGSS(periodoId: number) {
    return this.listadoDescuento(periodoId, CONCEPTO_SISTEMA.IGSS);
  }

  async listadoISR(periodoId: number) {
    return this.listadoDescuento(periodoId, CONCEPTO_SISTEMA.ISR);
  }

  async polizaContabilidad(periodoId: number) {
    await this.periodosService.findOne(periodoId);
    const lista = await this.consultar<FilaPoliza>(
      'fn_poliza_contabilidad',
      periodoId,
    );
    const debe = sumar(lista, (f) => f.debe);
    const haber = sumar(lista, (f) => f.haber);

    return { lista, totales: { debe, haber, cuadra: debe === haber } };
  }

  async libroSalarios(periodoId: number) {
    await this.periodosService.findOne(periodoId);
    const lista = await this.consultar<FilaLibroSalarios>(
      'fn_libro_salarios',
      periodoId,
    );

    const porDepartamento = new Map<string, FilaLibroSalarios[]>();
    for (const fila of lista) {
      porDepartamento.set(fila.departamento, [
        ...(porDepartamento.get(fila.departamento) ?? []),
        fila,
      ]);
    }

    const totales: TotalDepartamento[] = [...porDepartamento.entries()].map(
      ([departamento, filas]) => ({
        departamento,
        totalEmpleados: filas.length,
        totalIngresos: sumar(filas, (f) => f.ingresos),
        totalEgresos: sumar(filas, (f) => f.egresos),
        totalProvisiones: sumar(filas, (f) => f.provisiones),
        totalAnticipo: sumar(filas, (f) => f.anticipo),
        totalLiquido: sumar(filas, (f) => f.liquido),
      }),
    );

    return { lista, totales };
  }

  reciboNomina(nominaEmpleadoId: number) {
    return this.nominaService.obtenerUna(nominaEmpleadoId);
  }

  private async listadoDescuento(periodoId: number, conceptoCodigo: string) {
    await this.periodosService.findOne(periodoId);
    const lista = await this.consultar<FilaDescuento>(
      'fn_listado_descuento',
      periodoId,
      conceptoCodigo,
    );
    return { lista, total: sumar(lista, (f) => f.monto) };
  }

  private async consultar<T>(
    funcion: string,
    ...parametros: (number | string)[]
  ) {
    const placeholders = parametros.map((_, i) => `$${i + 1}`).join(', ');
    const filas = await this.dataSource.query<Record<string, unknown>[]>(
      `SELECT * FROM ${funcion}(${placeholders})`,
      parametros,
    );
    return mapRows<T>(filas);
  }
}

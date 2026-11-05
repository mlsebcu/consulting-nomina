import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Public } from './common/decorators/public.decorator.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @Get()
  async check() {
    await this.dataSource.query('SELECT 1');
    return { status: 'ok' };
  }
}

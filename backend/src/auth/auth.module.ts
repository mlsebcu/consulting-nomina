import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { Usuario } from './usuario.entity';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '8h' }, // sesión de trabajo, no de días
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // Esto aplica JWT a TODA la app
    { provide: APP_GUARD, useClass: RolesGuard}     // Esto aplica roles a TODA la app
  ],
})
export class AuthModule { }

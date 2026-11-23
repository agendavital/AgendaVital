import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard } from './JwtAuthGuard';
import { RolesGuard } from './roles.guard';
import { PermissionsGuard } from './permissions.guard';

@Module({
  imports: [PrismaModule, ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }])],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard, PermissionsGuard],
  exports: [JwtAuthGuard, RolesGuard, PermissionsGuard, AuthService],
})
export class AuthModule {}

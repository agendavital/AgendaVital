import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [PrismaModule, ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

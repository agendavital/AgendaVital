import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { HorariosController } from './controllers/horarios.controller';
import { HorariosService } from './services/horarios.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [HorariosController],
  providers: [HorariosService],
})
export class HorariosModule {}

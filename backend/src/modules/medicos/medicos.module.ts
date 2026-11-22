import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { MedicosController } from './controllers/medicos.controller';
import { MedicosService } from './services/medicos.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [MedicosController],
  providers: [MedicosService],
})
export class MedicosModule {}

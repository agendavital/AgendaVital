import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { EvaluacionesController } from './controllers/evaluaciones.controller';
import { EvaluacionesService } from './services/evaluaciones.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [EvaluacionesController],
  providers: [EvaluacionesService],
})
export class EvaluacionesModule {}

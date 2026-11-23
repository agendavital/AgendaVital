import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { ReportesController } from './controllers/reportes.controller';
import { ReportesService } from './services/reportes.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}

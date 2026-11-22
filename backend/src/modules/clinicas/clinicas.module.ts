import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { ClinicasController } from './controllers/clinicas.controller';
import { ClinicasService } from './services/clinicas.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [ClinicasController],
  providers: [ClinicasService],
})
export class ClinicasModule {}

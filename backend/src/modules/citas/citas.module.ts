import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { CitasController } from './controllers/citas.controller';
import { CitasService } from './services/citas.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [CitasController],
  providers: [CitasService],
})
export class CitasModule {}

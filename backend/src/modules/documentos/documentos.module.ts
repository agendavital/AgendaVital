import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { DocumentosController } from './controllers/documentos.controller';
import { DocumentosService } from './services/documentos.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [DocumentosController],
  providers: [DocumentosService],
})
export class DocumentosModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { NotificacionesController } from './controllers/notificaciones.controller';
import { NotificacionesService } from './services/notificaciones.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [NotificacionesController],
  providers: [NotificacionesService],
})
export class NotificacionesModule {}

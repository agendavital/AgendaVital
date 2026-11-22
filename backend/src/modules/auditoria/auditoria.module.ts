import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditoriaController } from './controllers/auditoria.controller';
import { AuditoriaInterceptor } from './interceptors/auditoria.interceptor';
import { AuditoriaService } from './services/auditoria.service';

@Module({
  controllers: [AuditoriaController],
  providers: [
    AuditoriaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditoriaInterceptor,
    },
  ],
})
export class AuditoriaModule {}

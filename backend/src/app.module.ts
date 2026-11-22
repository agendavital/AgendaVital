import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { ProcessesModule } from './modules/processes/processes.module';
import { ExamRequestsModule } from './modules/exam-requests/exam-requests.module';
import { CitasModule } from './modules/citas/citas.module';
import { ClinicasModule } from './modules/clinicas/clinicas.module';
import { HorariosModule } from './modules/horarios/horarios.module';
import { MedicosModule } from './modules/medicos/medicos.module';
import { EvaluacionesModule } from './modules/evaluaciones/evaluaciones.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CandidatesModule,
    ProcessesModule,
    ExamRequestsModule,
    CitasModule,
    ClinicasModule,
    HorariosModule,
    MedicosModule,
    EvaluacionesModule,
    AuditoriaModule,
    NotificacionesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

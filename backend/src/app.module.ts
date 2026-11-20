import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { ProcessesModule } from './modules/processes/processes.module';
import { ExamRequestsModule } from './modules/exam-requests/exam-requests.module';
import { CitasModule } from './modules/citas/citas.module';

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
  ],
  controllers: [AppController],
})
export class AppModule {}

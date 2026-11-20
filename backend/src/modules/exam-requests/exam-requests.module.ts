import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { ExamRequestsController } from './controllers/exam-requests.controller';
import { ExamRequestsService } from './services/exam-requests.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [ExamRequestsController],
  providers: [ExamRequestsService],
})
export class ExamRequestsModule {}

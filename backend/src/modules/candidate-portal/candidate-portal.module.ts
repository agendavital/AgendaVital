import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { CandidatePortalController } from './controllers/candidate-portal.controller';
import { CandidatePortalService } from './services/candidate-portal.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [CandidatePortalController],
  providers: [CandidatePortalService],
})
export class CandidatePortalModule {}

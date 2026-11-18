import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { CandidatesController } from './controllers/candidates.controller';
import { CandidatesService } from './services/candidates.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [CandidatesController],
  providers: [CandidatesService],
})
export class CandidatesModule {}

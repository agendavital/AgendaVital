import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { ProcessesController } from './controllers/processes.controller';
import { ProcessesService } from './services/processes.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [ProcessesController],
  providers: [ProcessesService],
})
export class ProcessesModule {}

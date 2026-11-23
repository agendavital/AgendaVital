import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { AccessControlController } from './controllers/access-control.controller';
import { AccessControlService } from './services/access-control.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [AccessControlController],
  providers: [AccessControlService],
})
export class AccessControlModule {}

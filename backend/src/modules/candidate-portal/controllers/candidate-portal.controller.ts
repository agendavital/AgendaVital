import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { Permissions } from '../../../auth/permissions.decorator';
import { PermissionsGuard } from '../../../auth/permissions.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { CandidatePortalService } from '../services/candidate-portal.service';

type AuthenticatedRequest = Request & { user: { sub: number } };

@Controller('candidate-portal')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class CandidatePortalController {
  constructor(private readonly service: CandidatePortalService) {}

  @Get()
  @Permissions('candidate-portal:read')
  getMyProcess(@Req() request: AuthenticatedRequest) {
    return this.service.getMyProcess(request.user.sub);
  }
}

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Permissions } from '../../../auth/permissions.decorator';
import { PermissionsGuard } from '../../../auth/permissions.guard';
import { ReportesService } from '../services/reportes.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('summary')
  @Permissions('reports:read')
  getSummary(
    @Req() request: Request & { user: { sub: number; role: string } },
  ) {
    return this.reportesService.getSummary(request.user.sub, request.user.role);
  }
}

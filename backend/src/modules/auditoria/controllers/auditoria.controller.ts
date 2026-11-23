import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Permissions } from '../../../auth/permissions.decorator';
import { PermissionsGuard } from '../../../auth/permissions.guard';
import { AuditoriaService } from '../services/auditoria.service';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @Permissions('audit:read')
  findAll() {
    return this.auditoriaService.findAll();
  }
}

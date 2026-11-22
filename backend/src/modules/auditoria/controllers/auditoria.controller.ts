import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { AuditoriaService } from '../services/auditoria.service';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  findAll() {
    return this.auditoriaService.findAll();
  }
}

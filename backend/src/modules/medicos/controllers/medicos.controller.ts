import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Permissions } from '../../../auth/permissions.decorator';
import { PermissionsGuard } from '../../../auth/permissions.guard';
import { CreateMedicoDto } from '../dto/create-medico.dto';
import { MedicoListItemDto } from '../dto/medico-list-item.dto';
import { MedicosService } from '../services/medicos.service';

@Controller('medical-staff')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Get()
  @Permissions('medical-staff:manage')
  findAll(): Promise<MedicoListItemDto[]> {
    return this.medicosService.findAll();
  }

  @Get('options')
  @Permissions('medical-staff:manage')
  getFormOptions() {
    return this.medicosService.getFormOptions();
  }

  @Post()
  @Permissions('medical-staff:manage')
  create(@Body() body: CreateMedicoDto) {
    return this.medicosService.create(body);
  }
}

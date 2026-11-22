import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { CreateMedicoDto } from '../dto/create-medico.dto';
import { MedicoListItemDto } from '../dto/medico-list-item.dto';
import { MedicosService } from '../services/medicos.service';

@Controller('medical-staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Get()
  findAll(): Promise<MedicoListItemDto[]> {
    return this.medicosService.findAll();
  }

  @Get('options')
  getFormOptions() {
    return this.medicosService.getFormOptions();
  }

  @Post()
  create(@Body() body: CreateMedicoDto) {
    return this.medicosService.create(body);
  }
}

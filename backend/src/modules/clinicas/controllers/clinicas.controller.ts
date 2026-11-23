import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Permissions } from '../../../auth/permissions.decorator';
import { PermissionsGuard } from '../../../auth/permissions.guard';
import { ClinicaListItemDto } from '../dto/clinica-list-item.dto';
import { CreateClinicaDto } from '../dto/create-clinica.dto';
import { UpdateClinicaStatusDto } from '../dto/update-clinica-status.dto';
import { ClinicasService } from '../services/clinicas.service';

@Controller('clinics')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ClinicasController {
  constructor(private readonly clinicasService: ClinicasService) {}

  @Get()
  @Permissions('clinic-management:manage')
  findAll(): Promise<ClinicaListItemDto[]> {
    return this.clinicasService.findAll();
  }

  @Post()
  @Permissions('clinic-management:manage')
  create(@Body() body: CreateClinicaDto): Promise<ClinicaListItemDto> {
    return this.clinicasService.create(body);
  }

  @Patch(':id/status')
  @Permissions('clinic-management:manage')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateClinicaStatusDto,
  ): Promise<ClinicaListItemDto> {
    return this.clinicasService.updateStatus(id, body);
  }
}

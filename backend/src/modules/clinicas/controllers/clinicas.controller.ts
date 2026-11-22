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
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { ClinicaListItemDto } from '../dto/clinica-list-item.dto';
import { CreateClinicaDto } from '../dto/create-clinica.dto';
import { UpdateClinicaStatusDto } from '../dto/update-clinica-status.dto';
import { ClinicasService } from '../services/clinicas.service';

@Controller('clinics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ClinicasController {
  constructor(private readonly clinicasService: ClinicasService) {}

  @Get()
  findAll(): Promise<ClinicaListItemDto[]> {
    return this.clinicasService.findAll();
  }

  @Post()
  create(@Body() body: CreateClinicaDto): Promise<ClinicaListItemDto> {
    return this.clinicasService.create(body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateClinicaStatusDto,
  ): Promise<ClinicaListItemDto> {
    return this.clinicasService.updateStatus(id, body);
  }
}

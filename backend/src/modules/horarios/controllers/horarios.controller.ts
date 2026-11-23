import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Permissions } from '../../../auth/permissions.decorator';
import { PermissionsGuard } from '../../../auth/permissions.guard';
import { CancelDisponibilidadDto } from '../dto/cancel-disponibilidad.dto';
import { CreateDisponibilidadDto } from '../dto/create-disponibilidad.dto';
import { DisponibilidadListItemDto } from '../dto/disponibilidad-list-item.dto';
import { HorariosService } from '../services/horarios.service';

@Controller('availability-management')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @Get()
  @Permissions('clinic-management:manage')
  findUpcoming(): Promise<DisponibilidadListItemDto[]> {
    return this.horariosService.findUpcoming();
  }

  @Post()
  @Permissions('clinic-management:manage')
  create(
    @Body() body: CreateDisponibilidadDto,
  ): Promise<DisponibilidadListItemDto> {
    return this.horariosService.create(body);
  }

  @Patch(':id/cancel')
  @Permissions('clinic-management:manage')
  cancel(@Param() params: CancelDisponibilidadDto): Promise<void> {
    return this.horariosService.cancel(params);
  }
}

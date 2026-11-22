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
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { CancelDisponibilidadDto } from '../dto/cancel-disponibilidad.dto';
import { CreateDisponibilidadDto } from '../dto/create-disponibilidad.dto';
import { DisponibilidadListItemDto } from '../dto/disponibilidad-list-item.dto';
import { HorariosService } from '../services/horarios.service';

@Controller('availability-management')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @Get()
  findUpcoming(): Promise<DisponibilidadListItemDto[]> {
    return this.horariosService.findUpcoming();
  }

  @Post()
  create(
    @Body() body: CreateDisponibilidadDto,
  ): Promise<DisponibilidadListItemDto> {
    return this.horariosService.create(body);
  }

  @Patch(':id/cancel')
  cancel(@Param() params: CancelDisponibilidadDto): Promise<void> {
    return this.horariosService.cancel(params);
  }
}

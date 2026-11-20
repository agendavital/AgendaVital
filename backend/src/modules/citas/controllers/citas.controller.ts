import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { AvailabilityQueryDto } from '../dto/availability-query.dto';
import { AppointmentListItemDto } from '../dto/appointment-list-item.dto';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { CitasService } from '../services/citas.service';

type AuthenticatedRequest = Request & {
  user: { sub: number };
};

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'HR')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Get()
  findAll(): Promise<AppointmentListItemDto[]> {
    return this.citasService.findAll();
  }

  @Get('options')
  getFormOptions() {
    return this.citasService.getFormOptions();
  }

  @Get('availability')
  getAvailability(@Query() query: AvailabilityQueryDto) {
    return this.citasService.getAvailability(query);
  }

  @Post()
  create(
    @Body() body: CreateAppointmentDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<AppointmentListItemDto> {
    return this.citasService.create(body, request.user.sub);
  }
}

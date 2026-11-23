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
import { RolesGuard } from '../../../auth/roles.guard';
import { Permissions } from '../../../auth/permissions.decorator';
import { PermissionsGuard } from '../../../auth/permissions.guard';
import { AvailabilityQueryDto } from '../dto/availability-query.dto';
import { AppointmentListItemDto } from '../dto/appointment-list-item.dto';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { CitasService } from '../services/citas.service';

type AuthenticatedRequest = Request & {
  user: { sub: number; role: string };
};

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Get()
  @Permissions('appointments:read')
  findAll(
    @Req() request: AuthenticatedRequest,
  ): Promise<AppointmentListItemDto[]> {
    return this.citasService.findAll(request.user.sub, request.user.role);
  }

  @Get('options')
  @Permissions('appointments:create')
  getFormOptions(@Req() request: AuthenticatedRequest) {
    return this.citasService.getFormOptions(
      request.user.sub,
      request.user.role,
    );
  }

  @Get('availability')
  @Permissions('appointments:create')
  getAvailability(
    @Query() query: AvailabilityQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.citasService.getAvailability(query, request.user.role);
  }

  @Post()
  @Permissions('appointments:create')
  create(
    @Body() body: CreateAppointmentDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<AppointmentListItemDto> {
    return this.citasService.create(body, request.user.sub, request.user.role);
  }
}

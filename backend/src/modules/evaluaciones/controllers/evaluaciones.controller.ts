import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Permissions } from '../../../auth/permissions.decorator';
import { PermissionsGuard } from '../../../auth/permissions.guard';
import { CreateEvaluacionDto } from '../dto/create-evaluacion.dto';
import { EvaluacionListItemDto } from '../dto/evaluacion-list-item.dto';
import { WorkplaceProfileReceiptResultDto } from '../dto/workplace-profile-receipt-result.dto';
import { EvaluacionesService } from '../services/evaluaciones.service';

type AuthenticatedRequest = Request & {
  user: { sub: number; role: string };
};

@Controller('medical-results')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  @Get()
  @Permissions('medical-results:read')
  findAll(
    @Req() request: AuthenticatedRequest,
  ): Promise<EvaluacionListItemDto[]> {
    return this.evaluacionesService.findAll(request.user.sub);
  }

  @Get('options')
  @Permissions('medical-results:create')
  getFormOptions(@Req() request: AuthenticatedRequest) {
    return this.evaluacionesService.getFormOptions(request.user.sub);
  }

  @Patch('appointments/:appointmentId/workplace-profile-receipt')
  @Permissions('medical-results:create')
  acknowledgeWorkplaceProfile(
    @Param('appointmentId') appointmentId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<WorkplaceProfileReceiptResultDto> {
    return this.evaluacionesService.acknowledgeWorkplaceProfile(
      appointmentId,
      request.user.sub,
      request.user.role,
    );
  }

  @Post()
  @Permissions('medical-results:create')
  create(
    @Body() body: CreateEvaluacionDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<EvaluacionListItemDto> {
    return this.evaluacionesService.create(body, request.user.sub);
  }
}

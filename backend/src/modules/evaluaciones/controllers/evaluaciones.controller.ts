import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { CreateEvaluacionDto } from '../dto/create-evaluacion.dto';
import { EvaluacionListItemDto } from '../dto/evaluacion-list-item.dto';
import { EvaluacionesService } from '../services/evaluaciones.service';

type AuthenticatedRequest = Request & { user: { sub: number } };

@Controller('medical-results')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR')
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
  ): Promise<EvaluacionListItemDto[]> {
    return this.evaluacionesService.findAll(request.user.sub);
  }

  @Get('options')
  getFormOptions(@Req() request: AuthenticatedRequest) {
    return this.evaluacionesService.getFormOptions(request.user.sub);
  }

  @Post()
  create(
    @Body() body: CreateEvaluacionDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<EvaluacionListItemDto> {
    return this.evaluacionesService.create(body, request.user.sub);
  }
}

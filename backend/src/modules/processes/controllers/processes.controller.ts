import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Permissions } from '../../../auth/permissions.decorator';
import { PermissionsGuard } from '../../../auth/permissions.guard';
import { CreateProcessDto } from '../dto/create-process.dto';
import { ProcessListItemDto } from '../dto/process-list-item.dto';
import { ProcessesService } from '../services/processes.service';

type AuthenticatedRequest = Request & {
  user: { sub: number; role: string };
};

@Controller('processes')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ProcessesController {
  constructor(private readonly processesService: ProcessesService) {}

  @Get()
  @Permissions('processes:read')
  findAll(@Req() request: AuthenticatedRequest): Promise<ProcessListItemDto[]> {
    return this.processesService.findAll(request.user.sub, request.user.role);
  }

  @Get('options')
  @Permissions('processes:create')
  getFormOptions(@Req() request: AuthenticatedRequest) {
    return this.processesService.getFormOptions(
      request.user.sub,
      request.user.role,
    );
  }

  @Post()
  @Permissions('processes:create')
  create(@Body() body: CreateProcessDto, @Req() request: AuthenticatedRequest) {
    return this.processesService.create(body, request.user.sub);
  }
}

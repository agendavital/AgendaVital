import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { CreateProcessDto } from '../dto/create-process.dto';
import { ProcessListItemDto } from '../dto/process-list-item.dto';
import { ProcessesService } from '../services/processes.service';

type AuthenticatedRequest = Request & {
  user: { sub: number };
};

@Controller('processes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'HR')
export class ProcessesController {
  constructor(private readonly processesService: ProcessesService) {}

  @Get()
  findAll(): Promise<ProcessListItemDto[]> {
    return this.processesService.findAll();
  }

  @Get('options')
  getFormOptions() {
    return this.processesService.getFormOptions();
  }

  @Post()
  create(@Body() body: CreateProcessDto, @Req() request: AuthenticatedRequest) {
    return this.processesService.create(body, request.user.sub);
  }
}

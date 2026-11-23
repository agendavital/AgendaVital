import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Permissions } from '../../../auth/permissions.decorator';
import { PermissionsGuard } from '../../../auth/permissions.guard';
import { CreateProcessDto } from '../dto/create-process.dto';
import { ProcessListItemDto } from '../dto/process-list-item.dto';
import { UpsertPerfilCargoDto } from '../dto/upsert-perfil-cargo.dto';
import {
  WorkplaceProfileResponseDto,
  WorkplaceProfileSaveResultDto,
} from '../dto/workplace-profile-response.dto';
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

  @Get(':processId/workplace-profile')
  @Permissions('processes:create')
  getWorkplaceProfile(
    @Param('processId') processId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<WorkplaceProfileResponseDto | null> {
    return this.processesService.getWorkplaceProfile(
      processId,
      request.user.sub,
      request.user.role,
    );
  }

  @Put(':processId/workplace-profile')
  @Permissions('processes:create')
  upsertWorkplaceProfile(
    @Param('processId') processId: string,
    @Body() body: UpsertPerfilCargoDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<WorkplaceProfileSaveResultDto> {
    return this.processesService.upsertWorkplaceProfile(
      processId,
      body,
      request.user.sub,
      request.user.role,
    );
  }
}

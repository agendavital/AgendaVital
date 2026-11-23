import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { Permissions } from '../../../auth/permissions.decorator';
import { PermissionsGuard } from '../../../auth/permissions.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { DocumentosService } from '../services/documentos.service';

type AuthenticatedRequest = Request & { user: { sub: number; role: string } };

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class DocumentosController {
  constructor(private readonly service: DocumentosService) {}

  @Get()
  @Permissions('documents:read')
  findAll(@Req() request: AuthenticatedRequest) {
    return this.service.findAll(request.user.sub, request.user.role);
  }
}

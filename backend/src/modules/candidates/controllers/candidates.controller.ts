import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Permissions } from '../../../auth/permissions.decorator';
import { PermissionsGuard } from '../../../auth/permissions.guard';
import { CandidateListItemDto } from '../dto/candidate-list-item.dto';
import { CandidatesService } from '../services/candidates.service';
import { CreateCandidateDto } from '../dto/create-candidate.dto';

type AuthenticatedRequest = Request & { user: { sub: number; role: string } };

@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  @Permissions('candidates:read')
  findAll(
    @Req() request: AuthenticatedRequest,
  ): Promise<CandidateListItemDto[]> {
    return this.candidatesService.findAll(request.user.sub, request.user.role);
  }

  @Post()
  @Permissions('candidates:create')
  create(@Body() body: CreateCandidateDto): Promise<CandidateListItemDto> {
    return this.candidatesService.create(body);
  }
}

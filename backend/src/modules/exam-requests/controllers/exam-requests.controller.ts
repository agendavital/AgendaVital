import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Permissions } from '../../../auth/permissions.decorator';
import { PermissionsGuard } from '../../../auth/permissions.guard';
import { CreateExamRequestDto } from '../dto/create-exam-request.dto';
import { ExamRequestListItemDto } from '../dto/exam-request-list-item.dto';
import { ExamRequestsService } from '../services/exam-requests.service';

type AuthenticatedRequest = Request & {
  user: { sub: number; role: string };
};

@Controller('exam-requests')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ExamRequestsController {
  constructor(private readonly examRequestsService: ExamRequestsService) {}

  @Get()
  @Permissions('exam-requests:read')
  findAll(
    @Req() request: AuthenticatedRequest,
  ): Promise<ExamRequestListItemDto[]> {
    return this.examRequestsService.findAll(
      request.user.sub,
      request.user.role,
    );
  }

  @Get('options')
  @Permissions('exam-requests:create')
  getFormOptions(@Req() request: AuthenticatedRequest) {
    return this.examRequestsService.getFormOptions(
      request.user.sub,
      request.user.role,
    );
  }

  @Post()
  @Permissions('exam-requests:create')
  create(
    @Body() body: CreateExamRequestDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.examRequestsService.create(
      body,
      request.user.sub,
      request.user.role,
    );
  }
}

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { CreateExamRequestDto } from '../dto/create-exam-request.dto';
import { ExamRequestListItemDto } from '../dto/exam-request-list-item.dto';
import { ExamRequestsService } from '../services/exam-requests.service';

type AuthenticatedRequest = Request & {
  user: { sub: number };
};

@Controller('exam-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'HR')
export class ExamRequestsController {
  constructor(private readonly examRequestsService: ExamRequestsService) {}

  @Get()
  findAll(): Promise<ExamRequestListItemDto[]> {
    return this.examRequestsService.findAll();
  }

  @Get('options')
  getFormOptions() {
    return this.examRequestsService.getFormOptions();
  }

  @Post()
  create(
    @Body() body: CreateExamRequestDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.examRequestsService.create(body, request.user.sub);
  }
}

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { CandidateListItemDto } from '../dto/candidate-list-item.dto';
import { CandidatesService } from '../services/candidates.service';
import { CreateCandidateDto } from '../dto/create-candidate.dto';

@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'HR', 'CLINIC')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  findAll(): Promise<CandidateListItemDto[]> {
    return this.candidatesService.findAll();
  }

  @Post()
  @Roles('ADMIN', 'HR')
  create(@Body() body: CreateCandidateDto): Promise<CandidateListItemDto> {
    return this.candidatesService.create(body);
  }
}

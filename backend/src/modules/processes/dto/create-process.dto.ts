import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CreateProcessDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  candidateId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId!: number;
}

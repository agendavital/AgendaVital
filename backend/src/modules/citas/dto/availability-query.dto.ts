import { Type } from 'class-transformer';
import { IsDateString, IsInt, Min } from 'class-validator';

export class AvailabilityQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  clinicId!: number;

  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}

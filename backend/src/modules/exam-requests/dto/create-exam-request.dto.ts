import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateExamRequestDto {
  @IsString()
  @Matches(/^[1-9]\d*$/)
  processId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  examTypeIds!: number[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observation?: string;
}

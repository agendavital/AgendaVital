import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateEvaluacionDto {
  @IsString()
  @Matches(/^[1-9]\d*$/)
  citaId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  conceptoOcupacionalId!: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(2000)
  resultadoResumen!: string;

  @IsOptional()
  @IsString()
  hallazgos?: string;

  @IsOptional()
  @IsString()
  observacionClinica?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  restriccion?: string;
}

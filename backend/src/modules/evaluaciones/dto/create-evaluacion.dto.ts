import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

class ReportedMedicationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  dosis?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  frecuencia?: string;
}

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

  @IsBoolean()
  tomaMedicamentos!: boolean;

  @IsBoolean()
  medicamentosRevisados!: boolean;

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ReportedMedicationDto)
  medicamentos!: ReportedMedicationDto[];
}

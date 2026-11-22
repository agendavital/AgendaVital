import { Type } from 'class-transformer';
import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateDisponibilidadDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  clinicaId!: number;

  @IsDateString()
  inicioEn!: string;

  @IsDateString()
  finEn!: string;
}

import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMedicoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombres!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellidos!: string;

  @IsEmail()
  @MaxLength(254)
  correo!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  clinicaId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  registroProfesional!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  especialidad?: string;
}

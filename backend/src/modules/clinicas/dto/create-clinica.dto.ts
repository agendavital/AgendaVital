import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateClinicaDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  nit!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @Transform(({ value }) => trimString(value))
  @IsOptional()
  @IsString()
  @MaxLength(250)
  direccion?: string;

  @Transform(({ value }) => trimString(value))
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string;

  @Transform(({ value }) => trimString(value))
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  correo?: string;

  @Transform(({ value }) => trimString(value))
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;
}

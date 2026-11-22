import { IsString, Matches, MaxLength } from 'class-validator';

export class CancelDisponibilidadDto {
  @IsString()
  @MaxLength(19)
  @Matches(/^[1-9]\d*$/)
  id!: string;
}

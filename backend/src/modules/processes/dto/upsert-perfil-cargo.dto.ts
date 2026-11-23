import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpsertPerfilCargoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nombreCargo!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  funcionesResponsabilidades!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  habilidadesCompetencias!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  requisitosFisicosMentales!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  riesgosLaborales!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  medidasPreventivas!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  indicadoresEpidemiologicos!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  matrizPeligrosRiesgos!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  estudiosTecnicos!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  indicadoresBiologicos!: string;
}

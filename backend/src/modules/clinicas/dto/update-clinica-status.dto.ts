import { IsBoolean } from 'class-validator';

export class UpdateClinicaStatusDto {
  @IsBoolean()
  activa!: boolean;
}

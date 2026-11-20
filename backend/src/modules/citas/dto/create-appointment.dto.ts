import { IsString, Matches } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @Matches(/^[1-9]\d*$/)
  examRequestId!: string;

  @IsString()
  @Matches(/^[1-9]\d*$/)
  availabilityId!: string;
}

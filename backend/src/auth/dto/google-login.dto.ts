import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsString({ message: 'La credencial de Google debe ser texto.' })
  @IsNotEmpty({ message: 'La credencial de Google es obligatoria.' })
  credential!: string;
}

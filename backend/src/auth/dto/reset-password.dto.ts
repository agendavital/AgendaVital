import { IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'El token de recuperación debe ser texto.' })
  @Matches(/^[a-f0-9]{64}$/, {
    message: 'El enlace de recuperación no es valido.',
  })
  token!: string;

  @IsString({ message: 'La contraseña debe ser texto.' })
  @MinLength(6, {
    message: 'La contraseña debe tener al menos 6 caracteres.',
  })
  password!: string;
}

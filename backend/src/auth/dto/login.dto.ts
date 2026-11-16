import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsEmail({}, { message: 'El correo electrónico no es válido.' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser texto.' })
  @MinLength(6, {
    message: 'La contraseña debe tener al menos 6 caracteres.',
  })
  password!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'El token de reCAPTCHA debe ser texto.' })
  @IsNotEmpty({ message: 'Completa el reCAPTCHA.' })
  captchaToken!: string;
}

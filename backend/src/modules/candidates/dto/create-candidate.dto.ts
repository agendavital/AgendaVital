import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCandidateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  documentNumber!: string;
}

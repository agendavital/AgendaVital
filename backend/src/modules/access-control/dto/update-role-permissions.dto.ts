import { ArrayUnique, IsArray, IsString, MaxLength } from 'class-validator';

export class UpdateRolePermissionsDto {
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  permissions!: string[];
}

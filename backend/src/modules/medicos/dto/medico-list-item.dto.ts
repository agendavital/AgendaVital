export class MedicoListItemDto {
  id!: number;
  nombres!: string;
  apellidos!: string;
  correo!: string;
  registroProfesional!: string;
  especialidad!: string | null;
  clinica!: string;
  activo!: boolean;
}

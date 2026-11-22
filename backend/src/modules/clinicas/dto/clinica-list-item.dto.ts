export class ClinicaListItemDto {
  id!: number;
  nit!: string;
  nombre!: string;
  direccion!: string | null;
  ciudad!: string | null;
  correo!: string | null;
  telefono!: string | null;
  activa!: boolean;
}

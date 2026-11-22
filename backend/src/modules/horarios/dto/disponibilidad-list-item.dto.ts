export class DisponibilidadListItemDto {
  id!: string;
  clinicaId!: number;
  clinica!: string;
  ciudad!: string | null;
  inicioEn!: string;
  finEn!: string;
  estado!: string;
}

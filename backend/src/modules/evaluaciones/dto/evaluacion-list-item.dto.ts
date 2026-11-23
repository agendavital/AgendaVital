export class EvaluacionListItemDto {
  id!: string;
  citaId!: string;
  candidato!: string;
  documento!: string;
  empresa!: string;
  examen!: string;
  clinica!: string;
  citaEn!: string;
  concepto!: string;
  resultadoResumen!: string;
  evaluadaEn!: string;
  restriccion!: string | null;
  tomaMedicamentos!: boolean | null;
  medicamentosRevisados!: boolean | null;
  medicamentos!: Array<{
    nombre: string;
    dosis: string | null;
    frecuencia: string | null;
  }>;
}

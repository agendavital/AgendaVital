import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateEvaluacionDto } from '../dto/create-evaluacion.dto';
import { EvaluacionListItemDto } from '../dto/evaluacion-list-item.dto';
import { WorkplaceProfileReceiptResultDto } from '../dto/workplace-profile-receipt-result.dto';

@Injectable()
export class EvaluacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async getFormOptions(userId: number) {
    const professional = await this.prisma.profesional.findFirst({
      where: { UsuarioId: userId, Activo: true },
      select: { ProfesionalId: true, ClinicaId: true },
    });

    if (!professional) {
      return {
        professionalConfigured: false,
        concepts: [],
        appointments: [],
      };
    }

    const [concepts, appointments] = await Promise.all([
      this.prisma.conceptoOcupacional.findMany({
        orderBy: { Nombre: 'asc' },
        select: { ConceptoOcupacionalId: true, Nombre: true },
      }),
      this.prisma.cita.findMany({
        where: {
          EstadoCita: { Codigo: 'PROGRAMADA' },
          EvaluacionOcupacional: { is: null },
          Disponibilidad: {
            is: {
              ClinicaId: professional.ClinicaId,
              FinEn: { lte: new Date() },
              OR: [
                { ProfesionalId: null },
                { ProfesionalId: professional.ProfesionalId },
              ],
            },
          },
        },
        orderBy: { Disponibilidad: { InicioEn: 'desc' } },
        take: 200,
        select: {
          CitaId: true,
          SolicitudExamen: {
            select: {
              TipoExamen: { select: { Nombre: true } },
              ProcesoOcupacional: {
                select: {
                  Candidato: {
                    select: {
                      TipoDocumento: true,
                      NumeroDocumento: true,
                      Usuario: { select: { Nombres: true, Apellidos: true } },
                    },
                  },
                  Empresa: { select: { RazonSocial: true } },
                  PerfilCargo: {
                    select: {
                      NombreCargo: true,
                      FuncionesResponsabilidades: true,
                      HabilidadesCompetencias: true,
                      RequisitosFisicosMentales: true,
                      RiesgosLaborales: true,
                      MedidasPreventivas: true,
                      IndicadoresEpidemiologicos: true,
                      MatrizPeligrosRiesgos: true,
                      EstudiosTecnicos: true,
                      IndicadoresBiologicos: true,
                      RecibidoEn: true,
                      RecibidoPorProfesionalId: true,
                      Profesional: {
                        select: {
                          Usuario: {
                            select: { Nombres: true, Apellidos: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          Disponibilidad: {
            select: {
              InicioEn: true,
              Clinica: { select: { Nombre: true } },
            },
          },
        },
      }),
    ]);

    return {
      professionalConfigured: true,
      concepts: concepts.map((concept) => ({
        id: concept.ConceptoOcupacionalId,
        nombre: concept.Nombre,
      })),
      appointments: appointments.map((appointment) => {
        const candidate =
          appointment.SolicitudExamen.ProcesoOcupacional.Candidato;
        return {
          id: appointment.CitaId.toString(),
          candidato:
            `${candidate.Usuario.Nombres} ${candidate.Usuario.Apellidos}`.trim(),
          documento: `${candidate.TipoDocumento} ${candidate.NumeroDocumento}`,
          empresa:
            appointment.SolicitudExamen.ProcesoOcupacional.Empresa.RazonSocial,
          perfilCargo: this.toWorkplaceProfile(
            appointment.SolicitudExamen.ProcesoOcupacional.PerfilCargo,
            professional.ProfesionalId,
          ),
          examen: appointment.SolicitudExamen.TipoExamen.Nombre,
          clinica: appointment.Disponibilidad.Clinica.Nombre,
          citaEn: appointment.Disponibilidad.InicioEn.toISOString(),
        };
      }),
    };
  }

  async acknowledgeWorkplaceProfile(
    appointmentIdInput: string,
    userId: number,
    role: string,
  ): Promise<WorkplaceProfileReceiptResultDto> {
    if (role !== 'DOCTOR') {
      throw new ForbiddenException(
        'Solo el profesional médico de la cita puede confirmar la recepción.',
      );
    }
    if (!/^[1-9]\d*$/.test(appointmentIdInput)) {
      throw new BadRequestException(
        'El identificador de la cita no es válido.',
      );
    }
    const appointmentId = BigInt(appointmentIdInput);
    const professional = await this.prisma.profesional.findFirst({
      where: { UsuarioId: userId, Activo: true },
      select: { ProfesionalId: true, ClinicaId: true },
    });
    if (!professional) {
      throw new ConflictException(
        'Tu cuenta no tiene un perfil profesional activo vinculado.',
      );
    }
    const appointment = await this.prisma.cita.findUnique({
      where: { CitaId: appointmentId },
      select: {
        EstadoCita: { select: { Codigo: true } },
        Disponibilidad: {
          select: {
            FinEn: true,
            ClinicaId: true,
            ProfesionalId: true,
          },
        },
        SolicitudExamen: {
          select: {
            ProcesoOcupacional: {
              select: {
                PerfilCargo: {
                  select: {
                    PerfilCargoId: true,
                    RecibidoEn: true,
                    RecibidoPorProfesionalId: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!appointment) throw new NotFoundException('No se encontró la cita.');
    if (
      appointment.Disponibilidad.ClinicaId !== professional.ClinicaId ||
      (appointment.Disponibilidad.ProfesionalId !== null &&
        appointment.Disponibilidad.ProfesionalId !== professional.ProfesionalId)
    ) {
      throw new NotFoundException('No se encontró la cita en tu clínica.');
    }
    if (
      appointment.EstadoCita.Codigo !== 'PROGRAMADA' ||
      appointment.Disponibilidad.FinEn > new Date()
    ) {
      throw new BadRequestException(
        'La recepción se confirma desde la evaluación de una cita atendida.',
      );
    }
    const profile = appointment.SolicitudExamen.ProcesoOcupacional.PerfilCargo;
    if (!profile) {
      throw new BadRequestException(
        'La empresa aún no registra el perfil del cargo en Procesos.',
      );
    }
    if (profile.RecibidoPorProfesionalId === professional.ProfesionalId) {
      return {
        message: 'La recepción del perfil ya estaba confirmada.',
        recibidoEn: profile.RecibidoEn?.toISOString() ?? null,
      };
    }

    const receivedAt = new Date();
    await this.prisma.perfilCargo.update({
      where: { PerfilCargoId: profile.PerfilCargoId },
      data: {
        RecibidoPorProfesionalId: professional.ProfesionalId,
        RecibidoEn: receivedAt,
      },
    });
    return {
      message: 'Recepción de la información del cargo confirmada.',
      recibidoEn: receivedAt.toISOString(),
    };
  }

  async findAll(userId: number): Promise<EvaluacionListItemDto[]> {
    const professional = await this.prisma.profesional.findFirst({
      where: { UsuarioId: userId, Activo: true },
      select: { ProfesionalId: true, ClinicaId: true },
    });
    if (!professional) return [];

    const evaluations = await this.prisma.evaluacionOcupacional.findMany({
      where: {
        ProfesionalId: professional.ProfesionalId,
        Cita: { Disponibilidad: { ClinicaId: professional.ClinicaId } },
      },
      orderBy: { EvaluadaEn: 'desc' },
      take: 200,
      select: this.evaluationSelect,
    });

    return evaluations.map((evaluation) => this.toListItem(evaluation));
  }

  async create(
    input: CreateEvaluacionDto,
    userId: number,
  ): Promise<EvaluacionListItemDto> {
    const professional = await this.prisma.profesional.findFirst({
      where: { UsuarioId: userId, Activo: true },
      select: { ProfesionalId: true, ClinicaId: true },
    });
    if (!professional) {
      throw new ConflictException(
        'Tu cuenta no tiene un perfil profesional activo vinculado.',
      );
    }

    if (!Array.isArray(input.medicamentos)) {
      throw new BadRequestException(
        'La lista de medicamentos debe tener un formato válido.',
      );
    }

    const appointmentId = BigInt(input.citaId);
    const [appointment, concept] = await Promise.all([
      this.prisma.cita.findUnique({
        where: { CitaId: appointmentId },
        select: {
          CitaId: true,
          EstadoCita: { select: { Codigo: true } },
          EvaluacionOcupacional: { select: { EvaluacionOcupacionalId: true } },
          Disponibilidad: {
            select: {
              FinEn: true,
              ClinicaId: true,
              ProfesionalId: true,
            },
          },
          SolicitudExamen: {
            select: {
              ProcesoOcupacional: {
                select: {
                  PerfilCargo: {
                    select: {
                      RecibidoPorProfesionalId: true,
                      RecibidoEn: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.conceptoOcupacional.findUnique({
        where: { ConceptoOcupacionalId: input.conceptoOcupacionalId },
        select: { ConceptoOcupacionalId: true },
      }),
    ]);

    const completedStatus = await this.prisma.estadoCita.findUnique({
      where: { Codigo: 'REALIZADA' },
      select: { EstadoCitaId: true },
    });

    if (!appointment) throw new NotFoundException('No se encontró la cita.');
    if (!concept) {
      throw new BadRequestException(
        'Selecciona un concepto ocupacional configurado.',
      );
    }
    if (!input.medicamentosRevisados) {
      throw new BadRequestException(
        'Confirma que revisaste la información de medicamentos con el paciente.',
      );
    }
    if (input.tomaMedicamentos && input.medicamentos.length === 0) {
      throw new BadRequestException(
        'Agrega al menos un medicamento reportado o indica que no toma medicamentos.',
      );
    }
    if (!input.tomaMedicamentos && input.medicamentos.length > 0) {
      throw new BadRequestException(
        'Quita los medicamentos de la lista o indica que el paciente reporta medicamentos.',
      );
    }
    if (
      input.tomaMedicamentos &&
      input.medicamentos.some((medication) => !medication.nombre.trim())
    ) {
      throw new BadRequestException(
        'Cada medicamento debe tener un nombre válido.',
      );
    }
    if (!completedStatus) {
      throw new InternalServerErrorException(
        'No está configurado el estado REALIZADA para las citas.',
      );
    }
    if (appointment.Disponibilidad.ClinicaId !== professional.ClinicaId) {
      throw new NotFoundException('No se encontró la cita en tu clínica.');
    }
    if (
      appointment.Disponibilidad.ProfesionalId !== null &&
      appointment.Disponibilidad.ProfesionalId !== professional.ProfesionalId
    ) {
      throw new NotFoundException('No se encontró la cita en tu agenda.');
    }
    if (appointment.EstadoCita.Codigo !== 'PROGRAMADA') {
      throw new BadRequestException(
        'Solo se pueden evaluar citas que estén programadas.',
      );
    }
    if (appointment.Disponibilidad.FinEn > new Date()) {
      throw new BadRequestException(
        'La cita debe haber finalizado antes de registrar el resultado.',
      );
    }
    if (appointment.EvaluacionOcupacional) {
      throw new ConflictException(
        'Esta cita ya tiene una evaluación registrada.',
      );
    }
    const workplaceProfile =
      appointment.SolicitudExamen.ProcesoOcupacional.PerfilCargo;
    if (
      !workplaceProfile ||
      workplaceProfile.RecibidoPorProfesionalId !==
        professional.ProfesionalId ||
      !workplaceProfile.RecibidoEn
    ) {
      throw new BadRequestException(
        'Antes de registrar el resultado, revisa y confirma la recepción del perfil del cargo.',
      );
    }

    try {
      const evaluation = await this.prisma.$transaction(async (transaction) => {
        const updatedAppointment = await transaction.cita.updateMany({
          where: {
            CitaId: appointmentId,
            EstadoCita: { Codigo: 'PROGRAMADA' },
          },
          data: { EstadoCitaId: completedStatus.EstadoCitaId },
        });
        if (updatedAppointment.count !== 1) {
          throw new ConflictException(
            'La cita cambió de estado. Recarga la página antes de continuar.',
          );
        }

        return transaction.evaluacionOcupacional.create({
          data: {
            CitaId: appointmentId,
            ProfesionalId: professional.ProfesionalId,
            ConceptoOcupacionalId: concept.ConceptoOcupacionalId,
            ResultadoResumen: input.resultadoResumen.trim(),
            Hallazgos: input.hallazgos?.trim() || null,
            ObservacionClinica: input.observacionClinica?.trim() || null,
            TomaMedicamentos: input.tomaMedicamentos,
            MedicamentosRevisados: input.medicamentosRevisados,
            CerradaEn: new Date(),
            ...(input.tomaMedicamentos
              ? {
                  MedicamentoReportado: {
                    create: input.medicamentos.map((medication) => ({
                      Nombre: medication.nombre.trim(),
                      Dosis: medication.dosis?.trim() || null,
                      Frecuencia: medication.frecuencia?.trim() || null,
                    })),
                  },
                }
              : {}),
            ...(input.restriccion?.trim()
              ? {
                  Restriccion: {
                    create: { Descripcion: input.restriccion.trim() },
                  },
                }
              : {}),
          },
          select: this.evaluationSelect,
        });
      });

      return this.toListItem(evaluation);
    } catch (error) {
      if (this.getPrismaCode(error) === 'P2002') {
        throw new ConflictException(
          'Ya existe un resultado registrado para esta cita.',
        );
      }
      throw error;
    }
  }

  private readonly evaluationSelect = {
    EvaluacionOcupacionalId: true,
    CitaId: true,
    ResultadoResumen: true,
    TomaMedicamentos: true,
    MedicamentosRevisados: true,
    MedicamentoReportado: {
      select: { Nombre: true, Dosis: true, Frecuencia: true },
    },
    EvaluadaEn: true,
    ConceptoOcupacional: { select: { Nombre: true } },
    Restriccion: { select: { Descripcion: true } },
    Cita: {
      select: {
        SolicitudExamen: {
          select: {
            TipoExamen: { select: { Nombre: true } },
            ProcesoOcupacional: {
              select: {
                Candidato: {
                  select: {
                    TipoDocumento: true,
                    NumeroDocumento: true,
                    Usuario: { select: { Nombres: true, Apellidos: true } },
                  },
                },
                Empresa: { select: { RazonSocial: true } },
              },
            },
          },
        },
        Disponibilidad: {
          select: {
            InicioEn: true,
            Clinica: { select: { Nombre: true } },
          },
        },
      },
    },
  } as const;

  private getPrismaCode(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return undefined;
    }
    return typeof error.code === 'string' ? error.code : undefined;
  }

  private toWorkplaceProfile(
    profile: {
      NombreCargo: string;
      FuncionesResponsabilidades: string;
      HabilidadesCompetencias: string;
      RequisitosFisicosMentales: string;
      RiesgosLaborales: string;
      MedidasPreventivas: string;
      IndicadoresEpidemiologicos: string;
      MatrizPeligrosRiesgos: string;
      EstudiosTecnicos: string;
      IndicadoresBiologicos: string;
      RecibidoEn: Date | null;
      RecibidoPorProfesionalId: number | null;
      Profesional: {
        Usuario: { Nombres: string; Apellidos: string };
      } | null;
    } | null,
    professionalId: number,
  ) {
    if (!profile) return null;
    return {
      nombreCargo: profile.NombreCargo,
      funcionesResponsabilidades: profile.FuncionesResponsabilidades,
      habilidadesCompetencias: profile.HabilidadesCompetencias,
      requisitosFisicosMentales: profile.RequisitosFisicosMentales,
      riesgosLaborales: profile.RiesgosLaborales,
      medidasPreventivas: profile.MedidasPreventivas,
      indicadoresEpidemiologicos: profile.IndicadoresEpidemiologicos,
      matrizPeligrosRiesgos: profile.MatrizPeligrosRiesgos,
      estudiosTecnicos: profile.EstudiosTecnicos,
      indicadoresBiologicos: profile.IndicadoresBiologicos,
      recibidoEn: profile.RecibidoEn?.toISOString() ?? null,
      recibidoPorMi:
        profile.RecibidoPorProfesionalId === professionalId &&
        profile.RecibidoEn !== null,
      recibidoPor:
        profile.Profesional === null
          ? null
          : `${profile.Profesional.Usuario.Nombres} ${profile.Profesional.Usuario.Apellidos}`.trim(),
    };
  }

  private toListItem(evaluation: {
    EvaluacionOcupacionalId: bigint;
    CitaId: bigint;
    ResultadoResumen: string | null;
    TomaMedicamentos: boolean | null;
    MedicamentosRevisados: boolean | null;
    MedicamentoReportado: Array<{
      Nombre: string;
      Dosis: string | null;
      Frecuencia: string | null;
    }>;
    EvaluadaEn: Date;
    ConceptoOcupacional: { Nombre: string } | null;
    Restriccion: Array<{ Descripcion: string }>;
    Cita: {
      SolicitudExamen: {
        TipoExamen: { Nombre: string };
        ProcesoOcupacional: {
          Candidato: {
            TipoDocumento: string;
            NumeroDocumento: string;
            Usuario: { Nombres: string; Apellidos: string };
          };
          Empresa: { RazonSocial: string };
        };
      };
      Disponibilidad: { InicioEn: Date; Clinica: { Nombre: string } };
    };
  }): EvaluacionListItemDto {
    const candidate =
      evaluation.Cita.SolicitudExamen.ProcesoOcupacional.Candidato;
    return {
      id: evaluation.EvaluacionOcupacionalId.toString(),
      citaId: evaluation.CitaId.toString(),
      candidato:
        `${candidate.Usuario.Nombres} ${candidate.Usuario.Apellidos}`.trim(),
      documento: `${candidate.TipoDocumento} ${candidate.NumeroDocumento}`,
      empresa:
        evaluation.Cita.SolicitudExamen.ProcesoOcupacional.Empresa.RazonSocial,
      examen: evaluation.Cita.SolicitudExamen.TipoExamen.Nombre,
      clinica: evaluation.Cita.Disponibilidad.Clinica.Nombre,
      citaEn: evaluation.Cita.Disponibilidad.InicioEn.toISOString(),
      concepto: evaluation.ConceptoOcupacional?.Nombre ?? 'Sin concepto',
      resultadoResumen: evaluation.ResultadoResumen ?? '',
      evaluadaEn: evaluation.EvaluadaEn.toISOString(),
      restriccion:
        evaluation.Restriccion.map(({ Descripcion }) => Descripcion).join(
          '; ',
        ) || null,
      tomaMedicamentos: evaluation.TomaMedicamentos,
      medicamentosRevisados: evaluation.MedicamentosRevisados,
      medicamentos: evaluation.MedicamentoReportado.map((medication) => ({
        nombre: medication.Nombre,
        dosis: medication.Dosis,
        frecuencia: medication.Frecuencia,
      })),
    };
  }
}

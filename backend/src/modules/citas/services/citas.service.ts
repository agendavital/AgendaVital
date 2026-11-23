import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { AvailabilityQueryDto } from '../dto/availability-query.dto';
import { AppointmentListItemDto } from '../dto/appointment-list-item.dto';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';

@Injectable()
export class CitasService {
  constructor(private readonly prisma: PrismaService) {}

  async getFormOptions(userId: number, role: string) {
    if (role !== 'ADMIN' && role !== 'HR') {
      throw new ForbiddenException(
        'Solo administración o recursos humanos pueden programar citas.',
      );
    }
    const now = new Date();
    const user = await this.prisma.usuario.findUnique({
      where: { UsuarioId: userId },
      select: { EmpresaId: true },
    });
    if (!user) {
      return { examRequests: [], clinics: [], initialStatusConfigured: false };
    }
    const requestScope =
      role === 'HR'
        ? { ProcesoOcupacional: { is: { EmpresaId: user.EmpresaId ?? -1 } } }
        : {};
    const [requests, clinics, initialStatus] = await Promise.all([
      this.prisma.solicitudExamen.findMany({
        where: {
          ...requestScope,
          EstadoSolicitud: { Codigo: 'SOLICITADA' },
          Cita: { is: null },
        },
        orderBy: { SolicitadaEn: 'asc' },
        select: {
          SolicitudExamenId: true,
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
      }),
      this.prisma.clinica.findMany({
        where: {
          Activa: true,
          Disponibilidad: {
            some: {
              Estado: 'DISPONIBLE',
              InicioEn: { gt: now },
              Cita: { is: null },
            },
          },
        },
        orderBy: [{ Ciudad: 'asc' }, { Nombre: 'asc' }],
        select: {
          ClinicaId: true,
          Nombre: true,
          Ciudad: true,
          Direccion: true,
        },
      }),
      this.prisma.estadoCita.findUnique({
        where: { Codigo: 'PROGRAMADA' },
        select: { EstadoCitaId: true },
      }),
    ]);

    return {
      examRequests: requests.map((request) => ({
        id: request.SolicitudExamenId.toString(),
        candidateName:
          `${request.ProcesoOcupacional.Candidato.Usuario.Nombres} ${request.ProcesoOcupacional.Candidato.Usuario.Apellidos}`.trim(),
        document: `${request.ProcesoOcupacional.Candidato.TipoDocumento} ${request.ProcesoOcupacional.Candidato.NumeroDocumento}`,
        company: request.ProcesoOcupacional.Empresa.RazonSocial,
        examType: request.TipoExamen.Nombre,
      })),
      clinics: clinics.map((clinic) => ({
        id: clinic.ClinicaId,
        name: clinic.Nombre,
        city: clinic.Ciudad,
        address: clinic.Direccion,
      })),
      initialStatusConfigured: Boolean(initialStatus),
    };
  }

  async getAvailability(query: AvailabilityQueryDto, role: string) {
    if (role !== 'ADMIN' && role !== 'HR') {
      throw new ForbiddenException(
        'Solo administración o recursos humanos pueden consultar horarios para programar.',
      );
    }
    const from = new Date(query.from);
    const to = new Date(query.to);
    const now = new Date();

    if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime())) {
      throw new BadRequestException('El rango de fechas no es válido.');
    }
    if (to <= from || to.getTime() - from.getTime() > 25 * 60 * 60 * 1000) {
      throw new BadRequestException(
        'Consulta un solo día para buscar horarios disponibles.',
      );
    }

    const slots = await this.prisma.disponibilidad.findMany({
      where: {
        ClinicaId: query.clinicId,
        Clinica: { is: { Activa: true } },
        Estado: 'DISPONIBLE',
        InicioEn: { gte: from, lt: to, gt: now },
        Cita: { is: null },
      },
      orderBy: { InicioEn: 'asc' },
      select: {
        DisponibilidadId: true,
        InicioEn: true,
        FinEn: true,
        Profesional: {
          select: { Usuario: { select: { Nombres: true, Apellidos: true } } },
        },
      },
    });

    return slots.map((slot) => ({
      id: slot.DisponibilidadId.toString(),
      startsAt: slot.InicioEn.toISOString(),
      endsAt: slot.FinEn.toISOString(),
      professionalName: slot.Profesional
        ? `${slot.Profesional.Usuario.Nombres} ${slot.Profesional.Usuario.Apellidos}`.trim()
        : null,
    }));
  }

  async findAll(
    userId: number,
    role: string,
  ): Promise<AppointmentListItemDto[]> {
    const user = await this.prisma.usuario.findUnique({
      where: { UsuarioId: userId },
      select: { EmpresaId: true, ClinicaId: true },
    });
    if (!user) return [];
    const where =
      role === 'ADMIN'
        ? {}
        : role === 'HR' && user.EmpresaId
          ? {
              SolicitudExamen: {
                is: {
                  ProcesoOcupacional: { is: { EmpresaId: user.EmpresaId } },
                },
              },
            }
          : (role === 'CLINIC' || role === 'DOCTOR') && user.ClinicaId
            ? { Disponibilidad: { is: { ClinicaId: user.ClinicaId } } }
            : { CitaId: -1n };
    const appointments = await this.prisma.cita.findMany({
      where,
      orderBy: { Disponibilidad: { InicioEn: 'asc' } },
      select: this.appointmentSelect,
    });

    return appointments.map((appointment) => this.toListItem(appointment));
  }

  async create(
    input: CreateAppointmentDto,
    createdByUserId: number,
    role: string,
  ) {
    if (role !== 'ADMIN' && role !== 'HR') {
      throw new ForbiddenException(
        'Solo administración o recursos humanos pueden programar citas.',
      );
    }
    const user = await this.prisma.usuario.findUnique({
      where: { UsuarioId: createdByUserId },
      select: { EmpresaId: true, ClinicaId: true },
    });
    if (!user) throw new NotFoundException('No se encontró el usuario.');
    const examRequestId = BigInt(input.examRequestId);
    const availabilityId = BigInt(input.availabilityId);
    const now = new Date();

    const initialStatus = await this.prisma.estadoCita.findUnique({
      where: { Codigo: 'PROGRAMADA' },
      select: { EstadoCitaId: true },
    });
    if (!initialStatus) {
      throw new InternalServerErrorException(
        'No está configurado el estado inicial PROGRAMADA.',
      );
    }

    let appointmentId: bigint;
    try {
      appointmentId = await this.prisma.$transaction(async (transaction) => {
        const [request, slot] = await Promise.all([
          transaction.solicitudExamen.findUnique({
            where: { SolicitudExamenId: examRequestId },
            select: {
              SolicitudExamenId: true,
              EstadoSolicitud: { select: { Codigo: true } },
              Cita: { select: { CitaId: true } },
              TipoExamen: { select: { Nombre: true } },
              ProcesoOcupacional: {
                select: {
                  EmpresaId: true,
                  ProcesoOcupacionalId: true,
                  Candidato: {
                    select: {
                      UsuarioId: true,
                    },
                  },
                },
              },
            },
          }),
          transaction.disponibilidad.findUnique({
            where: { DisponibilidadId: availabilityId },
            select: {
              DisponibilidadId: true,
              ClinicaId: true,
              InicioEn: true,
              Estado: true,
              Clinica: {
                select: { Activa: true, Nombre: true, Ciudad: true },
              },
              Cita: { select: { CitaId: true } },
            },
          }),
        ]);

        if (!request) {
          throw new NotFoundException('No se encontró la solicitud de examen.');
        }
        if (request.EstadoSolicitud.Codigo !== 'SOLICITADA') {
          throw new BadRequestException(
            'La solicitud ya no está pendiente de programación.',
          );
        }
        if (
          role === 'HR' &&
          (!user.EmpresaId ||
            request.ProcesoOcupacional.EmpresaId !== user.EmpresaId)
        ) {
          throw new NotFoundException('No se encontró la solicitud de examen.');
        }
        if (request.Cita) {
          throw new ConflictException(
            'Esta solicitud ya tiene una cita programada.',
          );
        }
        if (!slot || !slot.Clinica.Activa) {
          throw new NotFoundException(
            'No se encontró una disponibilidad activa para la clínica.',
          );
        }
        if (slot.Estado !== 'DISPONIBLE' || slot.Cita || slot.InicioEn <= now) {
          throw new ConflictException(
            'Ese horario ya no está disponible. Selecciona otro.',
          );
        }

        const reserved = await transaction.disponibilidad.updateMany({
          where: {
            DisponibilidadId: availabilityId,
            Estado: 'DISPONIBLE',
            InicioEn: { gt: now },
          },
          data: { Estado: 'RESERVADA' },
        });
        if (reserved.count !== 1) {
          throw new ConflictException(
            'Ese horario acaba de ser reservado. Selecciona otro.',
          );
        }

        const appointment = await transaction.cita.create({
          data: {
            SolicitudExamenId: request.SolicitudExamenId,
            DisponibilidadId: slot.DisponibilidadId,
            EstadoCitaId: initialStatus.EstadoCitaId,
            CreadaPorUsuarioId: createdByUserId,
          },
          select: { CitaId: true },
        });

        const appointmentDate = new Intl.DateTimeFormat('es-CO', {
          dateStyle: 'full',
          timeStyle: 'short',
          timeZone: 'America/Bogota',
        }).format(slot.InicioEn);
        const clinicLocation = slot.Clinica.Ciudad
          ? `${slot.Clinica.Nombre}, ${slot.Clinica.Ciudad}`
          : slot.Clinica.Nombre;

        await transaction.notificacion.create({
          data: {
            UsuarioDestinatarioId:
              request.ProcesoOcupacional.Candidato.UsuarioId,
            ProcesoOcupacionalId:
              request.ProcesoOcupacional.ProcesoOcupacionalId,
            CitaId: appointment.CitaId,
            TipoEvento: 'CITA_PROGRAMADA',
            Canal: 'INTERNO',
            Asunto: 'Tu cita de examen fue programada',
            Mensaje: `Tu examen ${request.TipoExamen.Nombre} quedó programado para el ${appointmentDate} en ${clinicLocation}.`,
            Estado: 'ENVIADA',
          },
        });

        return appointment.CitaId;
      });
    } catch (error) {
      const errorCode =
        typeof error === 'object' && error !== null
          ? (error as { code?: unknown }).code
          : undefined;
      if (errorCode === 'P2002') {
        throw new ConflictException(
          'La solicitud o el horario ya están vinculados a otra cita.',
        );
      }
      throw error;
    }

    const created = await this.prisma.cita.findUnique({
      where: { CitaId: appointmentId },
      select: this.appointmentSelect,
    });
    if (!created) {
      throw new InternalServerErrorException(
        'La cita se creó, pero no se pudo cargar para mostrarla.',
      );
    }
    return this.toListItem(created);
  }

  private readonly appointmentSelect = {
    CitaId: true,
    SolicitudExamenId: true,
    EstadoCita: { select: { Nombre: true } },
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
        FinEn: true,
        Clinica: { select: { Nombre: true, Ciudad: true } },
      },
    },
  } as const;

  private toListItem(appointment: {
    CitaId: bigint;
    SolicitudExamenId: bigint;
    EstadoCita: { Nombre: string };
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
    Disponibilidad: {
      InicioEn: Date;
      FinEn: Date;
      Clinica: { Nombre: string; Ciudad: string | null };
    };
  }): AppointmentListItemDto {
    const candidate = appointment.SolicitudExamen.ProcesoOcupacional.Candidato;
    const availability = appointment.Disponibilidad;
    return {
      id: appointment.CitaId.toString(),
      examRequestId: appointment.SolicitudExamenId.toString(),
      candidateName:
        `${candidate.Usuario.Nombres} ${candidate.Usuario.Apellidos}`.trim(),
      document: `${candidate.TipoDocumento} ${candidate.NumeroDocumento}`,
      company:
        appointment.SolicitudExamen.ProcesoOcupacional.Empresa.RazonSocial,
      examType: appointment.SolicitudExamen.TipoExamen.Nombre,
      clinic: availability.Clinica.Nombre,
      city: availability.Clinica.Ciudad,
      startsAt: availability.InicioEn.toISOString(),
      endsAt: availability.FinEn.toISOString(),
      status: appointment.EstadoCita.Nombre,
    };
  }
}

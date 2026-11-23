import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateExamRequestDto } from '../dto/create-exam-request.dto';
import { ExamRequestListItemDto } from '../dto/exam-request-list-item.dto';

@Injectable()
export class ExamRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFormOptions(userId: number, role: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { UsuarioId: userId },
      select: {
        EmpresaId: true,
        ClinicaId: true,
        Candidato: { select: { CandidatoId: true } },
      },
    });
    if (!user)
      return { processes: [], examTypes: [], initialStatusConfigured: false };
    const processScope = this.processScope(role, user);
    const [processes, examTypes, initialStatus] = await Promise.all([
      this.prisma.procesoOcupacional.findMany({
        where: {
          ...processScope,
          EstadoProceso: { Codigo: { in: ['PENDIENTE', 'EN_PROCESO'] } },
        },
        orderBy: [{ FechaInicio: 'desc' }, { ProcesoOcupacionalId: 'desc' }],
        select: {
          ProcesoOcupacionalId: true,
          Candidato: {
            select: {
              Usuario: { select: { Nombres: true, Apellidos: true } },
            },
          },
          Empresa: { select: { RazonSocial: true } },
          EstadoProceso: { select: { Nombre: true } },
        },
      }),
      this.prisma.tipoExamen.findMany({
        where: { Activo: true },
        orderBy: { Nombre: 'asc' },
        select: { TipoExamenId: true, Nombre: true },
      }),
      this.prisma.estadoSolicitud.findUnique({
        where: { Codigo: 'SOLICITADA' },
        select: { EstadoSolicitudId: true },
      }),
    ]);

    return {
      processes: processes.map((process) => ({
        id: process.ProcesoOcupacionalId.toString(),
        candidateName:
          `${process.Candidato.Usuario.Nombres} ${process.Candidato.Usuario.Apellidos}`.trim(),
        company: process.Empresa.RazonSocial,
        status: process.EstadoProceso.Nombre,
      })),
      examTypes: examTypes.map((examType) => ({
        id: examType.TipoExamenId,
        name: examType.Nombre,
      })),
      initialStatusConfigured: Boolean(initialStatus),
    };
  }

  async findAll(
    userId: number,
    role: string,
  ): Promise<ExamRequestListItemDto[]> {
    const user = await this.prisma.usuario.findUnique({
      where: { UsuarioId: userId },
      select: {
        EmpresaId: true,
        ClinicaId: true,
        Candidato: { select: { CandidatoId: true } },
      },
    });
    if (!user) return [];
    const processScope = this.processScope(role, user);
    const requests = await this.prisma.solicitudExamen.findMany({
      where: { ProcesoOcupacional: { is: processScope } },
      orderBy: [{ SolicitadaEn: 'desc' }, { SolicitudExamenId: 'desc' }],
      select: {
        SolicitudExamenId: true,
        ProcesoOcupacionalId: true,
        SolicitadaEn: true,
        TipoExamen: { select: { Nombre: true } },
        EstadoSolicitud: { select: { Nombre: true } },
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
    });

    return requests.map((request) => ({
      id: request.SolicitudExamenId.toString(),
      processId: request.ProcesoOcupacionalId.toString(),
      candidateName:
        `${request.ProcesoOcupacional.Candidato.Usuario.Nombres} ${request.ProcesoOcupacional.Candidato.Usuario.Apellidos}`.trim(),
      documentType: request.ProcesoOcupacional.Candidato.TipoDocumento,
      documentNumber: request.ProcesoOcupacional.Candidato.NumeroDocumento,
      company: request.ProcesoOcupacional.Empresa.RazonSocial,
      examType: request.TipoExamen.Nombre,
      status: request.EstadoSolicitud.Nombre,
      requestedAt: request.SolicitadaEn.toISOString(),
    }));
  }

  async create(
    input: CreateExamRequestDto,
    requestedByUserId: number,
    role: string,
  ) {
    const processId = BigInt(input.processId);
    const user = await this.prisma.usuario.findUnique({
      where: { UsuarioId: requestedByUserId },
      select: {
        EmpresaId: true,
        ClinicaId: true,
        Candidato: { select: { CandidatoId: true } },
      },
    });
    if (!user) throw new NotFoundException('No se encontró el usuario.');
    const [process, examTypes, initialStatus] = await Promise.all([
      this.prisma.procesoOcupacional.findUnique({
        where: { ProcesoOcupacionalId: processId },
        select: {
          ProcesoOcupacionalId: true,
          EmpresaId: true,
          CandidatoId: true,
          EstadoProceso: { select: { Codigo: true } },
          SolicitudExamen: {
            select: {
              Cita: {
                select: { Disponibilidad: { select: { ClinicaId: true } } },
              },
            },
          },
        },
      }),
      this.prisma.tipoExamen.findMany({
        where: {
          TipoExamenId: { in: input.examTypeIds },
          Activo: true,
        },
        select: { TipoExamenId: true },
      }),
      this.prisma.estadoSolicitud.findUnique({
        where: { Codigo: 'SOLICITADA' },
        select: { EstadoSolicitudId: true },
      }),
    ]);

    if (!process) {
      throw new NotFoundException('No se encontró el proceso ocupacional.');
    }
    if (!this.isProcessVisible(role, user, process)) {
      throw new NotFoundException('No se encontró el proceso ocupacional.');
    }

    if (!['PENDIENTE', 'EN_PROCESO'].includes(process.EstadoProceso.Codigo)) {
      throw new BadRequestException(
        'Solo se pueden solicitar exámenes para procesos abiertos.',
      );
    }

    if (examTypes.length !== input.examTypeIds.length) {
      throw new BadRequestException(
        'Uno o más tipos de examen no existen o están inactivos.',
      );
    }

    if (!initialStatus) {
      throw new InternalServerErrorException(
        'No está configurado el estado inicial SOLICITADA.',
      );
    }

    const createdRequests = await this.prisma.$transaction(
      input.examTypeIds.map((TipoExamenId) =>
        this.prisma.solicitudExamen.create({
          data: {
            ProcesoOcupacionalId: processId,
            TipoExamenId,
            EstadoSolicitudId: initialStatus.EstadoSolicitudId,
            SolicitadoPorUsuarioId: requestedByUserId,
            Observacion: input.observation?.trim() || null,
          },
          select: { SolicitudExamenId: true },
        }),
      ),
    );

    const createdIds = createdRequests.map(
      ({ SolicitudExamenId }) => SolicitudExamenId,
    );

    return this.findByIds(createdIds);
  }

  private async findByIds(ids: bigint[]): Promise<ExamRequestListItemDto[]> {
    const requests = await this.prisma.solicitudExamen.findMany({
      where: { SolicitudExamenId: { in: ids } },
      select: {
        SolicitudExamenId: true,
        ProcesoOcupacionalId: true,
        SolicitadaEn: true,
        TipoExamen: { select: { Nombre: true } },
        EstadoSolicitud: { select: { Nombre: true } },
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
    });

    return requests.map((request) => ({
      id: request.SolicitudExamenId.toString(),
      processId: request.ProcesoOcupacionalId.toString(),
      candidateName:
        `${request.ProcesoOcupacional.Candidato.Usuario.Nombres} ${request.ProcesoOcupacional.Candidato.Usuario.Apellidos}`.trim(),
      documentType: request.ProcesoOcupacional.Candidato.TipoDocumento,
      documentNumber: request.ProcesoOcupacional.Candidato.NumeroDocumento,
      company: request.ProcesoOcupacional.Empresa.RazonSocial,
      examType: request.TipoExamen.Nombre,
      status: request.EstadoSolicitud.Nombre,
      requestedAt: request.SolicitadaEn.toISOString(),
    }));
  }

  private processScope(
    role: string,
    user: {
      EmpresaId: number | null;
      ClinicaId: number | null;
      Candidato: { CandidatoId: number } | null;
    },
  ) {
    if (role === 'ADMIN') return {};
    if (role === 'HR') return { EmpresaId: user.EmpresaId ?? -1 };
    if (role === 'CANDIDATE')
      return { CandidatoId: user.Candidato?.CandidatoId ?? -1 };
    if (role === 'CLINIC' || role === 'DOCTOR') {
      return {
        SolicitudExamen: {
          some: {
            Cita: {
              is: {
                Disponibilidad: { is: { ClinicaId: user.ClinicaId ?? -1 } },
              },
            },
          },
        },
      };
    }
    return { ProcesoOcupacionalId: -1n };
  }

  private isProcessVisible(
    role: string,
    user: {
      EmpresaId: number | null;
      ClinicaId: number | null;
      Candidato: { CandidatoId: number } | null;
    },
    process: {
      EmpresaId: number;
      CandidatoId: number;
      SolicitudExamen: {
        Cita: { Disponibilidad: { ClinicaId: number } } | null;
      }[];
    },
  ) {
    if (role === 'ADMIN') return true;
    if (role === 'HR') return user.EmpresaId === process.EmpresaId;
    if (role === 'CANDIDATE')
      return user.Candidato?.CandidatoId === process.CandidatoId;
    if (role === 'CLINIC' || role === 'DOCTOR') {
      return process.SolicitudExamen.some(
        (request) => request.Cita?.Disponibilidad.ClinicaId === user.ClinicaId,
      );
    }
    return false;
  }
}

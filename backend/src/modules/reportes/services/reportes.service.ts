import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: number, role: string) {
    const now = new Date();
    const user = await this.prisma.usuario.findUnique({
      where: { UsuarioId: userId },
      select: {
        EmpresaId: true,
        ClinicaId: true,
        Candidato: { select: { CandidatoId: true } },
      },
    });
    if (!user) {
      return {
        generatedAt: now.toISOString(),
        metrics: {
          totalAppointments: 0,
          upcomingAppointments: 0,
          completedAppointments: 0,
          totalExamRequests: 0,
          totalEvaluations: 0,
          totalProcesses: 0,
        },
        appointmentsByStatus: [],
        examRequestsByType: [],
      };
    }
    const processWhere =
      role === 'ADMIN'
        ? {}
        : role === 'HR'
          ? { EmpresaId: user.EmpresaId ?? -1 }
          : role === 'CANDIDATE'
            ? { CandidatoId: user.Candidato?.CandidatoId ?? -1 }
            : role === 'CLINIC' || role === 'DOCTOR'
              ? {
                  SolicitudExamen: {
                    some: {
                      Cita: {
                        is: {
                          Disponibilidad: {
                            is: { ClinicaId: user.ClinicaId ?? -1 },
                          },
                        },
                      },
                    },
                  },
                }
              : { ProcesoOcupacionalId: -1n };
    const requestWhere = { ProcesoOcupacional: { is: processWhere } };
    const appointmentWhere =
      role === 'ADMIN'
        ? {}
        : role === 'CLINIC' || role === 'DOCTOR'
          ? { Disponibilidad: { is: { ClinicaId: user.ClinicaId ?? -1 } } }
          : { SolicitudExamen: { is: requestWhere } };
    const evaluationWhere = {
      Cita: { is: { SolicitudExamen: { is: requestWhere } } },
    };
    const [
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      totalExamRequests,
      totalEvaluations,
      totalProcesses,
      appointmentGroups,
      requestGroups,
      appointmentStates,
      examTypes,
    ] = await Promise.all([
      this.prisma.cita.count({ where: appointmentWhere }),
      this.prisma.cita.count({
        where: {
          ...appointmentWhere,
          EstadoCita: { is: { Codigo: 'PROGRAMADA' } },
          Disponibilidad: { is: { InicioEn: { gte: now } } },
        },
      }),
      this.prisma.cita.count({
        where: {
          ...appointmentWhere,
          EstadoCita: { is: { Codigo: 'REALIZADA' } },
        },
      }),
      this.prisma.solicitudExamen.count({ where: requestWhere }),
      this.prisma.evaluacionOcupacional.count({ where: evaluationWhere }),
      this.prisma.procesoOcupacional.count({ where: processWhere }),
      this.prisma.cita.groupBy({
        where: appointmentWhere,
        by: ['EstadoCitaId'],
        _count: { _all: true },
      }),
      this.prisma.solicitudExamen.groupBy({
        where: requestWhere,
        by: ['TipoExamenId'],
        _count: { _all: true },
      }),
      this.prisma.estadoCita.findMany({
        select: { EstadoCitaId: true, Codigo: true, Nombre: true },
      }),
      this.prisma.tipoExamen.findMany({
        select: { TipoExamenId: true, Nombre: true },
      }),
    ]);

    const appointmentStateById = new Map(
      appointmentGroups.map((item) => [item.EstadoCitaId, item._count._all]),
    );
    const requestsByTypeId = new Map(
      requestGroups.map((item) => [item.TipoExamenId, item._count._all]),
    );

    return {
      generatedAt: now.toISOString(),
      metrics: {
        totalAppointments,
        upcomingAppointments,
        completedAppointments,
        totalExamRequests,
        totalEvaluations,
        totalProcesses,
      },
      appointmentsByStatus: appointmentStates
        .map((state) => ({
          code: state.Codigo,
          name: state.Nombre,
          count: appointmentStateById.get(state.EstadoCitaId) ?? 0,
        }))
        .sort(
          (left, right) =>
            right.count - left.count || left.name.localeCompare(right.name),
        ),
      examRequestsByType: examTypes
        .map((type) => ({
          name: type.Nombre,
          count: requestsByTypeId.get(type.TipoExamenId) ?? 0,
        }))
        .sort(
          (left, right) =>
            right.count - left.count || left.name.localeCompare(right.name),
        ),
    };
  }
}

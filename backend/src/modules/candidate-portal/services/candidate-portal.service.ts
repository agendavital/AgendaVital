import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class CandidatePortalService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProcess(userId: number) {
    const candidate = await this.prisma.candidato.findUnique({
      where: { UsuarioId: userId },
      select: {
        CandidatoId: true,
        ProcesoOcupacional: {
          orderBy: [{ FechaInicio: 'desc' }, { ProcesoOcupacionalId: 'desc' }],
          select: {
            ProcesoOcupacionalId: true,
            FechaInicio: true,
            FechaCierre: true,
            EstadoProceso: { select: { Nombre: true } },
            Empresa: { select: { RazonSocial: true } },
            SolicitudExamen: {
              orderBy: [
                { SolicitadaEn: 'desc' },
                { SolicitudExamenId: 'desc' },
              ],
              select: {
                SolicitudExamenId: true,
                SolicitadaEn: true,
                TipoExamen: { select: { Nombre: true } },
                EstadoSolicitud: { select: { Nombre: true } },
                Cita: {
                  select: {
                    EstadoCita: { select: { Nombre: true } },
                    Disponibilidad: {
                      select: {
                        InicioEn: true,
                        FinEn: true,
                        Clinica: { select: { Nombre: true, Ciudad: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!candidate)
      throw new NotFoundException('No se encontró el perfil de candidato.');

    return {
      processes: candidate.ProcesoOcupacional.map((process) => ({
        id: process.ProcesoOcupacionalId.toString(),
        company: process.Empresa.RazonSocial,
        status: process.EstadoProceso.Nombre,
        startDate: process.FechaInicio.toISOString().slice(0, 10),
        closeDate: process.FechaCierre?.toISOString().slice(0, 10) ?? null,
        examRequests: process.SolicitudExamen.map((request) => ({
          id: request.SolicitudExamenId.toString(),
          examType: request.TipoExamen.Nombre,
          status: request.EstadoSolicitud.Nombre,
          requestedAt: request.SolicitadaEn.toISOString(),
          appointment: request.Cita
            ? {
                status: request.Cita.EstadoCita.Nombre,
                startsAt: request.Cita.Disponibilidad.InicioEn.toISOString(),
                endsAt: request.Cita.Disponibilidad.FinEn.toISOString(),
                clinic: request.Cita.Disponibilidad.Clinica.Nombre,
                city: request.Cita.Disponibilidad.Clinica.Ciudad,
              }
            : null,
        })),
      })),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class DocumentosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number, role: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { UsuarioId: userId },
      select: {
        EmpresaId: true,
        ClinicaId: true,
        Candidato: { select: { CandidatoId: true } },
      },
    });
    if (!user) return [];

    const processScope =
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

    const documents = await this.prisma.documentoProceso.findMany({
      where: { ProcesoOcupacional: { is: processScope } },
      orderBy: [{ CreadoEn: 'desc' }, { DocumentoProcesoId: 'desc' }],
      select: {
        DocumentoProcesoId: true,
        NombreArchivo: true,
        TipoMime: true,
        TamanoBytes: true,
        FechaVencimiento: true,
        CreadoEn: true,
        TipoDocumento: { select: { Nombre: true } },
        EstadoDocumento: { select: { Nombre: true } },
        ProcesoOcupacional: {
          select: {
            Empresa: { select: { RazonSocial: true } },
            Candidato: {
              select: {
                Usuario: { select: { Nombres: true, Apellidos: true } },
              },
            },
          },
        },
      },
    });

    return documents.map((document) => ({
      id: document.DocumentoProcesoId.toString(),
      fileName: document.NombreArchivo,
      mimeType: document.TipoMime,
      sizeBytes: document.TamanoBytes.toString(),
      type: document.TipoDocumento.Nombre,
      status: document.EstadoDocumento.Nombre,
      createdAt: document.CreadoEn.toISOString(),
      expiresAt: document.FechaVencimiento?.toISOString().slice(0, 10) ?? null,
      candidateName:
        `${document.ProcesoOcupacional.Candidato.Usuario.Nombres} ${document.ProcesoOcupacional.Candidato.Usuario.Apellidos}`.trim(),
      company: document.ProcesoOcupacional.Empresa.RazonSocial,
    }));
  }
}

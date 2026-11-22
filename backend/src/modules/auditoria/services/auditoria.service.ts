import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const entries = await this.prisma.auditoria.findMany({
      orderBy: [{ Fecha: 'desc' }, { AuditoriaId: 'desc' }],
      take: 500,
      select: {
        AuditoriaId: true,
        Accion: true,
        Entidad: true,
        EntidadId: true,
        Detalle: true,
        DireccionIp: true,
        Fecha: true,
        Usuario: {
          select: { Nombres: true, Apellidos: true, Correo: true },
        },
      },
    });

    return entries.map((entry) => ({
      id: entry.AuditoriaId.toString(),
      actor: entry.Usuario
        ? `${entry.Usuario.Nombres} ${entry.Usuario.Apellidos}`.trim()
        : 'Usuario no disponible',
      email: entry.Usuario?.Correo ?? null,
      action: entry.Accion,
      entity: entry.Entidad,
      entityId: entry.EntidadId,
      detail: entry.Detalle,
      ipAddress: entry.DireccionIp,
      date: entry.Fecha.toISOString(),
    }));
  }
}

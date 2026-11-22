import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class NotificacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number) {
    const notifications = await this.prisma.notificacion.findMany({
      where: { UsuarioDestinatarioId: userId },
      orderBy: [{ ProgramadaEn: 'desc' }, { NotificacionId: 'desc' }],
      take: 100,
      select: {
        NotificacionId: true,
        TipoEvento: true,
        Asunto: true,
        Mensaje: true,
        ProgramadaEn: true,
        LeidaEn: true,
      },
    });

    return notifications.map((notification) => this.toListItem(notification));
  }

  async markAsRead(notificationId: string, userId: number) {
    if (!/^\d+$/.test(notificationId)) {
      throw new BadRequestException(
        'El identificador de notificación no es válido.',
      );
    }

    await this.prisma.notificacion.updateMany({
      where: {
        NotificacionId: BigInt(notificationId),
        UsuarioDestinatarioId: userId,
        LeidaEn: null,
      },
      data: { LeidaEn: new Date() },
    });

    const notification = await this.prisma.notificacion.findFirst({
      where: {
        NotificacionId: BigInt(notificationId),
        UsuarioDestinatarioId: userId,
      },
      select: {
        NotificacionId: true,
        TipoEvento: true,
        Asunto: true,
        Mensaje: true,
        ProgramadaEn: true,
        LeidaEn: true,
      },
    });

    if (!notification) {
      throw new NotFoundException('No se encontró esa notificación.');
    }

    return this.toListItem(notification);
  }

  private toListItem(notification: {
    NotificacionId: bigint;
    TipoEvento: string;
    Asunto: string | null;
    Mensaje: string;
    ProgramadaEn: Date;
    LeidaEn: Date | null;
  }) {
    return {
      id: notification.NotificacionId.toString(),
      event: notification.TipoEvento,
      title: notification.Asunto ?? 'Notificación de AgendaVital',
      message: notification.Mensaje,
      date: notification.ProgramadaEn.toISOString(),
      readAt: notification.LeidaEn?.toISOString() ?? null,
      read: notification.LeidaEn !== null,
    };
  }
}

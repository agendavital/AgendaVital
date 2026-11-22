import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CancelDisponibilidadDto } from '../dto/cancel-disponibilidad.dto';
import { CreateDisponibilidadDto } from '../dto/create-disponibilidad.dto';
import { DisponibilidadListItemDto } from '../dto/disponibilidad-list-item.dto';

@Injectable()
export class HorariosService {
  constructor(private readonly prisma: PrismaService) {}

  async findUpcoming(): Promise<DisponibilidadListItemDto[]> {
    const now = new Date();
    const availability = await this.prisma.disponibilidad.findMany({
      where: { InicioEn: { gte: now } },
      orderBy: { InicioEn: 'asc' },
      take: 200,
      select: {
        DisponibilidadId: true,
        ClinicaId: true,
        InicioEn: true,
        FinEn: true,
        Estado: true,
        Clinica: { select: { Nombre: true, Ciudad: true } },
      },
    });

    return availability.map((slot) => this.toListItem(slot));
  }

  async create(
    input: CreateDisponibilidadDto,
  ): Promise<DisponibilidadListItemDto> {
    const start = new Date(input.inicioEn);
    const end = new Date(input.finEn);
    const now = new Date();
    const duration = end.getTime() - start.getTime();

    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
      throw new BadRequestException('La fecha y hora no son válidas.');
    }
    if (start <= now) {
      throw new BadRequestException('El horario debe comenzar en el futuro.');
    }
    if (duration < 15 * 60 * 1000 || duration > 8 * 60 * 60 * 1000) {
      throw new BadRequestException(
        'La duración del horario debe estar entre 15 minutos y 8 horas.',
      );
    }

    try {
      const slot = await this.prisma.$transaction(
        async (transaction) => {
          const clinic = await transaction.clinica.findFirst({
            where: { ClinicaId: input.clinicaId, Activa: true },
            select: { ClinicaId: true },
          });
          if (!clinic) {
            throw new NotFoundException('No se encontró una clínica activa.');
          }

          const overlap = await transaction.disponibilidad.findFirst({
            where: {
              ClinicaId: input.clinicaId,
              Estado: { not: 'CANCELADA' },
              InicioEn: { lt: end },
              FinEn: { gt: start },
            },
            select: { DisponibilidadId: true },
          });
          if (overlap) {
            throw new ConflictException(
              'La clínica ya tiene un horario que se cruza con ese intervalo.',
            );
          }

          return transaction.disponibilidad.create({
            data: {
              ClinicaId: input.clinicaId,
              InicioEn: start,
              FinEn: end,
            },
            select: {
              DisponibilidadId: true,
              ClinicaId: true,
              InicioEn: true,
              FinEn: true,
              Estado: true,
              Clinica: { select: { Nombre: true, Ciudad: true } },
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );

      return this.toListItem(slot);
    } catch (error) {
      const code = this.getPrismaCode(error);
      if (code === 'P2002' || code === 'P2034') {
        throw new ConflictException(
          'No se pudo reservar ese intervalo porque cambió la disponibilidad. Recarga e inténtalo de nuevo.',
        );
      }
      throw error;
    }
  }

  async cancel(input: CancelDisponibilidadDto): Promise<void> {
    const id = BigInt(input.id);
    const result = await this.prisma.disponibilidad.updateMany({
      where: {
        DisponibilidadId: id,
        Estado: 'DISPONIBLE',
        Cita: { is: null },
      },
      data: { Estado: 'CANCELADA' },
    });

    if (result.count === 1) return;

    const slot = await this.prisma.disponibilidad.findUnique({
      where: { DisponibilidadId: id },
      select: { DisponibilidadId: true },
    });
    if (!slot) throw new NotFoundException('No se encontró el horario.');
    else {
      throw new ConflictException(
        'Solo se pueden cancelar horarios disponibles que no tengan una cita.',
      );
    }
  }

  private getPrismaCode(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return undefined;
    }
    const code = error.code;
    return typeof code === 'string' ? code : undefined;
  }

  private toListItem(slot: {
    DisponibilidadId: bigint;
    ClinicaId: number;
    InicioEn: Date;
    FinEn: Date;
    Estado: string;
    Clinica: { Nombre: string; Ciudad: string | null };
  }): DisponibilidadListItemDto {
    return {
      id: slot.DisponibilidadId.toString(),
      clinicaId: slot.ClinicaId,
      clinica: slot.Clinica.Nombre,
      ciudad: slot.Clinica.Ciudad,
      inicioEn: slot.InicioEn.toISOString(),
      finEn: slot.FinEn.toISOString(),
      estado: slot.Estado,
    };
  }
}

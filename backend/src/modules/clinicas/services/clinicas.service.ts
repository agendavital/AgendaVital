import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { ClinicaListItemDto } from '../dto/clinica-list-item.dto';
import { CreateClinicaDto } from '../dto/create-clinica.dto';
import { UpdateClinicaStatusDto } from '../dto/update-clinica-status.dto';

@Injectable()
export class ClinicasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ClinicaListItemDto[]> {
    const clinics = await this.prisma.clinica.findMany({
      orderBy: [{ Ciudad: 'asc' }, { Nombre: 'asc' }],
      select: {
        ClinicaId: true,
        Nit: true,
        Nombre: true,
        Direccion: true,
        Ciudad: true,
        Correo: true,
        Telefono: true,
        Activa: true,
      },
    });

    return clinics.map((clinic) => this.toListItem(clinic));
  }

  async create(input: CreateClinicaDto): Promise<ClinicaListItemDto> {
    try {
      const clinic = await this.prisma.clinica.create({
        data: {
          Nit: input.nit.trim(),
          Nombre: input.nombre.trim(),
          Direccion: input.direccion?.trim() || null,
          Ciudad: input.ciudad?.trim() || null,
          Correo: input.correo?.trim().toLowerCase() || null,
          Telefono: input.telefono?.trim() || null,
        },
        select: {
          ClinicaId: true,
          Nit: true,
          Nombre: true,
          Direccion: true,
          Ciudad: true,
          Correo: true,
          Telefono: true,
          Activa: true,
        },
      });

      return this.toListItem(clinic);
    } catch (error) {
      if (this.getPrismaCode(error) === 'P2002') {
        throw new ConflictException('Ya existe una clínica con ese NIT.');
      }
      throw error;
    }
  }

  async updateStatus(
    id: number,
    input: UpdateClinicaStatusDto,
  ): Promise<ClinicaListItemDto> {
    const result = await this.prisma.clinica.updateMany({
      where: { ClinicaId: id },
      data: { Activa: input.activa },
    });

    if (result.count !== 1) {
      throw new NotFoundException('No se encontró la clínica.');
    }

    const clinic = await this.prisma.clinica.findUniqueOrThrow({
      where: { ClinicaId: id },
      select: {
        ClinicaId: true,
        Nit: true,
        Nombre: true,
        Direccion: true,
        Ciudad: true,
        Correo: true,
        Telefono: true,
        Activa: true,
      },
    });

    return this.toListItem(clinic);
  }

  private getPrismaCode(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return undefined;
    }
    const code = error.code;
    return typeof code === 'string' ? code : undefined;
  }

  private toListItem(clinic: {
    ClinicaId: number;
    Nit: string;
    Nombre: string;
    Direccion: string | null;
    Ciudad: string | null;
    Correo: string | null;
    Telefono: string | null;
    Activa: boolean;
  }): ClinicaListItemDto {
    return {
      id: clinic.ClinicaId,
      nit: clinic.Nit,
      nombre: clinic.Nombre,
      direccion: clinic.Direccion,
      ciudad: clinic.Ciudad,
      correo: clinic.Correo,
      telefono: clinic.Telefono,
      activa: clinic.Activa,
    };
  }
}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateProcessDto } from '../dto/create-process.dto';
import { ProcessListItemDto } from '../dto/process-list-item.dto';

@Injectable()
export class ProcessesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number, role: string): Promise<ProcessListItemDto[]> {
    const authUser = await this.prisma.usuario.findUnique({
      where: { UsuarioId: userId },
      select: { EmpresaId: true },
    });
    if (!authUser) return [];

    const where =
      role === 'ADMIN'
        ? {}
        : role === 'HR' && authUser.EmpresaId
          ? { EmpresaId: authUser.EmpresaId }
          : { EmpresaId: -1 };

    const processes = await this.prisma.procesoOcupacional.findMany({
      where,
      orderBy: [{ FechaInicio: 'desc' }, { ProcesoOcupacionalId: 'desc' }],
      select: {
        ProcesoOcupacionalId: true,
        FechaInicio: true,
        FechaCierre: true,
        Candidato: {
          select: {
            TipoDocumento: true,
            NumeroDocumento: true,
            Usuario: {
              select: { Nombres: true, Apellidos: true },
            },
          },
        },
        Empresa: { select: { RazonSocial: true } },
        EstadoProceso: { select: { Nombre: true } },
      },
    });

    return processes.map((process) => ({
      id: process.ProcesoOcupacionalId.toString(),
      candidateName:
        `${process.Candidato.Usuario.Nombres} ${process.Candidato.Usuario.Apellidos}`.trim(),
      documentType: process.Candidato.TipoDocumento,
      documentNumber: process.Candidato.NumeroDocumento,
      company: process.Empresa.RazonSocial,
      status: process.EstadoProceso.Nombre,
      startDate: process.FechaInicio.toISOString().slice(0, 10),
      closeDate: process.FechaCierre?.toISOString().slice(0, 10) ?? null,
    }));
  }

  async getFormOptions(userId: number, role: string) {
    const authUser = await this.prisma.usuario.findUnique({
      where: { UsuarioId: userId },
      select: { EmpresaId: true },
    });
    if (!authUser) return { candidates: [], companies: [] };

    const candidateWhere =
      role === 'HR'
        ? authUser.EmpresaId
          ? {
              OR: [
                { ProcesoOcupacional: { none: {} } },
                {
                  ProcesoOcupacional: {
                    some: { EmpresaId: authUser.EmpresaId },
                  },
                },
              ],
            }
          : { CandidatoId: -1 }
        : {};
    const companyWhere =
      role === 'HR'
        ? { EmpresaId: authUser.EmpresaId ?? -1, Activa: true }
        : { Activa: true };
    const [candidates, companies] = await Promise.all([
      this.prisma.candidato.findMany({
        where: {
          ...candidateWhere,
          Usuario: { is: { Activo: true } },
        },
        select: {
          CandidatoId: true,
          TipoDocumento: true,
          NumeroDocumento: true,
          Usuario: {
            select: { Nombres: true, Apellidos: true },
          },
        },
      }),
      this.prisma.empresa.findMany({
        where: companyWhere,
        select: {
          EmpresaId: true,
          Nit: true,
          RazonSocial: true,
        },
        orderBy: { RazonSocial: 'asc' },
      }),
    ]);

    return {
      candidates: candidates.map((candidate) => ({
        id: candidate.CandidatoId,
        fullName:
          `${candidate.Usuario.Nombres} ${candidate.Usuario.Apellidos}`.trim(),
        documentType: candidate.TipoDocumento,
        documentNumber: candidate.NumeroDocumento,
      })),
      companies: companies.map((company) => ({
        id: company.EmpresaId,
        nit: company.Nit,
        name: company.RazonSocial,
      })),
    };
  }

  async create(input: CreateProcessDto, createdByUserId: number) {
    const creator = await this.prisma.usuario.findUnique({
      where: { UsuarioId: createdByUserId },
      select: {
        EmpresaId: true,
        UsuarioRol: { select: { Rol: { select: { Codigo: true } } } },
      },
    });
    const isAdmin = creator?.UsuarioRol.some(({ Rol }) =>
      ['ADMINISTRADOR', 'ADMIN'].includes(Rol.Codigo),
    );
    if (!creator) throw new NotFoundException('No se encontró el usuario.');
    if (
      !isAdmin &&
      (!creator.EmpresaId || creator.EmpresaId !== input.companyId)
    ) {
      throw new NotFoundException(
        'No se encontró la empresa asignada a tu perfil.',
      );
    }
    const [candidate, company, initialState] = await Promise.all([
      this.prisma.candidato.findUnique({
        where: { CandidatoId: input.candidateId },
        select: { CandidatoId: true },
      }),
      this.prisma.empresa.findUnique({
        where: { EmpresaId: input.companyId },
        select: { EmpresaId: true, Activa: true },
      }),
      this.prisma.estadoProceso.findUnique({
        where: { Codigo: 'PENDIENTE' },
        select: { EstadoProcesoId: true },
      }),
    ]);

    if (!candidate) {
      throw new NotFoundException('No se encontró el candidato.');
    }

    if (!company) {
      throw new NotFoundException('No se encontró la empresa.');
    }

    if (!company.Activa) {
      throw new BadRequestException('La empresa seleccionada está inactiva.');
    }

    if (!initialState) {
      throw new InternalServerErrorException(
        'No está configurado el estado inicial PENDIENTE.',
      );
    }

    const process = await this.prisma.procesoOcupacional.create({
      data: {
        CandidatoId: input.candidateId,
        EmpresaId: input.companyId,
        EstadoProcesoId: initialState.EstadoProcesoId,
        CreadoPorUsuarioId: createdByUserId,
      },
      select: {
        ProcesoOcupacionalId: true,
        FechaInicio: true,
        Candidato: {
          select: {
            Usuario: {
              select: { Nombres: true, Apellidos: true },
            },
          },
        },
        Empresa: { select: { RazonSocial: true } },
        EstadoProceso: { select: { Nombre: true } },
      },
    });

    return {
      id: process.ProcesoOcupacionalId.toString(),
      candidateName:
        `${process.Candidato.Usuario.Nombres} ${process.Candidato.Usuario.Apellidos}`.trim(),
      company: process.Empresa.RazonSocial,
      status: process.EstadoProceso.Nombre,
      startDate: process.FechaInicio,
    };
  }
}

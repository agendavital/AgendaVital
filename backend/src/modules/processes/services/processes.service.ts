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

  async findAll(): Promise<ProcessListItemDto[]> {
    const processes = await this.prisma.procesoOcupacional.findMany({
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

  async getFormOptions() {
    const [candidates, companies] = await Promise.all([
      this.prisma.candidato.findMany({
        where: { Usuario: { is: { Activo: true } } },
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
        where: { Activa: true },
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

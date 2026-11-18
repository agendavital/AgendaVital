import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { hash } from 'bcryptjs';
import { AuthService } from '../../../auth/auth.service';
import { CreateCandidateDto } from '../dto/create-candidate.dto';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CandidateListItemDto } from '../dto/candidate-list-item.dto';

@Injectable()
export class CandidatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async create(input: CreateCandidateDto): Promise<CandidateListItemDto> {
    const email = input.email.trim().toLowerCase();
    const documentType = input.documentType.trim().toUpperCase();
    const documentNumber = input.documentNumber.trim();
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();

    const existingUser = await this.prisma.usuario.findUnique({
      where: { Correo: email },
      select: { UsuarioId: true },
    });

    if (existingUser) {
      throw new ConflictException('Ya existe una cuenta con ese correo.');
    }

    const existingCandidate = await this.prisma.candidato.findFirst({
      where: { TipoDocumento: documentType, NumeroDocumento: documentNumber },
      select: { CandidatoId: true },
    });

    if (existingCandidate) {
      throw new ConflictException(
        'Ya existe un candidato con ese tipo y número de documento.',
      );
    }

    const candidateRole = await this.prisma.rol.findUnique({
      where: { Codigo: 'CANDIDATO' },
      select: { RolId: true },
    });

    if (!candidateRole) {
      throw new InternalServerErrorException(
        'No está configurado el rol CANDIDATO.',
      );
    }

    const passwordHash = await hash(randomBytes(32).toString('hex'), 12);

    let candidateId: number;

    try {
      candidateId = await this.prisma.$transaction(async (transaction) => {
        const usuario = await transaction.usuario.create({
          data: {
            Correo: email,
            HashContrasena: passwordHash,
            Nombres: firstName,
            Apellidos: lastName,
          },
          select: { UsuarioId: true },
        });

        const candidato = await transaction.candidato.create({
          data: {
            UsuarioId: usuario.UsuarioId,
            TipoDocumento: documentType,
            NumeroDocumento: documentNumber,
          },
        });

        await transaction.usuarioRol.create({
          data: {
            UsuarioId: usuario.UsuarioId,
            RolId: candidateRole.RolId,
          },
        });

        return candidato.CandidatoId;
      });
    } catch (error) {
      const errorCode =
        typeof error === 'object' && error !== null
          ? (error as { code?: unknown }).code
          : undefined;

      if (errorCode === 'P2002') {
        throw new ConflictException(
          'Ya existe una cuenta o candidato con esos datos.',
        );
      }

      throw error;
    }

    await this.authService.requestPasswordRecovery({ email });

    return {
      id: candidateId,
      fullName: `${firstName} ${lastName}`.trim(),
      documentType,
      documentNumber,
      email,
      company: null,
      status: null,
      concept: null,
    };
  }

  async findAll(): Promise<CandidateListItemDto[]> {
    const candidates = await this.prisma.candidato.findMany({
      orderBy: { CreadoEn: 'desc' },
      select: {
        CandidatoId: true,
        TipoDocumento: true,
        NumeroDocumento: true,
        Usuario: {
          select: {
            Nombres: true,
            Apellidos: true,
            Correo: true,
          },
        },
        ProcesoOcupacional: {
          orderBy: { FechaInicio: 'desc' },
          take: 1,
          select: {
            Empresa: {
              select: { RazonSocial: true },
            },
            EstadoProceso: {
              select: { Nombre: true },
            },
            SolicitudExamen: {
              orderBy: { SolicitadaEn: 'desc' },
              take: 1,
              select: {
                Cita: {
                  select: {
                    EvaluacionOcupacional: {
                      select: {
                        ConceptoOcupacional: {
                          select: { Nombre: true },
                        },
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

    return candidates.map((candidate) => {
      const latestProcess = candidate.ProcesoOcupacional[0];
      const latestRequest = latestProcess?.SolicitudExamen[0];

      return {
        id: candidate.CandidatoId,
        fullName:
          `${candidate.Usuario.Nombres} ${candidate.Usuario.Apellidos}`.trim(),
        documentType: candidate.TipoDocumento,
        documentNumber: candidate.NumeroDocumento,
        email: candidate.Usuario.Correo,
        company: latestProcess?.Empresa.RazonSocial ?? null,
        status: latestProcess?.EstadoProceso.Nombre ?? null,
        concept:
          latestRequest?.Cita?.EvaluacionOcupacional?.ConceptoOcupacional
            ?.Nombre ?? null,
      };
    });
  }
}

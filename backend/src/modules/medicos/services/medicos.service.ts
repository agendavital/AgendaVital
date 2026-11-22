import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { hash } from 'bcryptjs';
import { AuthService } from '../../../auth/auth.service';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateMedicoDto } from '../dto/create-medico.dto';
import { MedicoListItemDto } from '../dto/medico-list-item.dto';

@Injectable()
export class MedicosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async getFormOptions() {
    const clinics = await this.prisma.clinica.findMany({
      where: { Activa: true },
      orderBy: [{ Ciudad: 'asc' }, { Nombre: 'asc' }],
      select: { ClinicaId: true, Nombre: true, Ciudad: true },
    });

    return clinics.map((clinic) => ({
      id: clinic.ClinicaId,
      nombre: clinic.Nombre,
      ciudad: clinic.Ciudad,
    }));
  }

  async findAll(): Promise<MedicoListItemDto[]> {
    const professionals = await this.prisma.profesional.findMany({
      orderBy: [
        { Clinica: { Nombre: 'asc' } },
        { Usuario: { Apellidos: 'asc' } },
      ],
      select: {
        ProfesionalId: true,
        RegistroProfesional: true,
        Especialidad: true,
        Activo: true,
        Clinica: { select: { Nombre: true } },
        Usuario: {
          select: {
            Nombres: true,
            Apellidos: true,
            Correo: true,
          },
        },
      },
    });

    return professionals.map((professional) => ({
      id: professional.ProfesionalId,
      nombres: professional.Usuario.Nombres,
      apellidos: professional.Usuario.Apellidos,
      correo: professional.Usuario.Correo,
      registroProfesional: professional.RegistroProfesional,
      especialidad: professional.Especialidad,
      clinica: professional.Clinica.Nombre,
      activo: professional.Activo,
    }));
  }

  async create(input: CreateMedicoDto) {
    const email = input.correo.trim().toLowerCase();
    const [existingUser, clinic, doctorRole] = await Promise.all([
      this.prisma.usuario.findUnique({
        where: { Correo: email },
        select: { UsuarioId: true },
      }),
      this.prisma.clinica.findFirst({
        where: { ClinicaId: input.clinicaId, Activa: true },
        select: { ClinicaId: true },
      }),
      this.prisma.rol.findFirst({
        where: { Codigo: { in: ['MEDICO', 'DOCTOR', 'PROFESIONAL'] } },
        orderBy: { RolId: 'asc' },
        select: { RolId: true },
      }),
    ]);

    if (existingUser) {
      throw new ConflictException(
        'Ya existe una cuenta con ese correo electrónico.',
      );
    }
    if (!clinic)
      throw new NotFoundException('No se encontró una clínica activa.');
    if (!doctorRole) {
      throw new InternalServerErrorException(
        'No está configurado el rol MEDICO en la base de datos.',
      );
    }

    const passwordHash = await hash(randomBytes(32).toString('hex'), 12);
    try {
      await this.prisma.$transaction(async (transaction) => {
        const user = await transaction.usuario.create({
          data: {
            Correo: email,
            HashContrasena: passwordHash,
            Nombres: input.nombres.trim(),
            Apellidos: input.apellidos.trim(),
            ClinicaId: clinic.ClinicaId,
          },
          select: { UsuarioId: true },
        });

        await transaction.profesional.create({
          data: {
            UsuarioId: user.UsuarioId,
            ClinicaId: clinic.ClinicaId,
            RegistroProfesional: input.registroProfesional.trim(),
            Especialidad: input.especialidad?.trim() || null,
          },
        });

        await transaction.usuarioRol.create({
          data: { UsuarioId: user.UsuarioId, RolId: doctorRole.RolId },
        });
      });
    } catch (error) {
      if (this.getPrismaCode(error) === 'P2002') {
        throw new ConflictException(
          'Ya existe una cuenta o un perfil profesional con esos datos.',
        );
      }
      throw error;
    }

    let activationEmailSent = true;
    try {
      await this.authService.requestPasswordRecovery({ email });
    } catch {
      activationEmailSent = false;
    }

    const professional = await this.prisma.profesional.findUniqueOrThrow({
      where: { RegistroProfesional: input.registroProfesional.trim() },
      select: {
        ProfesionalId: true,
        RegistroProfesional: true,
        Especialidad: true,
        Activo: true,
        Clinica: { select: { Nombre: true } },
        Usuario: { select: { Nombres: true, Apellidos: true, Correo: true } },
      },
    });

    return {
      ...this.toListItem(professional),
      activationEmailSent,
    };
  }

  private getPrismaCode(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return undefined;
    }
    return typeof error.code === 'string' ? error.code : undefined;
  }

  private toListItem(professional: {
    ProfesionalId: number;
    RegistroProfesional: string;
    Especialidad: string | null;
    Activo: boolean;
    Clinica: { Nombre: string };
    Usuario: { Nombres: string; Apellidos: string; Correo: string };
  }): MedicoListItemDto {
    return {
      id: professional.ProfesionalId,
      nombres: professional.Usuario.Nombres,
      apellidos: professional.Usuario.Apellidos,
      correo: professional.Usuario.Correo,
      registroProfesional: professional.RegistroProfesional,
      especialidad: professional.Especialidad,
      clinica: professional.Clinica.Nombre,
      activo: professional.Activo,
    };
  }
}

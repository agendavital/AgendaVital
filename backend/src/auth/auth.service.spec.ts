import { UnauthorizedException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from '../database/prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const prisma = {
    usuario: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-with-at-least-32-characters';
    service = new AuthService(prisma as unknown as PrismaService);
  });

  it('inicia sesion con un usuario activo y un hash BCrypt valido', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      UsuarioId: 7,
      Correo: 'admin@agendavital.com',
      HashContrasena: await hash('Admin123', 4),
      Nombres: 'Ana',
      Apellidos: 'Torres',
      Activo: true,
      UsuarioRol: [{ Rol: { Codigo: 'ADMINISTRADOR' } }],
    });
    prisma.usuario.update.mockResolvedValue({});

    const session = await service.login({
      email: 'ADMIN@agendavital.com',
      password: 'Admin123',
    });

    expect(session.user).toEqual({
      id: 7,
      name: 'Ana Torres',
      email: 'admin@agendavital.com',
      role: 'ADMIN',
    });
    expect(session.token.split('.')).toHaveLength(3);
    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { UsuarioId: 7 },
      data: { UltimoAccesoEn: expect.any(Date) as Date },
    });
  });

  it('rechaza una contrasena incorrecta', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      UsuarioId: 7,
      Correo: 'admin@agendavital.com',
      HashContrasena: await hash('Admin123', 4),
      Nombres: 'Ana',
      Apellidos: 'Torres',
      Activo: true,
      UsuarioRol: [{ Rol: { Codigo: 'ADMIN' } }],
    });

    await expect(
      service.login({
        email: 'admin@agendavital.com',
        password: 'Incorrecta123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

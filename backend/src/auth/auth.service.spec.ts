import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { PrismaService } from '../database/prisma/prisma.service';
import { JwtAuthGuard } from './JwtAuthGuard';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const prisma = {
    usuario: {
      findUnique: jest.fn<() => Promise<unknown>>(),
      update:
        jest.fn<
          (args: {
            where: { UsuarioId: number };
            data: Record<string, unknown>;
          }) => Promise<unknown>
        >(),
    },
  };
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-with-at-least-32-characters';
    process.env.RECAPTCHA_PROJECT_ID = 'test-project';
    process.env.RECAPTCHA_SITE_KEY = 'test-site-key';
    process.env.RECAPTCHA_API_KEY = 'test-api-key';
    process.env.RECAPTCHA_ALLOWED_HOSTNAMES = 'localhost';
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          tokenProperties: {
            valid: true,
            hostname: 'localhost',
          },
        }),
    } as Response);
    service = new AuthService(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
      captchaToken: 'test-recaptcha-token',
    });

    expect(session.user).toEqual({
      id: 7,
      name: 'Ana Torres',
      email: 'admin@agendavital.com',
      role: 'ADMIN',
    });
    expect(session.token.split('.')).toHaveLength(3);

    const request: {
      method: string;
      headers: { cookie: string };
      user?: { sub: number; role: string };
    } = {
      method: 'GET',
      headers: { cookie: `agenda_vital_session=${session.token}` },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    expect(new JwtAuthGuard().canActivate(context)).toBe(true);
    expect(request.user).toMatchObject({ sub: 7, role: 'ADMIN' });
    expect(prisma.usuario.update).toHaveBeenCalledTimes(1);
    const updateCall = prisma.usuario.update.mock.calls[0]?.[0];
    expect(updateCall?.where.UsuarioId).toBe(7);
    expect(updateCall?.data.UltimoAccesoEn).toBeInstanceOf(Date);
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
        captchaToken: 'test-recaptcha-token',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

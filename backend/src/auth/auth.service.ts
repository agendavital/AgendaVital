import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { compare } from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../database/prisma/prisma.service';

const SESSION_DURATION_SECONDS = 60 * 60;

const roleAliases: Record<string, string> = {
  ADMIN: 'ADMIN',
  ADMINISTRADOR: 'ADMIN',
  HR: 'HR',
  RRHH: 'HR',
  RECURSOS_HUMANOS: 'HR',
  CLINIC: 'CLINIC',
  CLINICA: 'CLINIC',
  DOCTOR: 'DOCTOR',
  MEDICO: 'DOCTOR',
  PROFESIONAL: 'DOCTOR',
  CANDIDATE: 'CANDIDATE',
  CANDIDATO: 'CANDIDATE',
};

const rolePriority = ['ADMIN', 'HR', 'CLINIC', 'DOCTOR', 'CANDIDATE'];

type LoginInput = {
  email?: unknown;
  password?: unknown;
  captchaToken?: unknown;
};

type RecoveryInput = {
  email?: unknown;
};

type GoogleLoginInput = {
  credential?: unknown;
};

type UsuarioConRoles = {
  UsuarioId: number;
  Correo: string;
  Nombres: string;
  Apellidos: string;
  Activo: boolean;
  UsuarioRol: Array<{
    Rol: {
      Codigo: string;
    };
  }>;
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly googleClient = new OAuth2Client();

  async login(input: LoginInput) {
    await this.verifyRecaptcha(input.captchaToken);

    const email = this.readEmail(input.email);
    const password = this.readPassword(input.password);

    const usuario = await this.prisma.usuario.findUnique({
      where: { Correo: email },
      include: {
        UsuarioRol: {
          include: { Rol: true },
        },
      },
    });

    if (!usuario || !usuario.Activo) {
      throw new UnauthorizedException('Correo o contrasena incorrectos.');
    }

    const passwordMatches = await compare(password, usuario.HashContrasena);
    if (!passwordMatches) {
      throw new UnauthorizedException('Correo o contrasena incorrectos.');
    }

    return this.createSession(usuario);
  }

  async loginWithGoogle(input: GoogleLoginInput) {
    const credential = this.readGoogleCredential(input.credential);
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      throw new InternalServerErrorException(
        'GOOGLE_CLIENT_ID no esta configurado en el backend.',
      );
    }

    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('La credencial de Google no es valida.');
    }

    const email = payload?.email?.trim().toLowerCase();
    if (!email || payload?.email_verified !== true) {
      throw new UnauthorizedException(
        'No se pudo verificar el correo de Google.',
      );
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { Correo: email },
      include: {
        UsuarioRol: {
          include: { Rol: true },
        },
      },
    });

    if (!usuario || !usuario.Activo) {
      throw new UnauthorizedException(
        'No existe una cuenta activa de AgendaVital con ese correo.',
      );
    }

    return this.createSession(usuario);
  }

  requestPasswordRecovery(input: RecoveryInput) {
    this.readEmail(input.email);

    return {
      message:
        'Si el correo existe, recibira instrucciones para recuperar la contrasena.',
    };
  }

  private async verifyRecaptcha(value: unknown): Promise<void> {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new UnauthorizedException('Completa la verificación reCAPTCHA.');
    }

    const projectId = process.env.RECAPTCHA_PROJECT_ID;
    const siteKey = process.env.RECAPTCHA_SITE_KEY;
    const apiKey = process.env.RECAPTCHA_API_KEY;
    const allowedHostnames = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES ?? '')
      .split(',')
      .map((hostname) => hostname.trim().toLowerCase())
      .filter(Boolean);

    if (!projectId || !siteKey || !apiKey || allowedHostnames.length === 0) {
      throw new InternalServerErrorException(
        'La verificación reCAPTCHA no esta configurada en el backend.',
      );
    }

    const url = new URL(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/assessments`,
    );
    url.searchParams.set('key', apiKey);

    type Assessment = {
      tokenProperties?: {
        valid?: boolean;
        hostname?: string;
      };
    };

    let assessment: Assessment;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          event: {
            token: value.trim(),
            siteKey,
          },
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: { status?: string; message?: string };
        } | null;

        console.error(
          '[reCAPTCHA Google API]',
          response.status,
          body?.error?.status,
          body?.error?.message,
        );

        throw new Error('Google rechazo la evaluación');
      }

      assessment = (await response.json()) as Assessment;
    } catch {
      throw new InternalServerErrorException(
        'No se pudo validar reCAPTCHA con Google.',
      );
    }
    const tokenProperties = assessment.tokenProperties;
    const hostname = tokenProperties?.hostname?.toLowerCase();

    if (
      tokenProperties?.valid !== true ||
      !hostname ||
      !allowedHostnames.includes(hostname)
    ) {
      throw new UnauthorizedException(
        'La verificación reCAPTCHA no es valida.',
      );
    }
  }

  private readEmail(value: unknown) {
    if (typeof value !== 'string') {
      throw new BadRequestException('El correo es obligatorio.');
    }

    const email = value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('El correo no es valido.');
    }

    return email;
  }

  private readPassword(value: unknown) {
    if (typeof value !== 'string' || value.length < 6) {
      throw new BadRequestException(
        'La contrasena debe tener al menos 6 caracteres.',
      );
    }

    return value;
  }

  private readGoogleCredential(value: unknown) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException('La credencial de Google es obligatoria.');
    }

    return value.trim();
  }

  private async createSession(usuario: UsuarioConRoles) {
    const roles = usuario.UsuarioRol.map(
      ({ Rol }) => roleAliases[Rol.Codigo.trim().toUpperCase()],
    ).filter((role): role is string => Boolean(role));

    const role = rolePriority.find((candidate) => roles.includes(candidate));

    if (!role) {
      throw new UnauthorizedException('El usuario no tiene un rol habilitado.');
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = (now + SESSION_DURATION_SECONDS) * 1000;
    const user = {
      id: usuario.UsuarioId,
      name: `${usuario.Nombres} ${usuario.Apellidos}`.trim(),
      email: usuario.Correo,
      role,
    };

    await this.prisma.usuario.update({
      where: { UsuarioId: usuario.UsuarioId },
      data: { UltimoAccesoEn: new Date() },
    });

    return {
      token: this.createAccessToken({ sub: usuario.UsuarioId, role, iat: now }),
      user,
      expiresAt,
    };
  }

  private createAccessToken(payload: Record<string, string | number>) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no esta configurado en el backend.');
    }

    const header = this.toBase64Url({ alg: 'HS256', typ: 'JWT' });
    const body = this.toBase64Url({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
    });
    const signature = createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');

    return `${header}.${body}.${signature}`;
  }

  private toBase64Url(value: object) {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }
}

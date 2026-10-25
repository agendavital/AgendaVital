import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';

type JwtPayload = {
  sub: number;
  role: string;
  iat: number;
  exp: number;
};

type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

const VALID_ROLES = new Set(['ADMIN', 'HR', 'CLINIC', 'DOCTOR', 'CANDIDATE']);
const MAX_TOKEN_LENGTH = 8192;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;
    const match = authorization?.match(/^Bearer\s+(\S+)$/i);

    if (!match) {
      throw new UnauthorizedException('Se requiere un token de acceso.');
    }

    const token = match[1];
    const parts = token.split('.');

    if (
      token.length > MAX_TOKEN_LENGTH ||
      parts.length !== 3 ||
      parts.some((part) => !part) ||
      parts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part))
    ) {
      throw new UnauthorizedException('El token no es valido.');
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new InternalServerErrorException('JWT_SECRET no esta configurado.');
    }

    const expectedSignature = createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest();

    const providedSignature = Buffer.from(encodedSignature, 'base64url');

    if (
      providedSignature.length !== expectedSignature.length ||
      providedSignature.toString('base64url') !== encodedSignature ||
      !timingSafeEqual(providedSignature, expectedSignature)
    ) {
      throw new UnauthorizedException('La firma del token no es valida.');
    }

    let header: unknown;
    let payload: unknown;

    try {
      header = JSON.parse(
        Buffer.from(encodedHeader, 'base64url').toString('utf8'),
      );
      payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      );
    } catch {
      throw new UnauthorizedException('El contenido del token no es valido.');
    }

    if (!isObject(header) || header.alg !== 'HS256' || header.typ !== 'JWT') {
      throw new UnauthorizedException('El algoritmo del token no es valido.');
    }

    if (
      !isObject(payload) ||
      typeof payload.sub !== 'number' ||
      !Number.isSafeInteger(payload.sub) ||
      payload.sub <= 0 ||
      typeof payload.role !== 'string' ||
      !VALID_ROLES.has(payload.role) ||
      typeof payload.iat !== 'number' ||
      !Number.isSafeInteger(payload.iat) ||
      typeof payload.exp !== 'number' ||
      !Number.isSafeInteger(payload.exp) ||
      payload.exp <= payload.iat
    ) {
      throw new UnauthorizedException('Los datos del token no son validos.');
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.iat > now + 60) {
      throw new UnauthorizedException('La fecha del token no es valida.');
    }

    if (payload.exp <= now) {
      throw new UnauthorizedException('El token ha expirado.');
    }

    request.user = payload as JwtPayload;

    return true;
  }
}

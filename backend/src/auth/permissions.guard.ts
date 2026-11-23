import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../database/prisma/prisma.service';
import { PERMISSIONS_KEY } from './permissions.decorator';

const ADMIN_ONLY_PERMISSIONS = new Set([
  'access-control:manage',
  'audit:read',
  'clinic-management:manage',
  'medical-staff:manage',
]);
const ROLE_LIMITED_PERMISSIONS: Record<string, Set<string>> = {
  'candidates:create': new Set(['ADMIN', 'HR']),
  'processes:create': new Set(['ADMIN', 'HR']),
  'exam-requests:create': new Set(['ADMIN', 'HR']),
  'appointments:create': new Set(['ADMIN', 'HR']),
  'medical-results:create': new Set(['ADMIN', 'DOCTOR']),
  'candidate-portal:read': new Set(['CANDIDATE']),
};

type AuthenticatedRequest = Request & {
  user?: { sub: number; role: string };
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const session = request.user;
    if (!session?.sub)
      throw new ForbiddenException('No se encontró la sesión.');
    const userId = session.sub;

    const assignments = await this.prisma.usuarioRol.findMany({
      where: { UsuarioId: userId },
      select: {
        Rol: {
          select: {
            RolPermiso: {
              select: { Permiso: { select: { Codigo: true } } },
            },
          },
        },
      },
    });
    const granted = new Set(
      assignments.flatMap((assignment) =>
        assignment.Rol.RolPermiso.map((entry) => entry.Permiso.Codigo),
      ),
    );
    if (session.role !== 'ADMIN') {
      for (const permission of ADMIN_ONLY_PERMISSIONS)
        granted.delete(permission);
    }

    const hasPolicyAccess = requiredPermissions.every((permission) => {
      const allowedRoles = ROLE_LIMITED_PERMISSIONS[permission];
      return !allowedRoles || allowedRoles.has(session.role);
    });
    if (
      !hasPolicyAccess ||
      !requiredPermissions.every((permission) => granted.has(permission))
    ) {
      throw new ForbiddenException(
        'Tu rol no tiene permiso para realizar esta acción.',
      );
    }

    return true;
  }
}

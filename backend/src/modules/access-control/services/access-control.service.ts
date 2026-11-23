import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

const ADMIN_ONLY_PERMISSIONS = [
  'access-control:manage',
  'audit:read',
  'clinic-management:manage',
  'medical-staff:manage',
];
const ROLE_PERMISSION_POLICIES: Record<string, string[]> = {
  'candidates:create': ['ADMINISTRADOR', 'ADMIN', 'RRHH', 'HR'],
  'processes:create': ['ADMINISTRADOR', 'ADMIN', 'RRHH', 'HR'],
  'exam-requests:create': ['ADMINISTRADOR', 'ADMIN', 'RRHH', 'HR'],
  'appointments:create': ['ADMINISTRADOR', 'ADMIN', 'RRHH', 'HR'],
  'medical-results:create': ['ADMINISTRADOR', 'ADMIN', 'MEDICO', 'DOCTOR'],
  'candidate-portal:read': ['CANDIDATO', 'CANDIDATE'],
};

@Injectable()
export class AccessControlService {
  constructor(private readonly prisma: PrismaService) {}

  async getRoleMatrix() {
    const [roles, permissions] = await Promise.all([
      this.prisma.rol.findMany({
        orderBy: { RolId: 'asc' },
        select: {
          RolId: true,
          Codigo: true,
          Nombre: true,
          Descripcion: true,
          RolPermiso: { select: { Permiso: { select: { Codigo: true } } } },
        },
      }),
      this.prisma.permiso.findMany({
        orderBy: { Codigo: 'asc' },
        select: { Codigo: true, Nombre: true, Descripcion: true },
      }),
    ]);

    return {
      permissions,
      adminOnlyPermissions: ADMIN_ONLY_PERMISSIONS,
      rolePermissionPolicies: ROLE_PERMISSION_POLICIES,
      roles: roles.map((role) => ({
        id: role.RolId,
        code: role.Codigo,
        name: role.Nombre,
        description: role.Descripcion,
        permissions:
          role.Codigo === 'ADMINISTRADOR' || role.Codigo === 'ADMIN'
            ? permissions
                .map((permission) => permission.Codigo)
                .filter((code) => code !== 'candidate-portal:read')
            : role.RolPermiso.map(
                (assignment) => assignment.Permiso.Codigo,
              ).filter((code) => !ADMIN_ONLY_PERMISSIONS.includes(code)),
        locked: role.Codigo === 'ADMINISTRADOR' || role.Codigo === 'ADMIN',
      })),
    };
  }

  async updateRolePermissions(roleId: number, permissionCodes: string[]) {
    const role = await this.prisma.rol.findUnique({
      where: { RolId: roleId },
      select: { RolId: true, Codigo: true },
    });
    if (!role) throw new NotFoundException('No se encontró el rol.');
    if (role.Codigo === 'ADMINISTRADOR' || role.Codigo === 'ADMIN') {
      throw new BadRequestException(
        'Los permisos de Administración están protegidos.',
      );
    }
    if (permissionCodes.some((code) => ADMIN_ONLY_PERMISSIONS.includes(code))) {
      throw new BadRequestException(
        'Auditoría, permisos del sistema, clínicas y personal médico se reservan a Administración.',
      );
    }
    const disallowed = permissionCodes.filter((code) => {
      const allowedRoles = ROLE_PERMISSION_POLICIES[code];
      return allowedRoles && !allowedRoles.includes(role.Codigo);
    });
    if (disallowed.length) {
      throw new BadRequestException(
        `El rol ${role.Codigo} no puede recibir estos permisos: ${disallowed.join(', ')}.`,
      );
    }

    const permissions = await this.prisma.permiso.findMany({
      where: { Codigo: { in: permissionCodes } },
      select: { PermisoId: true, Codigo: true },
    });
    if (permissions.length !== permissionCodes.length) {
      throw new BadRequestException(
        'La matriz incluye permisos que no están configurados.',
      );
    }

    await this.prisma.$transaction(async (transaction) => {
      await transaction.rolPermiso.deleteMany({ where: { RolId: roleId } });
      for (const permission of permissions) {
        await transaction.rolPermiso.create({
          data: { RolId: roleId, PermisoId: permission.PermisoId },
        });
      }
    });

    return { roleId, permissions: permissions.map(({ Codigo }) => Codigo) };
  }
}

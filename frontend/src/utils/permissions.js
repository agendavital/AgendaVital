import { ROLES } from "../constants/roles";

export const permissionsByRole = {
  [ROLES.ADMIN]: ["users:manage", "roles:manage", "audit:read", "reports:read", "all:read"],
  [ROLES.HR]: ["candidates:manage", "appointments:create", "reports:read", "documents:read"],
  [ROLES.CLINIC]: ["appointments:manage", "doctors:manage", "documents:manage"],
  [ROLES.DOCTOR]: ["appointments:read", "medical-results:manage", "concepts:issue"],
  [ROLES.CANDIDATE]: ["profile:read", "documents:upload", "status:read"]
};

export function hasPermission(role, permission) {
  const permissions = permissionsByRole[role] ?? [];
  return permissions.includes(permission) || permissions.includes("all:read");
}

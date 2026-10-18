import { useAuth } from "./useAuth";
import { hasPermission } from "../utils/permissions";

export function usePermissions() {
  const { user } = useAuth();

  return {
    can: (permission) => Boolean(user?.role && hasPermission(user.role, permission))
  };
}

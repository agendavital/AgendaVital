import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants/routes";
import { MODULES } from "../constants/navigation";
import { hasPermission } from "../utils/permissions";

export default function RoleRoute({ requiredPermission, children }) {
  const { user } = useAuth();

  if (!user || !hasPermission(user, requiredPermission)) {
    const safeRoute = MODULES.find((module) => hasPermission(user, module.permission))?.to;
    return <Navigate to={safeRoute ?? ROUTES.login} replace />;
  }

  return children;
}

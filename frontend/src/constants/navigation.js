import { ROLES } from "./roles";
import { ROUTES } from "./routes";

export const MODULES = [
  {
    key: "dashboard",
    to: ROUTES.dashboard,
    label: "Panel",
    description: "Resumen y accesos según tu rol.",
    roles: Object.values(ROLES),
  },
  {
    key: "candidates",
    to: ROUTES.candidates,
    label: "Candidatos",
    description: "Consulta y gestiona los procesos de candidatos.",
    roles: [ROLES.ADMIN, ROLES.HR, ROLES.CLINIC],
  },
  {
    key: "appointments",
    to: ROUTES.appointments,
    label: "Citas",
    description: "Consulta la agenda de citas ocupacionales.",
    roles: [ROLES.ADMIN, ROLES.HR, ROLES.CLINIC, ROLES.DOCTOR],
  },
  {
    key: "audit",
    to: ROUTES.audit,
    label: "Auditoría",
    description: "Consulta el registro de actividad del sistema.",
    roles: [ROLES.ADMIN],
  },
  {
    key: "documents",
    to: ROUTES.documents,
    label: "Documentos",
    description: "Consulta el estado de los documentos registrados.",
    roles: [ROLES.ADMIN, ROLES.HR, ROLES.CLINIC],
  },
  {
    key: "medicalResults",
    to: ROUTES.medicalResults,
    label: "Resultados médicos",
    description: "Registra resultados y conceptos ocupacionales.",
    roles: [ROLES.DOCTOR],
  },
  {
    key: "reports",
    to: ROUTES.reports,
    label: "Reportes",
    description: "Consulta indicadores operativos disponibles.",
    roles: [ROLES.ADMIN, ROLES.HR],
  },
  {
    key: "notifications",
    to: ROUTES.notifications,
    label: "Notificaciones",
    description: "Consulta tus notificaciones.",
    roles: Object.values(ROLES),
  },
];

export const MODULE_ROLES = Object.fromEntries(
  MODULES.map(({ key, roles }) => [key, roles]),
);

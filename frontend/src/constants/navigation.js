import { ROUTES } from "./routes";

export const MODULES = [
  {
    key: "dashboard",
    to: ROUTES.dashboard,
    label: "Panel",
    description: "Resumen y accesos según tu rol.",
    permission: "dashboard:read",
  },
  {
    key: "candidates",
    to: ROUTES.candidates,
    label: "Candidatos",
    description: "Consulta y gestiona los procesos de candidatos.",
    permission: "candidates:read",
  },
  {
    key: "processes",
    to: ROUTES.processes,
    label: "Procesos",
    description: "Inicia y consulta procesos ocupacionales.",
    permission: "processes:read",
  },
  {
    key: "examRequests",
    to: ROUTES.examRequests,
    label: "Exámenes",
    description: "Solicita exámenes para procesos ocupacionales abiertos.",
    permission: "exam-requests:read",
  },
  {
    key: "appointments",
    to: ROUTES.appointments,
    label: "Citas",
    description: "Programa solicitudes en horarios disponibles.",
    permission: "appointments:read",
  },
  {
    key: "clinicManagement",
    to: ROUTES.clinicManagement,
    label: "Clínicas y horarios",
    description: "Administra clínicas y publica disponibilidad para citas.",
    permission: "clinic-management:manage",
  },
  {
    key: "medicalStaff",
    to: ROUTES.medicalStaff,
    label: "Personal médico",
    description: "Registra profesionales y vincúlalos con una clínica.",
    permission: "medical-staff:manage",
  },
  {
    key: "audit",
    to: ROUTES.audit,
    label: "Auditoría",
    description: "Consulta el registro de actividad del sistema.",
    permission: "audit:read",
  },
  {
    key: "documents",
    to: ROUTES.documents,
    label: "Documentos",
    description: "Consulta el estado de los documentos registrados.",
    permission: "documents:read",
  },
  {
    key: "medicalResults",
    to: ROUTES.medicalResults,
    label: "Resultados médicos",
    description: "Registra resultados y conceptos ocupacionales.",
    permission: "medical-results:read",
  },
  {
    key: "reports",
    to: ROUTES.reports,
    label: "Reportes",
    description: "Consulta indicadores operativos disponibles.",
    permission: "reports:read",
  },
  {
    key: "notifications",
    to: ROUTES.notifications,
    label: "Notificaciones",
    description: "Consulta tus notificaciones.",
    permission: "notifications:read",
  },
  {
    key: "accessControl",
    to: ROUTES.accessControl,
    label: "Permisos por rol",
    description: "Configura los módulos disponibles para cada perfil.",
    permission: "access-control:manage",
  },
  {
    key: "candidatePortal",
    to: ROUTES.candidatePortal,
    label: "Mi proceso",
    description: "Consulta el avance de tu proceso y tus citas ocupacionales.",
    permission: "candidate-portal:read",
  },
];

export const MODULE_PERMISSIONS = Object.fromEntries(
  MODULES.map(({ key, permission }) => [key, permission]),
);

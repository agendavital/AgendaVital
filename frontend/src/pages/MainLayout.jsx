import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES, ROLE_LABELS } from "../constants/roles";
import { ROUTES } from "../constants/routes";
import Button from "../components/ui/Button";

const links = [
  { to: ROUTES.dashboard, label: "Panel", roles: Object.values(ROLES) },
  { to: ROUTES.candidates, label: "Candidatos", roles: [ROLES.ADMIN, ROLES.HR, ROLES.CLINIC] },
  { to: ROUTES.appointments, label: "Citas", roles: [ROLES.ADMIN, ROLES.HR, ROLES.CLINIC, ROLES.DOCTOR] },
  { to: ROUTES.users, label: "Usuarios", roles: [ROLES.ADMIN] },
  { to: ROUTES.documents, label: "Documentos", roles: [ROLES.ADMIN, ROLES.HR, ROLES.CLINIC, ROLES.DOCTOR] },
  { to: ROUTES.medicalResults, label: "Resultados médicos", roles: [ROLES.ADMIN, ROLES.CLINIC, ROLES.DOCTOR] },
  { to: ROUTES.reports, label: "Reportes", roles: [ROLES.ADMIN, ROLES.HR] },
  { to: ROUTES.notifications, label: "Notificaciones", roles: Object.values(ROLES) },
  { to: ROUTES.audit, label: "Auditoría", roles: [ROLES.ADMIN] }
];

export default function MainLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const visibleLinks = links.filter((link) => link.roles.includes(user.role));

  function handleLogout() {
    signOut();
    navigate("/", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <strong>Agenda Vital</strong>
          <span>{ROLE_LABELS[user.role]}</span>
        </div>
        <nav>
          {visibleLinks.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="content-shell">
        <header className="topbar">
          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <Button variant="secondary" onClick={handleLogout}>Cerrar sesion</Button>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

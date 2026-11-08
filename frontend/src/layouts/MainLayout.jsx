import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLE_LABELS } from "../constants/roles";
import { MODULES } from "../constants/navigation";
import Button from "../components/ui/Button";

export default function MainLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const visibleLinks = MODULES.filter((module) => module.roles.includes(user.role));

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
          {visibleLinks.map((module) => (
            <NavLink key={module.key} to={module.to}>
              {module.label}
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

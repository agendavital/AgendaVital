import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLE_LABELS } from "../constants/roles";
import { MODULES } from "../constants/navigation";
import Button from "../components/ui/Button";

export default function MainLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const visibleLinks = MODULES.filter((module) => module.roles.includes(user.role));

  function handleLogout() {
    signOut();
    navigate("/", { replace: true });
  }

  useEffect(() => {
    if (!isNavigationOpen) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") setIsNavigationOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isNavigationOpen]);

  return (
    <div className="app-shell">
      {isNavigationOpen ? (
        <button
          aria-label="Cerrar menú de navegación"
          className="sidebar-backdrop"
          onClick={() => setIsNavigationOpen(false)}
          type="button"
        />
      ) : null}
      <aside
        className={`sidebar${isNavigationOpen ? " sidebar--open" : ""}`}
        id="primary-navigation"
      >
        <div className="sidebar-brand">
          <strong>AgendaVital</strong>
          <span>{ROLE_LABELS[user.role]}</span>
        </div>
        <nav aria-label="Navegación principal">
          {visibleLinks.map((module) => (
            <NavLink
              key={module.key}
              onClick={() => setIsNavigationOpen(false)}
              to={module.to}
            >
              {module.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="content-shell">
        <header className="topbar">
          <button
            aria-controls="primary-navigation"
            aria-expanded={isNavigationOpen}
            aria-label={isNavigationOpen ? "Cerrar menú" : "Abrir menú"}
            className="menu-toggle"
            onClick={() => setIsNavigationOpen((isOpen) => !isOpen)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="topbar-identity">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

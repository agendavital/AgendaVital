import Card from "../components/ui/Card";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLE_LABELS, ROLES } from "../constants/roles";
import { MODULES } from "../constants/navigation";

export default function DashboardPage() {
  const { user } = useAuth();
  const availableModules = MODULES.filter(
    (module) => module.key !== "dashboard" && module.roles.includes(user.role),
  );
  const isAdmin = user.role === ROLES.ADMIN;

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">{ROLE_LABELS[user.role]}</p>
          <h1>
            {isAdmin ? "Panel de administración" : `Panel de ${ROLE_LABELS[user.role]}`}
          </h1>
        </div>
      </div>
      <Card>
        <h2>Bienvenido, {user.name}</h2>
        <p>Estos son los módulos disponibles para tu perfil.</p>
      </Card>
      <div className="metric-grid">
        {availableModules.map((module) => (
          <Card key={module.key}>
            <h2>{module.label}</h2>
            <p>{module.description}</p>
            <Link className="link" to={module.to}>
              Abrir módulo
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}

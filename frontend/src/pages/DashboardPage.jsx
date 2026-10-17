import Card from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
import { ROLE_LABELS } from "../constants/roles";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Panel de AgendaVital</p>
          <h1>Bienvenido, {user.name}</h1>
        </div>
      </div>
      <Card>
        <h2>Sesión iniciada</h2>
        <p>Tu cuenta tiene acceso como {ROLE_LABELS[user.role] ?? "usuario"}.</p>
        <p>Los módulos de gestión se incorporarán en las siguientes etapas del proyecto.</p>
      </Card>
    </section>
  );
}

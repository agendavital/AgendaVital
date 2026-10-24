import DataTable from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import { ROLE_LABELS } from "../constants/roles";
import { users } from "../services/mockData";

export default function UsersPage() {
  const rows = users.map(({ password, ...user }) => ({ ...user, status: "Activo" }));

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Seguridad</p>
          <h1>Usuarios y roles</h1>
        </div>
      </div>
      <DataTable
        rows={rows}
        columns={[
          { key: "name", header: "Nombre" },
          { key: "email", header: "Correo" },
          { key: "role", header: "Rol", render: (row) => ROLE_LABELS[row.role] },
          { key: "status", header: "Estado", render: (row) => <StatusBadge value={row.status} /> }
        ]}
      />
    </section>
  );
}

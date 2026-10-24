import { useSelector } from "react-redux";
import DataTable from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import { formatDate } from "../utils/formatters";

export default function AppointmentsPage() {
  const appointments = useSelector((state) => state.appointments);

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Agenda medica</p>
          <h1>Citas ocupacionales</h1>
        </div>
      </div>
      <DataTable
        rows={appointments}
        emptyMessage="Todavía no hay citas programadas."
        columns={[
          { key: "candidate", header: "Candidato" },
          { key: "doctor", header: "Medico" },
          { key: "date", header: "Fecha", render: (row) => formatDate(row.date) },
          { key: "status", header: "Estado", render: (row) => <StatusBadge value={row.status} /> }
        ]}
      />
    </section>
  );
}

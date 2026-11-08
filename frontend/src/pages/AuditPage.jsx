import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import { fetchAuditLogs } from "../features/data/dataSlice";
import { formatDate } from "../utils/formatters";

export default function AuditPage() {
  const dispatch = useDispatch();
  const auditLogs = useSelector((state) => state.data.auditLogs);

  useEffect(() => {
    dispatch(fetchAuditLogs());
  }, [dispatch]);

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Trazabilidad</p>
          <h1>Auditoria</h1>
        </div>
      </div>
      <DataTable
        rows={auditLogs}
        columns={[
          { key: "actor", header: "Actor" },
          { key: "action", header: "Accion" },
          { key: "date", header: "Fecha", render: (row) => formatDate(row.date) },
          { key: "risk", header: "Riesgo", render: (row) => <StatusBadge value={row.risk} /> }
        ]}
      />
    </section>
  );
}

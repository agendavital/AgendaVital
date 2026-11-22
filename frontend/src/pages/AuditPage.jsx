import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "../components/ui/DataTable";
import { fetchAuditLogs } from "../features/data/dataSlice";
import { formatDate } from "../utils/formatters";
import "../styles/audit.css";

const ENTITY_LABELS = {
  appointments: "Citas",
  candidates: "Candidatos",
  processes: "Procesos",
  "exam-requests": "Solicitudes de examen",
  "medical-staff": "Personal médico",
  "medical-results": "Resultados médicos",
  clinics: "Clínicas",
  availability: "Horarios",
};

const ACTION_LABELS = {
  CREAR: "Creó un registro",
  ACTUALIZAR: "Actualizó un registro",
  ELIMINAR: "Eliminó un registro",
};

export default function AuditPage() {
  const dispatch = useDispatch();
  const auditLogs = useSelector((state) => state.data.auditLogs);
  const status = useSelector((state) => state.data.auditStatus);
  const error = useSelector((state) => state.data.auditError);

  useEffect(() => {
    dispatch(fetchAuditLogs());
  }, [dispatch]);

  return (
    <section className="page-stack audit-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Trazabilidad</p>
          <h1>Auditoría</h1>
          <p className="audit-page__description">
            Consulta las operaciones realizadas por los usuarios en el sistema.
          </p>
        </div>
        <button
          className="button button-secondary"
          type="button"
          onClick={() => dispatch(fetchAuditLogs())}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Actualizando…" : "Actualizar"}
        </button>
      </div>
      {error ? <p className="audit-page__error" role="alert">{error}</p> : null}
      {status === "loading" && auditLogs.length === 0 ? (
        <div className="empty-state">Cargando registros de auditoría…</div>
      ) : (
        <DataTable
          rows={auditLogs}
          columns={[
            { key: "actor", header: "Actor" },
            {
              key: "action",
              header: "Acción",
              render: (row) => ACTION_LABELS[row.action] ?? row.action,
            },
            {
              key: "entity",
              header: "Módulo",
              render: (row) => ENTITY_LABELS[row.entity] ?? row.entity,
            },
            { key: "entityId", header: "Registro", render: (row) => row.entityId ?? "—" },
            { key: "date", header: "Fecha", render: (row) => formatDate(row.date) },
            { key: "ipAddress", header: "Dirección IP", render: (row) => row.ipAddress ?? "—" },
            { key: "detail", header: "Detalle", render: (row) => row.detail ?? "—" },
          ]}
          emptyMessage={status === "failed" ? "No se pudieron cargar los registros." : "Todavía no hay operaciones registradas."}
        />
      )}
    </section>
  );
}

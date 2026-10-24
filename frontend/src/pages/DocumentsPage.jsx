import { useSelector } from "react-redux";
import DataTable from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";

export default function DocumentsPage() {
  const documents = useSelector((state) => state.data.documents);

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Gestion documental segura</p>
          <h1>Documentos</h1>
        </div>
      </div>
      <div className="alert alert-warning">
        Los documentos medicos sensibles deben servirse desde backend con autorizacion, auditoria y enlaces temporales.
      </div>
      <DataTable
        rows={documents}
        columns={[
          { key: "owner", header: "Titular" },
          { key: "type", header: "Tipo" },
          { key: "sensitive", header: "Dato sensible", render: (row) => (row.sensitive ? "Si" : "No") },
          { key: "status", header: "Estado", render: (row) => <StatusBadge value={row.status} /> }
        ]}
      />
    </section>
  );
}

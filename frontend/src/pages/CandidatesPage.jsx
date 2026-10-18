import { useDispatch, useSelector } from "react-redux";
import CandidateForm from "../components/forms/CandidateForm";
import DataTable from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import { candidateAdded } from "../features/candidates/candidatesSlice";
import { usePermissions } from "../hooks/usePermissions";

export default function CandidatesPage() {
  const dispatch = useDispatch();
  const { can } = usePermissions();
  const candidates = useSelector((state) => state.candidates);

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Gestion de procesos</p>
          <h1>Candidatos</h1>
        </div>
      </div>
      {can("candidates:manage") ? (
        <CandidateForm onCreate={(values) => dispatch(candidateAdded(values))} />
      ) : null}
      <DataTable
        rows={candidates}
        columns={[
          { key: "fullName", header: "Candidato" },
          { key: "documentNumber", header: "Documento" },
          { key: "company", header: "Empresa" },
          { key: "status", header: "Estado", render: (row) => <StatusBadge value={row.status} /> },
          { key: "concept", header: "Concepto", render: (row) => <StatusBadge value={row.concept} /> }
        ]}
      />
    </section>
  );
}

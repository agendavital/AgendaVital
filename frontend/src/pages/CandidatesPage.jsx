import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CandidateForm from "../components/forms/CandidateForm";
import DataTable from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import { usePermissions } from "../hooks/usePermissions";
import { 
  loadCandidates,
  registerCandidate
 } from "../features/candidates/candidatesSlice";

export default function CandidatesPage() {
  const dispatch = useDispatch();
  const { can } = usePermissions();

  const {
    items: candidates,
    loading,
    error,
    creating,
    createError,
    createSuccess
  } = useSelector((state) => state.candidates);

  useEffect(() => {
    dispatch(loadCandidates());
  }, [dispatch]);

   return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Gestión de procesos</p>
          <h1>Candidatos</h1>
        </div>
      </div>

      {can("candidates:manage") ? (
        <CandidateForm
          isSubmitting={creating}
          onCreate={async (values) => {
            try {
              await dispatch(registerCandidate(values)).unwrap();
              return true;
            } catch {
              return false;
            }
          }}
        />
      ) : null}

      {createError ? (
        <p className="alert alert-error" role="alert">
          {createError}
        </p>
      ) : null}

      {createSuccess ? (
        <p className="alert alert-success" role="status">
          Candidato creado correctamente.
        </p>
      ) : null}

      {loading ? <p>Cargando candidatos...</p> : null}
      {error ? <p role="alert">{error}</p> : null}

      <DataTable
        rows={candidates}
        columns={[
          { key: "fullName", header: "Candidato" },
          { key: "documentNumber", header: "Documento" },
          { key: "company",
            header: "Empresa", 
            render: (row) => row.company || "Sin asignar" 
          },
          {
            key: "status",
            header: "Estado",
            render: (row) => (
              <StatusBadge value={row.status ?? "Sin proceso"} />
            )
          },
          {
            key: "concept",
            header: "Concepto",
            render: (row) => (
              <StatusBadge value={row.concept ?? "Sin evaluación"} />
            )
          }
        ]}
      />
    </section>
  );
}

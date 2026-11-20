import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import DataTable from "../components/ui/DataTable";
import Field from "../components/ui/Field";
import StatusBadge from "../components/ui/StatusBadge";
import {
  createProcess,
  getProcesses,
  getProcessOptions,
} from "../services/processesService";
import "../styles/processes.css";

const emptyOptions = { candidates: [], companies: [] };

function formatProcessDate(value) {
  if (!value) return "—";

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
  }).format(date);
}

export default function ProcessesPage() {
  const [options, setOptions] = useState(emptyOptions);
  const [processes, setProcesses] = useState([]);
  const [candidateId, setCandidateId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingProcesses, setIsLoadingProcesses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optionsError, setOptionsError] = useState("");
  const [processesError, setProcessesError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [createdProcess, setCreatedProcess] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getProcessOptions()
      .then((data) => {
        if (isMounted) setOptions(data);
      })
      .catch((error) => {
        if (isMounted) {
          setOptionsError(
            error.message ?? "No se pudieron cargar las opciones del proceso.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingOptions(false);
      });

    getProcesses()
      .then((data) => {
        if (isMounted) setProcesses(data);
      })
      .catch((error) => {
        if (isMounted) {
          setProcessesError(
            error.message ?? "No se pudieron cargar los procesos.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingProcesses(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setCreatedProcess(null);
    setIsSubmitting(true);

    try {
      const result = await createProcess({
        candidateId: Number(candidateId),
        companyId: Number(companyId),
      });

      setCreatedProcess(result);
      setCandidateId("");
      setCompanyId("");

      try {
        const updatedProcesses = await getProcesses();
        setProcesses(updatedProcesses);
        setProcessesError("");
      } catch (error) {
        setProcessesError(
          error.message ?? "El proceso se creó, pero no se pudo actualizar la lista.",
        );
      }
    } catch (error) {
      setSubmitError(error.message ?? "No se pudo crear el proceso.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasOptions = options.candidates.length > 0 && options.companies.length > 0;

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Gestión ocupacional</p>
          <h1>Procesos</h1>
          <p className="processes-page__description">
            Administra la vinculación de candidatos con empresas y da seguimiento a sus procesos ocupacionales.
          </p>
        </div>
      </div>

      <form className="form processes-form" onSubmit={handleSubmit}>
        <div className="processes-form__heading">
          <p className="eyebrow">Nuevo proceso</p>
          <h2>Iniciar proceso ocupacional</h2>
          <p>
            Selecciona el candidato y la empresa que participarán en este proceso.
          </p>
        </div>

        {isLoadingOptions ? (
          <p role="status">Cargando candidatos y empresas...</p>
        ) : null}

        {optionsError ? (
          <p className="alert alert-error" role="alert">
            {optionsError}
          </p>
        ) : null}

        {!isLoadingOptions && !optionsError && !hasOptions ? (
          <p className="alert alert-warning" role="status">
            Se necesita al menos un candidato activo y una empresa activa para
            crear un proceso.
          </p>
        ) : null}

        {!isLoadingOptions && !optionsError && hasOptions ? (
          <>
            <div className="processes-form__fields">
              <Field label="Candidato">
                <select
                  required
                  value={candidateId}
                  onChange={(event) => setCandidateId(event.target.value)}
                >
                  <option value="">Selecciona un candidato</option>
                  {options.candidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.fullName} · {candidate.documentType} {candidate.documentNumber}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Empresa">
                <select
                  required
                  value={companyId}
                  onChange={(event) => setCompanyId(event.target.value)}
                >
                  <option value="">Selecciona una empresa</option>
                  {options.companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name} · NIT {company.nit}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {submitError ? (
              <p className="alert alert-error" role="alert">
                {submitError}
              </p>
            ) : null}

            <div className="processes-form__actions">
              <Button
                type="submit"
                disabled={isSubmitting || !candidateId || !companyId}
              >
                {isSubmitting ? "Creando proceso..." : "Crear proceso"}
              </Button>
            </div>
          </>
        ) : null}
      </form>

      {createdProcess ? (
        <div className="alert alert-success processes-success" role="status">
          <strong>Proceso creado correctamente.</strong>
          <span>
            {createdProcess.candidateName} · {createdProcess.company} · Estado:{" "}
            {createdProcess.status}
          </span>
        </div>
      ) : null}

      <section className="processes-list" aria-labelledby="processes-list-title">
        <div className="processes-list__heading">
          <div>
            <h2 id="processes-list-title">Procesos registrados</h2>
            <p>Consulta los procesos ocupacionales y su estado actual.</p>
          </div>
          <span className="processes-list__count">
            {processes.length} {processes.length === 1 ? "proceso" : "procesos"}
          </span>
        </div>

        {isLoadingProcesses ? (
          <p className="processes-list__message" role="status">
            Cargando procesos...
          </p>
        ) : null}

        {processesError ? (
          <p className="alert alert-error" role="alert">
            {processesError}
          </p>
        ) : null}

        {!isLoadingProcesses && (!processesError || processes.length > 0) ? (
          <DataTable
            rows={processes}
            emptyMessage="Todavía no hay procesos registrados."
            columns={[
              { key: "candidateName", header: "Candidato" },
              {
                key: "documentNumber",
                header: "Documento",
                render: (process) =>
                  `${process.documentType} ${process.documentNumber}`,
              },
              { key: "company", header: "Empresa" },
              {
                key: "status",
                header: "Estado",
                render: (process) => <StatusBadge value={process.status} />,
              },
              {
                key: "startDate",
                header: "Fecha de inicio",
                render: (process) => formatProcessDate(process.startDate),
              },
              {
                key: "closeDate",
                header: "Fecha de cierre",
                render: (process) => formatProcessDate(process.closeDate),
              },
            ]}
          />
        ) : null}
      </section>
    </section>
  );
}

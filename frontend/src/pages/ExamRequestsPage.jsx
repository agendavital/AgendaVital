import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import DataTable from "../components/ui/DataTable";
import Field from "../components/ui/Field";
import StatusBadge from "../components/ui/StatusBadge";
import {
  createExamRequests,
  getExamRequestOptions,
  getExamRequests,
} from "../services/examRequestsService";
import "../styles/exam-requests.css";

const emptyOptions = {
  processes: [],
  examTypes: [],
  initialStatusConfigured: false,
};

function formatRequestedAt(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ExamRequestsPage() {
  const [options, setOptions] = useState(emptyOptions);
  const [requests, setRequests] = useState([]);
  const [processId, setProcessId] = useState("");
  const [selectedExamTypeIds, setSelectedExamTypeIds] = useState([]);
  const [observation, setObservation] = useState("");
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optionsError, setOptionsError] = useState("");
  const [requestsError, setRequestsError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    getExamRequestOptions()
      .then((data) => {
        if (isMounted) setOptions(data);
      })
      .catch((error) => {
        if (isMounted) {
          setOptionsError(
            error.message ?? "No se pudieron cargar las opciones.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingOptions(false);
      });

    getExamRequests()
      .then((data) => {
        if (isMounted) setRequests(data);
      })
      .catch((error) => {
        if (isMounted) {
          setRequestsError(
            error.message ?? "No se pudieron cargar las solicitudes.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingRequests(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function toggleExamType(examTypeId) {
    setSelectedExamTypeIds((currentIds) =>
      currentIds.includes(examTypeId)
        ? currentIds.filter((id) => id !== examTypeId)
        : [...currentIds, examTypeId],
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const created = await createExamRequests({
        processId,
        examTypeIds: selectedExamTypeIds,
        observation,
      });

      setSuccessMessage(
        `${created.length} ${created.length === 1 ? "solicitud creada" : "solicitudes creadas"} correctamente.`,
      );
      setProcessId("");
      setSelectedExamTypeIds([]);
      setObservation("");

      try {
        setRequests(await getExamRequests());
        setRequestsError("");
      } catch (error) {
        setRequestsError(
          error.message ??
            "La solicitud se creó, pero no se pudo actualizar la lista.",
        );
      }
    } catch (error) {
      setSubmitError(error.message ?? "No se pudo crear la solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasProcesses = options.processes.length > 0;
  const hasExamTypes = options.examTypes.length > 0;
  const hasInitialStatus = options.initialStatusConfigured;

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Gestión ocupacional</p>
          <h1>Solicitudes de exámenes</h1>
          <p className="exam-requests-page__description">
            Selecciona un proceso y los exámenes que deben realizarse. Cada
            solicitud quedará registrada para su posterior programación.
          </p>
        </div>
      </div>

      <form className="form exam-requests-form" onSubmit={handleSubmit}>
        <div className="exam-requests-form__heading">
          <p className="eyebrow">Nueva solicitud</p>
          <h2>Vincular exámenes al proceso</h2>
          <p>
            El estado inicial y el usuario solicitante se asignan desde el
            servidor.
          </p>
        </div>

        {isLoadingOptions ? (
          <p role="status">Cargando procesos y tipos de examen...</p>
        ) : null}

        {optionsError ? (
          <p className="alert alert-error" role="alert">
            {optionsError}
          </p>
        ) : null}

        {!isLoadingOptions && !optionsError && !hasProcesses ? (
          <p className="alert alert-warning" role="status">
            No hay procesos abiertos disponibles. Crea o revisa un proceso en
            estado pendiente o en proceso.
          </p>
        ) : null}

        {!isLoadingOptions && !optionsError && !hasExamTypes ? (
          <p className="alert alert-warning" role="status">
            No hay tipos de examen activos configurados. Deben agregarse al
            catálogo antes de crear solicitudes.
          </p>
        ) : null}

        {!isLoadingOptions && !optionsError && !hasInitialStatus ? (
          <p className="alert alert-warning" role="status">
            Falta configurar el estado inicial “Solicitada” para habilitar el
            registro.
          </p>
        ) : null}

        {!isLoadingOptions &&
        !optionsError &&
        hasProcesses &&
        hasExamTypes &&
        hasInitialStatus ? (
          <>
            <Field label="Proceso ocupacional">
              <select
                required
                value={processId}
                onChange={(event) => setProcessId(event.target.value)}
              >
                <option value="">Selecciona un proceso</option>
                {options.processes.map((process) => (
                  <option key={process.id} value={process.id}>
                    {process.candidateName} · {process.company} · {process.status}
                  </option>
                ))}
              </select>
            </Field>

            <fieldset className="exam-requests-types">
              <legend>Tipos de examen</legend>
              <p>Selecciona uno o varios tipos para este proceso.</p>
              <div className="exam-requests-types__options">
                {options.examTypes.map((examType) => (
                  <label
                    className="exam-requests-types__option"
                    key={examType.id}
                  >
                    <input
                      type="checkbox"
                      checked={selectedExamTypeIds.includes(examType.id)}
                      onChange={() => toggleExamType(examType.id)}
                    />
                    <span>{examType.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Field label="Observación (opcional)">
              <textarea
                maxLength={1000}
                rows={3}
                value={observation}
                onChange={(event) => setObservation(event.target.value)}
                placeholder="Agrega información útil para programar la atención"
              />
            </Field>

            {submitError ? (
              <p className="alert alert-error" role="alert">
                {submitError}
              </p>
            ) : null}

            <div className="exam-requests-form__actions">
              <Button
                type="submit"
                disabled={
                  isSubmitting || !processId || selectedExamTypeIds.length === 0
                }
              >
                {isSubmitting ? "Enviando solicitud..." : "Solicitar exámenes"}
              </Button>
            </div>
          </>
        ) : null}
      </form>

      {successMessage ? (
        <p className="alert alert-success" role="status">
          {successMessage}
        </p>
      ) : null}

      <section
        className="exam-requests-list"
        aria-labelledby="exam-requests-list-title"
      >
        <div className="exam-requests-list__heading">
          <div>
            <h2 id="exam-requests-list-title">Solicitudes registradas</h2>
            <p>Revisa los exámenes asociados a cada proceso.</p>
          </div>
          <span className="exam-requests-list__count">
            {requests.length} {requests.length === 1 ? "solicitud" : "solicitudes"}
          </span>
        </div>

        {isLoadingRequests ? (
          <p className="exam-requests-list__message" role="status">
            Cargando solicitudes...
          </p>
        ) : null}

        {requestsError ? (
          <p className="alert alert-error" role="alert">
            {requestsError}
          </p>
        ) : null}

        {!isLoadingRequests && (!requestsError || requests.length > 0) ? (
          <DataTable
            rows={requests}
            emptyMessage="Todavía no hay solicitudes de exámenes."
            columns={[
              { key: "candidateName", header: "Candidato" },
              {
                key: "documentNumber",
                header: "Documento",
                render: (request) =>
                  `${request.documentType} ${request.documentNumber}`,
              },
              { key: "company", header: "Empresa" },
              { key: "examType", header: "Examen solicitado" },
              {
                key: "status",
                header: "Estado",
                render: (request) => <StatusBadge value={request.status} />,
              },
              {
                key: "requestedAt",
                header: "Fecha de solicitud",
                render: (request) => formatRequestedAt(request.requestedAt),
              },
            ]}
          />
        ) : null}
      </section>
    </section>
  );
}

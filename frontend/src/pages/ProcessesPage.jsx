import { useEffect, useRef, useState } from "react";
import Button from "../components/ui/Button";
import DataTable from "../components/ui/DataTable";
import Field from "../components/ui/Field";
import StatusBadge from "../components/ui/StatusBadge";
import {
  createProcess,
  getProcesses,
  getProcessOptions,
  getWorkplaceProfile,
  saveWorkplaceProfile,
} from "../services/processesService";
import "../styles/processes.css";

const emptyOptions = { candidates: [], companies: [] };
const emptyWorkplaceProfile = {
  nombreCargo: "",
  funcionesResponsabilidades: "",
  habilidadesCompetencias: "",
  requisitosFisicosMentales: "",
  riesgosLaborales: "",
  medidasPreventivas: "",
  indicadoresEpidemiologicos: "",
  matrizPeligrosRiesgos: "",
  estudiosTecnicos: "",
  indicadoresBiologicos: "",
};

const workplaceProfileFields = [
  ["nombreCargo", "Nombre del cargo", "Ej. Auxiliar de bodega", 1],
  ["funcionesResponsabilidades", "Funciones y responsabilidades", "Describe las tareas y responsabilidades del cargo.", 3],
  ["habilidadesCompetencias", "Habilidades y competencias", "Indica las habilidades y competencias requeridas.", 3],
  ["requisitosFisicosMentales", "Requisitos físicos, mentales y técnicos", "Describe las exigencias necesarias para desempeñar el cargo.", 3],
  ["riesgosLaborales", "Riesgos laborales asociados", "Registra los peligros y factores de exposición identificados.", 3],
  ["medidasPreventivas", "Medidas preventivas", "Describe controles y medidas para proteger la salud y seguridad.", 3],
  ["indicadoresEpidemiologicos", "Indicadores epidemiológicos", "Resume indicadores relacionados con riesgos y condiciones de salud para este cargo; escribe “No aplica” si corresponde.", 3],
  ["matrizPeligrosRiesgos", "Matriz de peligros y valoración de riesgos", "Resume los peligros, la valoración y los controles reflejados en la matriz vigente.", 3],
  ["estudiosTecnicos", "Estudios técnicos adicionales", "Registra estudios pertinentes o escribe “No aplica”.", 3],
  ["indicadoresBiologicos", "Indicadores biológicos", "Registra monitoreos biológicos cuando apliquen o escribe “No aplica”.", 3],
];

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
  const [profileProcessId, setProfileProcessId] = useState("");
  const [workplaceProfile, setWorkplaceProfile] = useState(emptyWorkplaceProfile);
  const [profileIsLoading, setProfileIsLoading] = useState(false);
  const [profileIsSaving, setProfileIsSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const profileRequestId = useRef(0);

  async function handleProfileProcessChange(event) {
    const nextProcessId = event.target.value;
    setProfileProcessId(nextProcessId);
    setWorkplaceProfile(emptyWorkplaceProfile);
    setProfileError("");
    setProfileMessage("");
    const requestId = ++profileRequestId.current;

    if (!nextProcessId) {
      setProfileIsLoading(false);
      return;
    }

    setProfileIsLoading(true);
    try {
      const profile = await getWorkplaceProfile(nextProcessId);
      if (requestId !== profileRequestId.current) return;
      if (profile) {
        const profileValues = Object.fromEntries(
          Object.keys(emptyWorkplaceProfile).map((key) => [key, profile[key]]),
        );
        setWorkplaceProfile({ ...emptyWorkplaceProfile, ...profileValues });
        setProfileMessage(
          `Información registrada el ${new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(profile.registradoEn))}.`,
        );
      }
    } catch (error) {
      if (requestId === profileRequestId.current) {
        setProfileError(error.message ?? "No se pudo cargar la información del cargo.");
      }
    } finally {
      if (requestId === profileRequestId.current) setProfileIsLoading(false);
    }
  }

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

  async function handleWorkplaceProfileSubmit(event) {
    event.preventDefault();
    setProfileError("");
    setProfileMessage("");
    setProfileIsSaving(true);

    try {
      const result = await saveWorkplaceProfile(profileProcessId, workplaceProfile);
      setProfileMessage(
        `${result.message} ${new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(result.registradoEn))}.`,
      );
    } catch (error) {
      setProfileError(error.message ?? "No se pudo guardar la información del cargo.");
    } finally {
      setProfileIsSaving(false);
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

      <section className="workplace-profile" aria-labelledby="workplace-profile-title">
        <div className="workplace-profile__heading">
          <p className="eyebrow">Información para la evaluación</p>
          <h2 id="workplace-profile-title">Perfil del cargo y riesgos laborales</h2>
          <p>
            Registra la información que la empresa entrega para contextualizar la evaluación ocupacional. En los campos que no correspondan, escribe “No aplica”.
          </p>
          <small>Referencia funcional: Resolución 1843 de 2025, artículo 16. Este registro no reemplaza la entrega de documentos soporte.</small>
        </div>

        {processes.length === 0 ? (
          <p className="alert alert-warning" role="status">Primero crea un proceso ocupacional para asociar la información del cargo.</p>
        ) : (
          <form className="workplace-profile__form" onSubmit={handleWorkplaceProfileSubmit}>
            <Field label="Proceso ocupacional">
              <select
                required
                value={profileProcessId}
                onChange={handleProfileProcessChange}
              >
                <option value="">Selecciona un proceso</option>
                {processes.map((process) => (
                  <option key={process.id} value={process.id}>
                    {process.candidateName} · {process.company} · {process.status}
                  </option>
                ))}
              </select>
            </Field>

            {profileIsLoading ? <p role="status">Cargando información del cargo...</p> : null}
            {profileError ? <p className="alert alert-error" role="alert">{profileError}</p> : null}
            {profileMessage ? <p className="alert alert-success" role="status">{profileMessage}</p> : null}

            {profileProcessId ? (
              <>
                <div className="workplace-profile__fields">
                  {workplaceProfileFields.map(([name, label, placeholder, rows]) => (
                    <Field key={name} label={label}>
                      {rows === 1 ? (
                        <input
                          required
                          maxLength={120}
                          value={workplaceProfile[name]}
                          onChange={(event) => setWorkplaceProfile((current) => ({ ...current, [name]: event.target.value }))}
                          placeholder={placeholder}
                        />
                      ) : (
                        <textarea
                          required
                          maxLength={5000}
                          rows={rows}
                          value={workplaceProfile[name]}
                          onChange={(event) => setWorkplaceProfile((current) => ({ ...current, [name]: event.target.value }))}
                          placeholder={placeholder}
                        />
                      )}
                    </Field>
                  ))}
                </div>
                <div className="processes-form__actions">
                  <Button type="submit" disabled={profileIsLoading || profileIsSaving}>
                    {profileIsSaving ? "Guardando información..." : "Guardar información del cargo"}
                  </Button>
                </div>
              </>
            ) : null}
          </form>
        )}
      </section>
    </section>
  );
}

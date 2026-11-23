import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import DataTable from "../components/ui/DataTable";
import Field from "../components/ui/Field";
import {
  acknowledgeWorkplaceProfile,
  createEvaluation,
  getEvaluationOptions,
  getEvaluations,
} from "../services/evaluacionesService";
import "../styles/medical-results.css";

const emptyOptions = {
  professionalConfigured: false,
  concepts: [],
  appointments: [],
};

const emptyForm = {
  citaId: "",
  conceptoOcupacionalId: "",
  resultadoResumen: "",
  hallazgos: "",
  observacionClinica: "",
  restriccion: "",
  reportaMedicamentos: "no",
  medicamentos: [],
  medicamentosRevisados: false,
};

const emptyMedication = { nombre: "", dosis: "", frecuencia: "" };

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function MedicalResultsPage() {
  const [options, setOptions] = useState(emptyOptions);
  const [evaluations, setEvaluations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingReceipt, setIsConfirmingReceipt] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");

  async function refresh() {
    const [formOptions, rows] = await Promise.all([
      getEvaluationOptions(),
      getEvaluations(),
    ]);
    setOptions(formOptions);
    setEvaluations(rows);
  }

  useEffect(() => {
    let isMounted = true;
    Promise.all([getEvaluationOptions(), getEvaluations()])
      .then(([formOptions, rows]) => {
        if (!isMounted) return;
        setOptions(formOptions);
        setEvaluations(rows);
      })
      .catch((error) => {
        if (isMounted)
          setLoadError(
            error.message ?? "No se pudieron cargar los resultados.",
          );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setSuccess("");
    setIsSaving(true);
    try {
      const { reportaMedicamentos, ...evaluationForm } = form;
      const evaluation = await createEvaluation({
        ...evaluationForm,
        conceptoOcupacionalId: Number(form.conceptoOcupacionalId),
        tomaMedicamentos: reportaMedicamentos === "si",
        medicamentos:
          reportaMedicamentos === "si"
            ? form.medicamentos
                .filter((medication) => medication.nombre.trim())
                .map((medication) => ({
                  nombre: medication.nombre.trim(),
                  dosis: medication.dosis.trim() || undefined,
                  frecuencia: medication.frecuencia.trim() || undefined,
                }))
            : [],
        hallazgos: form.hallazgos || undefined,
        observacionClinica: form.observacionClinica || undefined,
        restriccion: form.restriccion || undefined,
      });
      setForm(emptyForm);
      setSuccess(
        `Resultado de ${evaluation.candidato} registrado correctamente.`,
      );
      await refresh();
    } catch (error) {
      setSubmitError(error.message ?? "No se pudo registrar el resultado.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmWorkplaceProfile() {
    if (!form.citaId) return;
    setSubmitError("");
    setSuccess("");
    setIsConfirmingReceipt(true);
    try {
      const result = await acknowledgeWorkplaceProfile(form.citaId);
      setSuccess(result.message);
      try {
        setOptions(await getEvaluationOptions());
      } catch {
        setSubmitError(
          "La recepción se confirmó, pero no se pudo actualizar la pantalla. Recarga para continuar.",
        );
      }
    } catch (error) {
      setSubmitError(
        error.message ?? "No se pudo confirmar la recepción del perfil.",
      );
    } finally {
      setIsConfirmingReceipt(false);
    }
  }

  const canOpenEvaluation =
    options.professionalConfigured &&
    options.concepts.length > 0 &&
    options.appointments.length > 0;
  const selectedAppointment = options.appointments.find(
    (appointment) => appointment.id === form.citaId,
  );
  const workplaceProfile = selectedAppointment?.perfilCargo;
  const hasReceivedWorkplaceProfile = Boolean(workplaceProfile?.recibidoPorMi);

  return (
    <section className="page-stack medical-results">
      <div className="page-header">
        <div>
          <p className="eyebrow">Atención médica ocupacional</p>
          <h1>Resultados y conceptos</h1>
          <p className="medical-results__description">
            Registra el resultado de una cita atendida y el concepto emitido por
            el profesional.
          </p>
        </div>
      </div>

      {loadError ? (
        <p className="alert alert-error" role="alert">
          {loadError}
        </p>
      ) : null}
      {success ? (
        <p className="alert alert-success" role="status">
          {success}
        </p>
      ) : null}
      {isLoading ? <p role="status">Cargando citas y conceptos...</p> : null}

      {!isLoading && !loadError && !options.professionalConfigured ? (
        <p className="alert alert-warning" role="status">
          Tu cuenta aún no está vinculada a un perfil profesional activo. Pide
          al administrador que te registre en Personal médico.
        </p>
      ) : null}
      {!isLoading &&
      options.professionalConfigured &&
      options.concepts.length === 0 ? (
        <p className="alert alert-warning" role="status">
          No hay conceptos ocupacionales configurados en la base de datos. Deben
          cargarse en el catálogo antes de registrar resultados.
        </p>
      ) : null}
      {!isLoading &&
      options.professionalConfigured &&
      options.concepts.length > 0 &&
      options.appointments.length === 0 ? (
        <p className="alert alert-warning" role="status">
          No hay citas atendidas pendientes de evaluación en tu clínica. La cita
          debe finalizar antes de registrar su resultado.
        </p>
      ) : null}

      {canOpenEvaluation ? (
        <section
          className="medical-results__section"
          aria-labelledby="evaluation-form-title"
        >
          <div className="medical-results__heading">
            <p className="eyebrow">Nueva evaluación</p>
            <h2 id="evaluation-form-title">Registrar resultado ocupacional</h2>
            <p>
              La cita debe haber finalizado. El sistema la vincula con tu perfil
              médico y la clínica asignada.
            </p>
          </div>

          <form className="form medical-results__form" onSubmit={handleSubmit}>
            <Field label="Cita atendida">
              <select
                required
                value={form.citaId}
                onChange={(event) =>
                  setForm({ ...form, citaId: event.target.value })
                }
              >
                <option value="">Selecciona una cita</option>
                {options.appointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {appointment.candidato} · {appointment.examen} ·{" "}
                    {formatDateTime(appointment.citaEn)}
                  </option>
                ))}
              </select>
            </Field>

            {form.citaId && !workplaceProfile ? (
              <p className="alert alert-warning" role="status">
                La empresa aún no registra el perfil del cargo. Debe completarlo
                en Procesos antes de continuar con el resultado.
              </p>
            ) : null}

            {workplaceProfile ? (
              <section
                className="medical-results__workplace-profile"
                aria-labelledby="workplace-profile-review-title"
              >
                <div>
                  <h3 id="workplace-profile-review-title">
                    Información del cargo: {workplaceProfile.nombreCargo}
                  </h3>
                  <p>
                    Revisa esta información antes de registrar el resultado de
                    la evaluación.
                  </p>
                </div>
                <dl className="medical-results__workplace-profile-details">
                  <div><dt>Funciones y responsabilidades</dt><dd>{workplaceProfile.funcionesResponsabilidades}</dd></div>
                  <div><dt>Habilidades y competencias</dt><dd>{workplaceProfile.habilidadesCompetencias}</dd></div>
                  <div><dt>Requisitos físicos, mentales y técnicos</dt><dd>{workplaceProfile.requisitosFisicosMentales}</dd></div>
                  <div><dt>Riesgos laborales</dt><dd>{workplaceProfile.riesgosLaborales}</dd></div>
                  <div><dt>Medidas preventivas</dt><dd>{workplaceProfile.medidasPreventivas}</dd></div>
                  <div><dt>Indicadores epidemiológicos</dt><dd>{workplaceProfile.indicadoresEpidemiologicos}</dd></div>
                  <div><dt>Matriz de peligros y riesgos</dt><dd>{workplaceProfile.matrizPeligrosRiesgos}</dd></div>
                  <div><dt>Estudios técnicos adicionales</dt><dd>{workplaceProfile.estudiosTecnicos}</dd></div>
                  <div><dt>Indicadores biológicos</dt><dd>{workplaceProfile.indicadoresBiologicos}</dd></div>
                </dl>
                {hasReceivedWorkplaceProfile ? (
                  <p className="alert alert-success" role="status">
                    Recepción confirmada en esta cuenta el{" "}
                    {formatDateTime(workplaceProfile.recibidoEn)}.
                  </p>
                ) : (
                  <div className="medical-results__receipt-action">
                    <p className="alert alert-warning" role="status">
                      Confirma la recepción después de verificar el perfil. El
                      sistema solicitará esta confirmación antes de guardar el
                      resultado.
                    </p>
                    <Button
                      type="button"
                      disabled={isConfirmingReceipt}
                      onClick={handleConfirmWorkplaceProfile}
                    >
                      {isConfirmingReceipt
                        ? "Confirmando recepción..."
                        : "Confirmar recepción del perfil"}
                    </Button>
                  </div>
                )}
              </section>
            ) : null}

            {hasReceivedWorkplaceProfile ? (
              <>

            <Field label="Concepto ocupacional">
              <select
                required
                value={form.conceptoOcupacionalId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    conceptoOcupacionalId: event.target.value,
                  })
                }
              >
                <option value="">Selecciona un concepto</option>
                {options.concepts.map((concept) => (
                  <option key={concept.id} value={concept.id}>
                    {concept.nombre}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Resumen del resultado">
              <textarea
                required
                minLength={3}
                maxLength={2000}
                rows={4}
                value={form.resultadoResumen}
                onChange={(event) =>
                  setForm({ ...form, resultadoResumen: event.target.value })
                }
              />
            </Field>
            <div className="medical-results__fields">
              <Field label="Hallazgos (opcional)">
                <textarea
                  rows={4}
                  value={form.hallazgos}
                  onChange={(event) =>
                    setForm({ ...form, hallazgos: event.target.value })
                  }
                />
              </Field>
              <Field label="Observación clínica (opcional)">
                <textarea
                  rows={4}
                  value={form.observacionClinica}
                  onChange={(event) =>
                    setForm({ ...form, observacionClinica: event.target.value })
                  }
                />
              </Field>
            </div>
            <section
              className="medical-results__medications"
              aria-labelledby="medications-title"
            >
              <div>
                <h3 id="medications-title">Medicamentos reportados</h3>
                <p>
                  Registra lo que informa el paciente y confirma que revisaste
                  la lista. El sistema no recomienda ni deduce tratamientos.
                </p>
              </div>
              <Field label="¿El paciente reporta medicamentos actuales?">
                <select
                  required
                  value={form.reportaMedicamentos}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      reportaMedicamentos: event.target.value,
                      medicamentos:
                        event.target.value === "si"
                          ? form.medicamentos.length
                            ? form.medicamentos
                            : [{ ...emptyMedication }]
                          : [],
                      medicamentosRevisados: false,
                    })
                  }
                >
                  <option value="no">No reporta medicamentos</option>
                  <option value="si">Sí, reporta medicamentos</option>
                </select>
              </Field>
              {form.reportaMedicamentos === "si" ? (
                <div className="medical-results__medication-list">
                  {form.medicamentos.map((medication, index) => (
                    <div
                      className="medical-results__medication-row"
                      key={index}
                    >
                      <Field label={`Medicamento ${index + 1}`}>
                        <input
                          required
                          maxLength={160}
                          value={medication.nombre}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              medicamentos: form.medicamentos.map(
                                (item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, nombre: event.target.value }
                                    : item,
                              ),
                            })
                          }
                        />
                      </Field>
                      <Field label="Dosis (opcional)">
                        <input
                          maxLength={120}
                          value={medication.dosis}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              medicamentos: form.medicamentos.map(
                                (item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, dosis: event.target.value }
                                    : item,
                              ),
                            })
                          }
                        />
                      </Field>
                      <Field label="Frecuencia (opcional)">
                        <input
                          maxLength={120}
                          value={medication.frecuencia}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              medicamentos: form.medicamentos.map(
                                (item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        frecuencia: event.target.value,
                                      }
                                    : item,
                              ),
                            })
                          }
                        />
                      </Field>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={form.medicamentos.length === 1}
                        onClick={() =>
                          setForm({
                            ...form,
                            medicamentos: form.medicamentos.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          })
                        }
                      >
                        Quitar
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={form.medicamentos.length >= 20}
                    onClick={() =>
                      setForm({
                        ...form,
                        medicamentos: [
                          ...form.medicamentos,
                          { ...emptyMedication },
                        ],
                      })
                    }
                  >
                    Agregar medicamento
                  </Button>
                </div>
              ) : null}
              <label className="medical-results__medication-confirmation">
                <input
                  type="checkbox"
                  required
                  checked={form.medicamentosRevisados}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      medicamentosRevisados: event.target.checked,
                    })
                  }
                />
                <span>
                  {form.reportaMedicamentos === "si"
                    ? "Confirmo que revisé esta lista con el paciente."
                    : "Confirmo que consulté al paciente y no reporta medicamentos actuales."}
                </span>
              </label>
            </section>
            <Field label="Restricción ocupacional (opcional)">
              <textarea
                maxLength={5000}
                rows={3}
                value={form.restriccion}
                onChange={(event) =>
                  setForm({ ...form, restriccion: event.target.value })
                }
              />
            </Field>

            {submitError ? (
              <p className="alert alert-error" role="alert">
                {submitError}
              </p>
            ) : null}
            <div className="medical-results__actions">
              <Button
                type="submit"
                disabled={
                  isSaving || !form.citaId || !form.conceptoOcupacionalId
                }
              >
                {isSaving ? "Guardando resultado..." : "Guardar resultado"}
              </Button>
            </div>
              </>
            ) : null}
          </form>
        </section>
      ) : null}

      <section
        className="medical-results__list"
        aria-labelledby="evaluation-list-title"
      >
        <div className="medical-results__list-heading">
          <div>
            <h2 id="evaluation-list-title">Evaluaciones registradas</h2>
            <p>Resultados asociados a citas de tu clínica.</p>
          </div>
          <span className="medical-results__count">
            {evaluations.length}{" "}
            {evaluations.length === 1 ? "evaluación" : "evaluaciones"}
          </span>
        </div>
        {!isLoading ? (
          <DataTable
            rows={evaluations}
            emptyMessage="Todavía no hay evaluaciones registradas."
            columns={[
              { key: "candidato", header: "Candidato" },
              { key: "examen", header: "Examen" },
              { key: "concepto", header: "Concepto" },
              { key: "resultadoResumen", header: "Resumen" },
              {
                key: "medicamentos",
                header: "Medicamentos revisados",
                render: (evaluation) => {
                  if (typeof evaluation.tomaMedicamentos !== "boolean") {
                    return "Sin información histórica";
                  }

                  const reviewStatus = evaluation.medicamentosRevisados
                    ? "Revisión confirmada"
                    : "Revisión pendiente";

                  if (!evaluation.tomaMedicamentos) {
                    return `No reporta · ${reviewStatus}`;
                  }

                  const medicationSummary = evaluation.medicamentos
                    .map((medication) =>
                      [
                        medication.nombre,
                        medication.dosis,
                        medication.frecuencia,
                      ]
                        .filter(Boolean)
                        .join(" · "),
                    )
                    .join(", ");

                  return medicationSummary
                    ? `${medicationSummary} · ${reviewStatus}`
                    : `Sin medicamentos detallados · ${reviewStatus}`;
                },
              },
              {
                key: "citaEn",
                header: "Cita",
                render: (evaluation) => formatDateTime(evaluation.citaEn),
              },
              {
                key: "evaluadaEn",
                header: "Evaluada",
                render: (evaluation) => formatDateTime(evaluation.evaluadaEn),
              },
            ]}
          />
        ) : null}
      </section>
    </section>
  );
}
